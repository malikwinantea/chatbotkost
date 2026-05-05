import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const { nama, nama_belakang, email, no_telp, password } = await req.json();

        if (!nama || !email || !no_telp || !password) {
            return NextResponse.json(
                { message: "Semua field wajib diisi!" },
                { status: 400 }
            );
        }

        // Cek apakah email sudah terdaftar
        const existingUserByEmail = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUserByEmail) {
            return NextResponse.json(
                { message: "Email sudah terdaftar!" },
                { status: 409 }
            );
        }

        // Cek apakah nomor telepon sudah terdaftar
        const existingUserByPhone = await prisma.user.findUnique({
            where: { no_telp },
        });
        if (existingUserByPhone) {
            return NextResponse.json(
                { message: "Nomor telepon sudah terdaftar!" },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Simpan user ke database
        const newUser = await prisma.user.create({
            data: {
                nama,
                nama_belakang: nama_belakang || null,
                email,
                no_telp,
                password: hashedPassword,
                // Role default MEMBER dari schema prisma
            },
        });

        return NextResponse.json(
            { message: "Registrasi berhasil!", user: { id: newUser.id, email: newUser.email } },
            { status: 201 }
        );
    } catch (error) {
        console.error("Register Error:", error);
        return NextResponse.json(
            { message: "Terjadi kesalahan pada server." },
            { status: 500 }
        );
    }
}
