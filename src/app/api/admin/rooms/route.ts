import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id || session.user.role !== "ADMIN") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { id, kost, status } = body;

        if (!id || !kost || !status) {
            return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
        }

        let updatedRoom;
        if (kost === "DAISY") {
            updatedRoom = await prisma.kamarDaisy.update({
                where: { id: Number(id) },
                data: { status },
            });
        } else if (kost === "CAMELLIA") {
            updatedRoom = await prisma.kamarCamellia.update({
                where: { id: Number(id) },
                data: { status },
            });
        } else {
            return NextResponse.json({ message: "Kost tidak valid." }, { status: 400 });
        }

        return NextResponse.json({ message: "Status kamar berhasil diperbarui.", room: updatedRoom });
    } catch (error: unknown) {
        console.error("Admin Room Update Error:", error);
        return NextResponse.json({ message: "Server error.", error: (error as Error).message }, { status: 500 });
    }
}
