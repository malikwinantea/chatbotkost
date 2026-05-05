"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { User, Mail, Phone, Settings } from "lucide-react";

export default function SettingsPage() {
    const { data: session, status, update } = useSession();
    const router = useRouter();

    const [formData, setFormData] = useState({
        nama: "",
        nama_belakang: "",
        email: "",
        no_telp: "",
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        // Redirect unauthenticated users
        if (status === "unauthenticated") {
            router.push("/login");
        }

        // Pre-fill form from session data
        if (status === "authenticated" && session?.user) {
            setFormData({
                nama: session.user.name || "",
                nama_belakang: "", // In a real app we might fetch full from DB
                email: session.user.email || "",
                no_telp: session.user.no_telp || "",
            });
        }
    }, [status, session, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSuccess("");
        setError("");

        try {
            const res = await fetch("/api/auth/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Gagal memperbarui profil");
            }

            setSuccess("Profil berhasil diperbarui!");

            // Update next-auth session object locally reflecting db update
            await update({
                name: formData.nama,
                email: formData.email,
                no_telp: formData.no_telp,
            });

            router.refresh();

        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Terjadi kesalahan yang tidak diketahui");
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading") {
        return <div className="min-h-[80vh] flex items-center justify-center">Memuat data...</div>;
    }

    if (status === "unauthenticated") {
        return null; // Will redirect via useEffect
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-2xl">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
                <Settings className="h-8 w-8 text-primary" /> Pengaturan Akun
            </h1>

            <div className="grid gap-8">
                <Card className="border-2">
                    <CardHeader>
                        <CardTitle>Profil Pengguna</CardTitle>
                        <CardDescription>Perbarui informasi identitas dan kontak Anda</CardDescription>
                    </CardHeader>
                    <form onSubmit={handleUpdate}>
                        <CardContent className="space-y-4">

                            {success && (
                                <div className="p-3 text-sm text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-md">
                                    {success}
                                </div>
                            )}
                            {error && (
                                <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-md">
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nama" className="flex items-center gap-1.5"><User className="h-4 w-4 text-muted-foreground" />Nama Depan</Label>
                                    <Input id="nama" value={formData.nama} onChange={handleChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="nama_belakang">Nama Belakang</Label>
                                    <Input id="nama_belakang" value={formData.nama_belakang} onChange={handleChange} placeholder="Kosongkan jika tidak ada" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="flex items-center gap-1.5"><Mail className="h-4 w-4 text-muted-foreground" />Alamat Email</Label>
                                <Input id="email" type="email" value={formData.email} onChange={handleChange} required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="no_telp" className="flex items-center gap-1.5 "><Phone className="h-4 w-4 text-muted-foreground" />No. WhatsApp</Label>
                                <Input id="no_telp" type="tel" className="mb-5" value={formData.no_telp} onChange={handleChange} required />
                            </div>

                        </CardContent>
                        <CardFooter>
                            <Button type="submit" disabled={loading}>
                                {loading ? "Menyimpan..." : "Simpan Perubahan"}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}
