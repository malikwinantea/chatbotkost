import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ message: "Anda harus login terlebih dahulu." }, { status: 401 });
        }

        const formData = await req.formData();

        const nama_penyewa = formData.get("nama_lengkap") as string;
        const no_wa_penyewa = formData.get("no_wa") as string;
        const kost_tujuan = formData.get("kost_tujuan") as string;
        const tipe_kamar = formData.get("tipe_kamar") as string;
        const no_kamar = formData.get("no_kamar") as string;
        const tgl_masuk = formData.get("tgl_masuk") as string;
        const durasi_unit = formData.get("durasi_unit") as string;
        const durasi_jumlah = parseInt(formData.get("durasi_jumlah") as string) || 1;
        const buktiFile = formData.get("bukti_bayar") as File | null;
        const ktpFile = formData.get("foto_ktp") as File | null;

        if (!nama_penyewa || !no_wa_penyewa || !kost_tujuan || !tipe_kamar || !no_kamar || !tgl_masuk || !durasi_unit) {
            return NextResponse.json({ message: "Semua kolom wajib diisi." }, { status: 400 });
        }
        if (!ktpFile) {
            return NextResponse.json({ message: "Foto KTP penyewa wajib diunggah." }, { status: 400 });
        }
        if (!buktiFile) {
            return NextResponse.json({ message: "Bukti transfer Deposit wajib diunggah." }, { status: 400 });
        }

        // Save uploaded files
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        await mkdir(uploadDir, { recursive: true });

        const timestamp = Date.now();
        const buktiFileName = `deposit_${session.user.id}_${timestamp}_${buktiFile.name}`;
        const buktiBuffer = Buffer.from(await buktiFile.arrayBuffer());
        await writeFile(path.join(uploadDir, buktiFileName), buktiBuffer);

        const ktpFileName = `ktp_${session.user.id}_${timestamp}_${ktpFile.name}`;
        const ktpBuffer = Buffer.from(await ktpFile.arrayBuffer());
        await writeFile(path.join(uploadDir, ktpFileName), ktpBuffer);

        // Update foto_ktp on user profile alongside just in case
        await prisma.user.update({
            where: { id: session.user.id },
            data: { foto_ktp: `/uploads/${ktpFileName}` },
        });

        // Find the specific room by no_kamar
        const isDaisy = kost_tujuan === "DAISY";

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let selectedRoom: any = null;

        if (isDaisy) {
            const room = await prisma.kamarDaisy.findFirst({
                where: { no_kamar: no_kamar, tipe_kamar: tipe_kamar, status: "TERSEDIA" },
            });
            if (room) selectedRoom = room;
        } else {
            const room = await prisma.kamarCamellia.findFirst({
                where: { no_kamar: no_kamar, tipe_kamar: tipe_kamar, status: "TERSEDIA" },
            });
            if (room) selectedRoom = room;
        }

        if (!selectedRoom) {
            return NextResponse.json({ message: `Maaf, kamar ${no_kamar} (${tipe_kamar}) tidak tersedia saat ini.` }, { status: 400 });
        }

        // Calculate total price & exit date
        const entryDate = new Date(tgl_masuk);
        let totalHarga = 0;
        const exitDate = new Date(entryDate);

        const unitMap: Record<string, string> = { "Harian": "HARIAN", "Mingguan": "MINGGUAN", "Bulanan": "BULANAN" };
        const durasiEnum = unitMap[durasi_unit] || "BULANAN";

        if (durasiEnum === "BULANAN") {
            totalHarga = selectedRoom.harga_perbulan * durasi_jumlah;
            exitDate.setMonth(exitDate.getMonth() + durasi_jumlah);
        } else if (durasiEnum === "MINGGUAN") {
            totalHarga = selectedRoom.harga_perminggu * durasi_jumlah;
            exitDate.setDate(exitDate.getDate() + (durasi_jumlah * 7));
        } else {
            totalHarga = selectedRoom.harga_perhari * durasi_jumlah;
            exitDate.setDate(exitDate.getDate() + durasi_jumlah);
        }

        // Create reservation record
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const reservasi = await (prisma.reservasi as any).create({
            data: {
                id_user: session.user.id,
                kost_tujuan: isDaisy ? "DAISY" : "CAMELLIA",
                id_kamar_daisy: isDaisy ? selectedRoom.id : null,
                id_kamar_camellia: !isDaisy ? selectedRoom.id : null,
                tgl_masuk: entryDate,
                tgl_keluar: exitDate,
                durasi_sewa_unit: durasiEnum,
                durasi_sewa_jumlah: durasi_jumlah,
                total_harga: totalHarga,
                nama_penyewa: nama_penyewa,
                no_wa_penyewa: no_wa_penyewa,
                foto_ktp: `/uploads/${ktpFileName}`,
                bukti_bayar_dp: `/uploads/${buktiFileName}`,
                status_pembayaran: "PENDING",
                status_reservasi: "MENUNGGU",
            },
        });

        return NextResponse.json({
            message: "Reservasi berhasil diajukan! Silakan tunggu konfirmasi admin maksimal 1x24 jam.",
            reservasi: {
                id: reservasi.id_reservasi,
                no_kamar: selectedRoom.no_kamar,
                kost: kost_tujuan,
                total_harga: totalHarga,
            },
        }, { status: 201 });

    } catch (error: unknown) {
        console.error("Reserve API Error:", error);
        return NextResponse.json({ message: "Terjadi kesalahan pada server.", error: (error as Error).message }, { status: 500 });
    }
}
