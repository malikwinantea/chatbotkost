import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const kost = searchParams.get("kost"); // "daisy" or "camellia"

        if (kost === "daisy") {
            const rooms = await prisma.kamarDaisy.findMany({ orderBy: { no_kamar: "asc" } });
            return NextResponse.json({ rooms });
        } else if (kost === "camellia") {
            const rooms = await prisma.kamarCamellia.findMany({ orderBy: { no_kamar: "asc" } });
            return NextResponse.json({ rooms });
        }

        return NextResponse.json({ message: "Param 'kost' wajib diisi (daisy/camellia)." }, { status: 400 });
    } catch (error: unknown) {
        console.error("Rooms API Error:", error);
        return NextResponse.json({ message: "Server error", error: (error as Error).message }, { status: 500 });
    }
}
