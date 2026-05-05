import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { syncRoomStatuses } from "@/lib/syncRoomStatus";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id || session.user.role !== "ADMIN") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // Sinkronisasi status kamar sebelum mengambil data
        await syncRoomStatuses();

        // Reservasi menunggu konfirmasi
        const pendingReservations = await prisma.reservasi.findMany({
            where: { status_reservasi: "MENUNGGU" },
            include: { user: { select: { id: true, nama: true, nama_belakang: true, email: true, no_telp: true, foto_ktp: true } } },
            orderBy: { created_at: "desc" },
        });

        // Penyewa aktif
        const activeReservations = await prisma.reservasi.findMany({
            where: { status_reservasi: "AKTIF" },
            include: { user: { select: { id: true, nama: true, nama_belakang: true, email: true, no_telp: true, foto_ktp: true } } },
            orderBy: { created_at: "desc" },
        });

        // All rooms
        const daisyRooms = await prisma.kamarDaisy.findMany({ orderBy: { no_kamar: "asc" } });
        const camelliaRooms = await prisma.kamarCamellia.findMany({ orderBy: { no_kamar: "asc" } });

        // Total pendapatan (dari reservasi AKTIF & SELESAI)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const allActive = await (prisma.reservasi as any).findMany({
            where: { status_reservasi: { in: ["AKTIF", "SELESAI"] } },
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const totalPendapatan = allActive.reduce((sum: number, r: any) => sum + (r.total_harga || 0), 0);

        // Alert: sewa expires within 7 days
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const expiringTenants = activeReservations.filter((r: any) => {
            if (!r.tgl_keluar) return false;
            return new Date(r.tgl_keluar) <= sevenDaysFromNow;
        });

        return NextResponse.json({
            pendingReservations,
            activeReservations,
            daisyRooms,
            camelliaRooms,
            totalPendapatan,
            expiringTenants,
            stats: {
                totalDaisyRooms: daisyRooms.length,
                availableDaisy: daisyRooms.filter((r) => r.status === "TERSEDIA").length,
                totalCamelliaRooms: camelliaRooms.length,
                availableCamellia: camelliaRooms.filter((r) => r.status === "TERSEDIA").length,
                totalPenyewaAktif: activeReservations.length,
                totalMenunggu: pendingReservations.length,
            },
        });
    } catch (error: unknown) {
        console.error("Admin Dashboard Error:", error);
        return NextResponse.json({ message: "Server error", error: (error as Error).message }, { status: 500 });
    }
}
