import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

// PUT: Approve, Reject, or Edit a reservation
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id || session.user.role !== "ADMIN") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const { action, tgl_masuk, tgl_keluar, durasi_sewa_jumlah, durasi_sewa_unit } = body;

        const reservasi = await prisma.reservasi.findUnique({ where: { id_reservasi: id } });
        if (!reservasi) {
            return NextResponse.json({ message: "Reservasi tidak ditemukan." }, { status: 404 });
        }

        // APPROVE action
        if (action === "approve") {
            // Update reservation status
            await prisma.reservasi.update({
                where: { id_reservasi: id },
                data: {
                    status_pembayaran: "LUNAS",
                    status_reservasi: "AKTIF",
                },
            });

            // Update room status to BOOKED
            if (reservasi.kost_tujuan === "DAISY" && reservasi.id_kamar_daisy) {
                await prisma.kamarDaisy.update({
                    where: { id: reservasi.id_kamar_daisy },
                    data: { status: "BOOKED" },
                });
            } else if (reservasi.kost_tujuan === "CAMELLIA" && reservasi.id_kamar_camellia) {
                await prisma.kamarCamellia.update({
                    where: { id: reservasi.id_kamar_camellia },
                    data: { status: "BOOKED" },
                });
            }

            return NextResponse.json({ message: "Reservasi disetujui! Kamar kini berstatus BOOKED." });
        }

        // REJECT action
        if (action === "reject") {
            await prisma.reservasi.update({
                where: { id_reservasi: id },
                data: {
                    status_pembayaran: "DITOLAK",
                    status_reservasi: "DIBATALKAN",
                },
            });
            return NextResponse.json({ message: "Reservasi ditolak." });
        }

        // EDIT action (update dates / duration / explicit data / room)
        if (action === "edit") {
            const { nama_penyewa, no_wa_penyewa, id_kamar } = body;
            const updateData: Record<string, unknown> = {};
            if (tgl_masuk) updateData.tgl_masuk = new Date(tgl_masuk);
            if (tgl_keluar) updateData.tgl_keluar = new Date(tgl_keluar);
            if (durasi_sewa_jumlah) updateData.durasi_sewa_jumlah = durasi_sewa_jumlah;
            if (durasi_sewa_unit) updateData.durasi_sewa_unit = durasi_sewa_unit;
            if (nama_penyewa) updateData.nama_penyewa = nama_penyewa;
            if (no_wa_penyewa) updateData.no_wa_penyewa = no_wa_penyewa;

            // Room reallocation logic
            if (id_kamar) {
                if (reservasi.kost_tujuan === "DAISY") {
                    if (reservasi.id_kamar_daisy !== id_kamar) {
                        if (reservasi.id_kamar_daisy) {
                            await prisma.kamarDaisy.update({ where: { id: reservasi.id_kamar_daisy }, data: { status: "TERSEDIA" } });
                        }
                        await prisma.kamarDaisy.update({ where: { id: id_kamar }, data: { status: "TERISI" } });
                        updateData.id_kamar_daisy = id_kamar;
                    }
                } else if (reservasi.kost_tujuan === "CAMELLIA") {
                    if (reservasi.id_kamar_camellia !== id_kamar) {
                        if (reservasi.id_kamar_camellia) {
                            await prisma.kamarCamellia.update({ where: { id: reservasi.id_kamar_camellia }, data: { status: "TERSEDIA" } });
                        }
                        await prisma.kamarCamellia.update({ where: { id: id_kamar }, data: { status: "TERISI" } });
                        updateData.id_kamar_camellia = id_kamar;
                    }
                }
            }

            const updated = await prisma.reservasi.update({
                where: { id_reservasi: id },
                data: updateData,
            });
            return NextResponse.json({ message: "Data reservasi diperbarui.", reservasi: updated });
        }

        return NextResponse.json({ message: "Action tidak valid. Gunakan 'approve', 'reject', atau 'edit'." }, { status: 400 });
    } catch (error: unknown) {
        console.error("Admin Reservasi PUT Error:", error);
        return NextResponse.json({ message: "Server error.", error: (error as Error).message }, { status: 500 });
    }
}

// DELETE: Remove a tenant / End lease
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id || session.user.role !== "ADMIN") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const reservasi = await prisma.reservasi.findUnique({ where: { id_reservasi: id } });
        if (!reservasi) {
            return NextResponse.json({ message: "Reservasi tidak ditemukan." }, { status: 404 });
        }

        // Free up the room
        if (reservasi.kost_tujuan === "DAISY" && reservasi.id_kamar_daisy) {
            await prisma.kamarDaisy.update({
                where: { id: reservasi.id_kamar_daisy },
                data: { status: "TERSEDIA" },
            });
        } else if (reservasi.kost_tujuan === "CAMELLIA" && reservasi.id_kamar_camellia) {
            await prisma.kamarCamellia.update({
                where: { id: reservasi.id_kamar_camellia },
                data: { status: "TERSEDIA" },
            });
        }

        // Mark reservation as finished
        await prisma.reservasi.update({
            where: { id_reservasi: id },
            data: { status_reservasi: "SELESAI" },
        });

        return NextResponse.json({ message: "Penyewa berhasil dihapus dan kamar dikosongkan." });
    } catch (error: unknown) {
        console.error("Admin Reservasi DELETE Error:", error);
        return NextResponse.json({ message: "Server error.", error: (error as Error).message }, { status: 500 });
    }
}
