import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: string;
            no_telp: string;
        } & DefaultSession["user"]
    }

    interface User {
        id: string;
        role: string;
        no_telp: string;
        // name dan email sudah ada bawaan NextAuth User interface
    }
}
