import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { nama, nama_belakang, email, no_telp } = await req.json();

        if (!nama || !email || !no_telp) {
            return NextResponse.json(
                { message: "Nama, Email, dan No Telp wajib diisi!" },
                { status: 400 }
            );
        }

        // Check if new email is already used by someone else
        if (email !== session.user.email) {
            const existingEmail = await prisma.user.findUnique({
                where: { email },
            });
            if (existingEmail && existingEmail.id !== session.user.id) {
                return NextResponse.json(
                    { message: "Email sudah digunakan oleh akun lain." },
                    { status: 409 }
                );
            }
        }

        // Check if new phone is already used by someone else
        if (no_telp !== session.user.no_telp) {
            const existingPhone = await prisma.user.findUnique({
                where: { no_telp },
            });
            if (existingPhone && existingPhone.id !== session.user.id) {
                return NextResponse.json(
                    { message: "Nomor telepon sudah digunakan oleh akun lain." },
                    { status: 409 }
                );
            }
        }

        // Update user in DB
        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                nama,
                nama_belakang: nama_belakang || null,
                email,
                no_telp,
            },
        });

        return NextResponse.json(
            { message: "Profil berhasil diperbarui", user: { id: updatedUser.id, name: updatedUser.nama, no_telp: updatedUser.no_telp, email: updatedUser.email } },
            { status: 200 }
        );
    } catch (error) {
        console.error("Profile Update Error:", error);
        return NextResponse.json(
            { message: "Terjadi kesalahan pada server." },
            { status: 500 }
        );
    }
}
