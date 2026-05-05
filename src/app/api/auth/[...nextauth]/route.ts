import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "email@contoh.com" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email dan password wajib diisi");
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                });

                if (!user) {
                    throw new Error("Email tidak terdaftar");
                }

                const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

                if (!isPasswordValid) {
                    throw new Error("Password salah");
                }

                return {
                    id: user.id,
                    name: user.nama, // alias mapped to `nama`
                    email: user.email,
                    role: user.role,
                    no_telp: user.no_telp,
                };
            }
        })
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.no_telp = user.no_telp;
            }

            // Update session when user edits their profile
            if (trigger === "update" && session) {
                token.name = session.name;
                token.no_telp = session.no_telp;
                token.email = session.email;
            }

            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.no_telp = token.no_telp as string;
            }
            return session;
        }
    },
    pages: {
        signIn: "/login",
        // signOut: '/',
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET || "webkost-secret-key-123", // Jangan pakai default ini di production sungguhan
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
