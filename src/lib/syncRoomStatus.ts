import prisma from "./prisma";

/**
 * Checks all active reservations and updates the associated room status
 * from BOOKED to TERISI if the rental period (tgl_masuk) has started.
 */
export async function syncRoomStatuses() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Find all active reservations
        const activeReservations = await prisma.reservasi.findMany({
            where: {
                status_reservasi: "AKTIF",
            },
        });

        for (const res of activeReservations) {
            // If the start date is today or in the past
            if (res.tgl_masuk <= today) {
                if (res.kost_tujuan === "DAISY" && res.id_kamar_daisy) {
                    // Check current status
                    const room = await prisma.kamarDaisy.findUnique({
                        where: { id: res.id_kamar_daisy },
                        select: { status: true },
                    });

                    if (room && room.status === "BOOKED") {
                        await prisma.kamarDaisy.update({
                            where: { id: res.id_kamar_daisy },
                            data: { status: "TERISI" },
                        });
                    }
                } else if (res.kost_tujuan === "CAMELLIA" && res.id_kamar_camellia) {
                    // Check current status
                    const room = await prisma.kamarCamellia.findUnique({
                        where: { id: res.id_kamar_camellia },
                        select: { status: true },
                    });

                    if (room && room.status === "BOOKED") {
                        await prisma.kamarCamellia.update({
                            where: { id: res.id_kamar_camellia },
                            data: { status: "TERISI" },
                        });
                    }
                }
            }
        }

    } catch (error) {
        console.error("Error syncing room statuses:", error);
    }
}
