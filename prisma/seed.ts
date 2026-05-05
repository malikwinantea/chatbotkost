import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');

    // Data Kamar Daisy
    const daisyRooms = [
        ...[13, 14, 15, 16, 19, 20, 21, 22, 23].map((no) => ({
            no_kamar: no.toString(),
            tipe_kamar: 'A',
            lantai: no <= 12 ? 1 : 2,
            harga_perbulan: 700000,
            harga_perminggu: 300000,
            harga_perhari: 100000,
        })),
        ...[17, 18].map((no) => ({
            no_kamar: no.toString(),
            tipe_kamar: 'A Spesial',
            lantai: no <= 12 ? 1 : 2,
            harga_perbulan: 750000,
            harga_perminggu: 300000,
            harga_perhari: 100000,
        })),
        ...[1, 2, 3, 4, 5, 8, 9, 10, 11].map((no) => ({
            no_kamar: no.toString(),
            tipe_kamar: 'B',
            lantai: no <= 12 ? 1 : 2,
            harga_perbulan: 1200000,
            harga_perminggu: 400000,
            harga_perhari: 150000,
        })),
        ...[6, 7, 12].map((no) => ({
            no_kamar: no.toString(),
            tipe_kamar: 'C',
            lantai: no <= 12 ? 1 : 2,
            harga_perbulan: 1300000,
            harga_perminggu: 400000,
            harga_perhari: 150000,
        })),
    ];

    for (const room of daisyRooms) {
        const kamar = await prisma.kamarDaisy.upsert({
            where: { no_kamar: room.no_kamar },
            update: {
                tipe_kamar: room.tipe_kamar,
                lantai: room.lantai,
                harga_perbulan: room.harga_perbulan,
                harga_perminggu: room.harga_perminggu,
                harga_perhari: room.harga_perhari,
            },
            create: {
                no_kamar: room.no_kamar,
                tipe_kamar: room.tipe_kamar,
                lantai: room.lantai,
                harga_perbulan: room.harga_perbulan,
                harga_perminggu: room.harga_perminggu,
                harga_perhari: room.harga_perhari,
            },
        });
        console.log(`Upserted Kamar Daisy ${kamar.no_kamar}`);
    }

    // Data Kamar Camellia
    const camelliaRooms = [
        ...[3, 4, 5, 6, 7, 8, 9, 10, 11, 13].map((no) => ({
            no_kamar: no.toString(),
            tipe_kamar: '1',
            lantai: no <= 10 ? 1 : 2,
            harga_perbulan: 1300000,
            harga_perminggu: 450000,
            harga_perhari: 150000,
        })),
        ...[1, 2, 12].map((no) => ({
            no_kamar: no.toString(),
            tipe_kamar: '2',
            lantai: no <= 10 ? 1 : 2,
            harga_perbulan: 1000000,
            harga_perminggu: 350000,
            harga_perhari: 100000,
        })),
    ];

    for (const room of camelliaRooms) {
        const kamar = await prisma.kamarCamellia.upsert({
            where: { no_kamar: room.no_kamar },
            update: {
                tipe_kamar: room.tipe_kamar,
                lantai: room.lantai,
                harga_perbulan: room.harga_perbulan,
                harga_perminggu: room.harga_perminggu,
                harga_perhari: room.harga_perhari,
            },
            create: {
                no_kamar: room.no_kamar,
                tipe_kamar: room.tipe_kamar,
                lantai: room.lantai,
                harga_perbulan: room.harga_perbulan,
                harga_perminggu: room.harga_perminggu,
                harga_perhari: room.harga_perhari,
            },
        });
        console.log(`Upserted Kamar Camellia ${kamar.no_kamar}`);
    }

    console.log('Seeding finished.');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
