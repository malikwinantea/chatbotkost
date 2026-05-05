"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        nama: "",
        nama_belakang: "",
        email: "",
        no_telp: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Terjadi kesalahan saat pendaftaran");
            }

            // Redirect ke login jika sukses
            router.push("/login?registered=true");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Terjadi kesalahan yang tidak diketahui");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[85vh] flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold tracking-tight">Daftar Akun</CardTitle>
                    <CardDescription>
                        Buat akun untuk dapat melakukan reservasi kost
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleRegister}>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-md">
                                {error}
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="nama">Nama Depan *</Label>
                                <Input id="nama" placeholder="Budi" required value={formData.nama} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="nama_belakang">Nama Belakang</Label>
                                <Input id="nama_belakang" placeholder="Santoso" value={formData.nama_belakang} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input id="email" type="email" placeholder="m@example.com" required value={formData.email} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="no_telp">No WhatsApp *</Label>
                            <Input id="no_telp" type="tel" placeholder="08123456789" required value={formData.no_telp} onChange={handleChange} />
                        </div>
                        <div className="space-y-2 mb-5">
                            <Label htmlFor="password">Password *</Label>
                            <Input id="password" type="password" required value={formData.password} onChange={handleChange} />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button className="w-full" type="submit" disabled={loading}>
                            {loading ? "Memproses..." : "Daftar Sekarang"}
                        </Button>
                        <div className="text-sm text-center text-muted-foreground">
                            Sudah punya akun?{" "}
                            <Link href="/login" className="text-primary hover:underline font-medium">
                                Masuk di sini
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
