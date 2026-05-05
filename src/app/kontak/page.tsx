"use client";

import { MapPin, Phone, MessageCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function KontakPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Header */}
            <div data-aos="fade-down" className="text-center mb-10">
                <h1 className="text-4xl font-extrabold tracking-tight mb-4">Hubungi Kami</h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Punya pertanyaan seputar Kost Putri Daisy atau Kost Putri Camellia? Tanya langsung ke AI Assistant kami 24/7 atau chat admin via WhatsApp.
                </p>
            </div>

            {/* AI Assistant Banner */}
            <Card data-aos="fade-up" className="mb-12 bg-primary/5 border-primary/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <MessageCircle className="w-32 h-32" />
                </div>
                <CardHeader>
                    <CardTitle className="text-2xl text-primary flex items-center gap-2">
                        <MessageCircle className="w-6 h-6" /> Live Chat Assistant
                    </CardTitle>
                    <CardDescription className="text-base text-foreground/80">
                        Klik tombol melayang (icon pesan) di pojok kanan bawah layar untuk berbicara dengan Virtual Assistant. AI dapat menginformasikan stok kamar, harga, tipe fasilitas, hingga menuntun Anda mengisi formulir secara real-time!
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-background rounded-lg p-4 border shadow-sm max-w-2xl">
                        <p className="text-sm italic text-muted-foreground">
                            "Halo! Saya asisten virtual cerdas untuk Kost Daisy dan Camellia. Ketik saja pesannya, saya yang akan cek ketersediaannya di *database*."
                        </p>
                    </div>
                    <Button onClick={() => window.dispatchEvent(new Event("open-chatbot"))} className="gap-2">
                        <MessageCircle className="w-4 h-4" /> Mulai Chat Sekarang
                    </Button>
                </CardContent>
            </Card>

            {/* Grid 2 Kosts */}
            <div data-aos="fade-up" data-aos-delay="200" className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Kost Daisy Card */}
                <Card className="shadow-lg border-t-4 border-t-pink-500">
                    <CardHeader className="bg-pink-500/10 border-b">
                        <CardTitle className="text-2xl text-pink-600">Kost Daisy</CardTitle>
                        <CardDescription>Kost khusus putri yang nyaman, aman, dan bersih.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-pink-600 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-foreground">Alamat Lokasi</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Jl. Raya Solo - Baki No.KM, RW.1, Bangorwo, Kwarasan, Kec. Grogol, Kabupaten Sukoharjo, Jawa Tengah 57552
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Phone className="w-5 h-5 text-pink-600 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-foreground">WhatsApp Admin</h4>
                                    <a
                                        href={'https://wa.me/628996512404?text=Halo Admin Kost Daisy...'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-pink-600 hover:underline font-medium"
                                    >
                                        +62 899-6512-404
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Google Maps Embed */}
                        <div className="rounded-xl overflow-hidden shadow-inner w-full border">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3954.823887984182!2d110.81044637605298!3d-7.594138075046727!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a1738e5ab19b1%3A0x13c2b5451a7e5435!2sKost%20Putri%20Daisy!5e0!3m2!1sid!2sid!4v1772719684952!5m2!1sid!2sid"
                                width="100%"
                                height="250"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </div>
                    </CardContent>
                </Card>

                {/* Kost Camellia Card */}
                <Card className="shadow-lg border-t-4 border-t-purple-600">
                    <CardHeader className="bg-purple-600/10 border-b">
                        <CardTitle className="text-2xl text-purple-700 dark:text-purple-400">Kost Camellia</CardTitle>
                        <CardDescription>Pilihan kost putri elegan dengan berbagai fasilitas eksklusif.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-foreground">Alamat Lokasi</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Solo Baru, Sawah, Kudu, Kec. Baki, Kabupaten Sukoharjo, Jawa Tengah
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Phone className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-foreground">WhatsApp Admin</h4>
                                    <a
                                        href={'https://wa.me/628973445606?text=Halo Admin Kost Camellia...'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-purple-600 hover:underline font-medium"
                                    >
                                        +62 897-3445-606
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Google Maps Embed */}
                        <div className="rounded-xl overflow-hidden shadow-inner w-full border">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3954.691423449142!2d110.7951718760531!3d-7.608518675210821!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a153c02c9de0b%3A0x24a5628f6b224945!2sKost%20Camellia%20(Putri)!5e0!3m2!1sid!2sid!4v1772719929610!5m2!1sid!2sid"
                                width="100%"
                                height="250"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
