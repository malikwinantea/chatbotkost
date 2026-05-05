import { NextResponse } from "next/server";
import openai from "@/app/service/openai";
import prisma from "@/lib/prisma"; // Changed from { prisma } to default import
import { syncRoomStatuses } from "@/lib/syncRoomStatus";

interface RoomData {
    status: string;
    tipe_kamar: string;
    harga_perbulan: number;
    no_kamar: string;
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { messages } = body;

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json(
                { message: "Parameter messages (array) diperlukan." },
                { status: 400 }
            );
        }

        // --- FETCH DATA DARI DATABASE ---
        await syncRoomStatuses();

        // Ambil Data Kost Daisy
        const daisyRooms = await prisma.kamarDaisy.findMany({ orderBy: { no_kamar: "asc" } });
        const daisyTersedia = daisyRooms.filter((r: unknown) => (r as RoomData).status === "TERSEDIA");

        // Kelompokkan Kamar Daisy berdasarkan Tipe dan Statusnya
        const daisyTipeMap = new Map<string, { harga: number, detail: string, rooms: { no: string, status: string }[] }>();

        // Setup Detail Manual (bisa diubah agar dari DB jika memungkinkan)
        const daisyDetails: Record<string, string> = {
            'A': '3x3 M (Lantai 2), Non AC, KM Luar',
            'A Spesial': '3x3 M (Lantai 2), Non AC, KM Luar, Jendela Depan',
            'B': '3x3.5 M, AC, KM Dalam',
            'C': '4x4 M, AC, KM Dalam',
        };

        for (const room of daisyRooms as unknown as RoomData[]) {
            if (!daisyTipeMap.has(room.tipe_kamar)) {
                daisyTipeMap.set(room.tipe_kamar, { harga: room.harga_perbulan, detail: daisyDetails[room.tipe_kamar] || '', rooms: [] });
            }
            daisyTipeMap.get(room.tipe_kamar)!.rooms.push({ no: room.no_kamar, status: room.status });
        }

        const daisyInfo = Array.from(daisyTipeMap.entries()).map(([tipe, data]) => {
            const roomList = data.rooms.map(r => `- Kamar ${r.no} (${r.status})`).join('\n');
            return `Tipe ${tipe}: Rp ${data.harga.toLocaleString('id-ID')}/bln | ${data.detail}\nDaftar Kamar:\n${roomList}`;
        }).join('\n\n');

        // Ambil Data Kost Camellia
        const camelliaRooms = await prisma.kamarCamellia.findMany({ orderBy: { no_kamar: "asc" } });
        const camelliaTersedia = camelliaRooms.filter((r: unknown) => (r as RoomData).status === "TERSEDIA");

        // Kelompokkan Kamar Camellia
        const camelliaTipeMap = new Map<string, { harga: number, detail: string, rooms: { no: string, status: string }[] }>();
        const camelliaDetails: Record<string, string> = {
            '1': 'Full Furnished, AC, KM Dalam',
            '2': 'Full Furnished, Non AC (Kipas), KM Dalam',
        };

        for (const room of camelliaRooms as unknown as RoomData[]) {
            if (!camelliaTipeMap.has(room.tipe_kamar)) {
                camelliaTipeMap.set(room.tipe_kamar, { harga: room.harga_perbulan, detail: camelliaDetails[room.tipe_kamar] || '', rooms: [] });
            }
            camelliaTipeMap.get(room.tipe_kamar)!.rooms.push({ no: room.no_kamar, status: room.status });
        }

        const camelliaInfo = Array.from(camelliaTipeMap.entries()).map(([tipe, data]) => {
            const roomList = data.rooms.map(r => `- Kamar ${r.no} (${r.status})`).join('\n');
            return `Tipe ${tipe}: Rp ${data.harga.toLocaleString('id-ID')}/bln | ${data.detail}\nDaftar Kamar:\n${roomList}`;
        }).join('\n\n');


        // --- CONSTRUCT SYSTEM PROMPT ---
        const systemPrompt = `
Kamu adalah "Webkost AI", asisten virtual profesional untuk Kost Putri Daisy dan Kost Putri Camellia di Solo Baru.
Tugas kamu adalah membantu calon penyewa yang bertanya mengenai harga, ketersediaan kamar, metode pembayaran, lokasi, dan detail fasilitas.

Berikut adalah data AKTUAL (real-time) dari database hari ini:

=== KOST DAISY ===
Lokasi: Jl. Raya Solo Baru Sektor 1 Blok F No. 45, Grogol, Sukoharjo (Dekat The Park Mall, Pakuwon Mall)
Link Maps: https://maps.app.goo.gl/hs9UBmbN4aCDWRMv9
WhatsApp Admin (Survey/Tanya): http://wa.me/628996512404
Fasilitas Umum: Dapur bersama, CCTV 24 Jam, Parkir Luas.
Harga Deposit: Rp 500.000. Transfer via Mandiri 1380007779122 a/n Endang Sustyani Rahayu.
Total Kamar: ${daisyRooms.length}
Kamar Tersedia: ${daisyTersedia.length}
Detail Tipe Kamar & Status Kamar Aktuel (Penting untuk menjawab ketersediaan spesifik kamar):
${daisyInfo}

=== KOST CAMELLIA ===
Lokasi: Jl. Raya Solo Baru Sektor 3 Blok D No. 12, Grogol, Sukoharjo (Sangat dekat RS Dr. Oen)
Link Maps: https://maps.app.goo.gl/fCPMHZEaW51Yza466
WhatsApp Admin (Survey/Tanya): http://wa.me/628973445606
Fasilitas Umum: Dapur bersama (WiFi cepat), CCTV 24 Jam, Parkir Luas. Eksklusivitas dan Kenyamanan Kelas Atas.
Harga Deposit: Rp 500.000. Transfer via BNI 0056 366 801 a/n Endang Sustyani Rahayu.
Total Kamar: ${camelliaRooms.length}
Kamar Tersedia: ${camelliaTersedia.length}
Detail Tipe Kamar & Status Kamar Aktuel (Penting untuk menjawab ketersediaan spesifik kamar):
${camelliaInfo}

PERATURAN & INFORMASI PENTING (BACA DENGAN TELITI, SAMPAIKAN JIKA DITANYA):
1. DEPOSIT: Deposit akan dikembalikan 100% apabila tidak terdapat kerusakan dan kehilangan barang. Proses pengembalian deposit segera dilakukan setelah penghuni meninggalkan kost dan telah dilakukan pengecekan kamar. Apabila terdapat barang hilang atau rusak maka deposit akan dipotong sejumlah dengan biaya perbaikan atau kerusakan.
2. LISTRIK: Membayar listrik sesuai dengan kegunaan masing masing = Rp 2.500/kwh.
3. TAMU MENGINAP: Tamu diharapkan tidak menginap di kost. Tamu yang menginap akan dikenakan biaya menginap per harinya.
4. TAMU LAWAN JENIS: Dilarang membawa masuk tamu lawan jenis KECUALI orang tua / ibu.
5. MEROKOK: Dilarang merokok di dalam kamar maupun di teras/beranda rumah kos.
6. KERUSAKAN FASILITAS: Dilarang merusak / mengambil barang fasilitas kamar kost seperti AC, Fasilitas Toilet, Ranjang, Lemari, Meja dll. Segala bentuk kerusakan dan kehilangan pada kamar bersangkutan, akan dikenakan charge atau penggantian pada penghuni bersangkutan.
7. HEWAN PELIHARAAN: Penghuni kost dilarang membawa dan memelihara binatang peliharaan di lingkungan kost maupun ke dalam kamar kost, termasuk tetapi tidak terbatas seperti anjing, kucing, ular, atau iguana.
8. OBAT NYAMUK: Dilarang memasang obat nyamuk bakar di dalam kamar.
9. BOOKING: Setelah membayar Deposit, maka kamar otomatis ter-booking. Harap segera konfirmasi ke WhatsApp admin kost yang dituju untuk proses pembayaran full selanjutnya.

PANDUAN MENJAWAB:
- Jika ada yang menanyakan rekomendasi tempat kost yang cocok atau lokasi, sertakan Link Maps (Google Maps) yang relevan (Daisy atau Camellia).
- Jika ada yang menanyakan jadwal survey/kunjungan, berikan link WhatsApp Admin yang sesuai untuk janjian.
- Gunakan kata "Deposit" atau "Uang Deposit", jangan gunakan kata "DP".
- Jika ditanya tentang status kamar tertentu secara spesifik misalnya "Apakah Kamar A1 kosong?", CEK STATUS DI DAFTAR KAMAR. Jawab bahwa kamar tersebut "Tersedia" jika statusnya TERSEDIA. Jika statusnya BOOKED/TERISI, sampaikan mohon maaf kamar tersebut sudah tidak tersedia atau sudah terisi/booked.
- Jika ditanya tipe kamar yang kosong, berikan variasi kamar dari tipe tersebut yang berstatus TERSEDIA.
- Selalu jawab menggunakan Bahasa Indonesia yang ramah, sopan, namun singkat dan jelas (to-the-point). Jangan membuat paragraf yang terlalu panjang, jika bentuk list lebih baik, gunakan format bullet.
- Kamu TIDAK mengetahui hal-hal lain di luar data ini, jadi jika ada yang bertanya tentang hal di luar konteks kost, tolak secara halus.
`;

        // Siapkan history message untuk diteruskan ke model
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const conversation: any[] = [
            { role: "system", content: systemPrompt },
            ...messages.map((msg: { role: string; content: string }) => ({
                role: msg.role,
                content: msg.content
            }))
        ];

        // PANGGIL OPENAI
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini", // atau model lain yang disuka
            messages: conversation,
            max_tokens: 300,
            temperature: 0.5,
        });

        const reply = response.choices[0].message.content;

        return NextResponse.json({ reply }, { status: 200 });

    } catch (error: unknown) {
        console.error("Chat API Error:", error);
        return NextResponse.json(
            { message: "Terjadi kesalahan pada server", error: (error as Error).message },
            { status: 500 }
        );
    }
}
