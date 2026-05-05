"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Bath, Calendar, MapPin, Wind, Maximize, Shield, Coffee, Upload, CreditCard, Info, ImageIcon, Loader2, MessageCircle, X } from "lucide-react";
import RoomMap from "@/components/room-map";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { useSession } from "next-auth/react";

export default function KostDaisy() {
    const { data: session } = useSession();
    const [reservationType, setReservationType] = useState<"A" | "B" | "C" | "A Spesial">("A");
    const [durasiUnit, setDurasiUnit] = useState<"Harian" | "Mingguan" | "Bulanan">("Bulanan");
    const [durasiJumlah, setDurasiJumlah] = useState(1);
    const [tglMasuk, setTglMasuk] = useState("");
    const [ktpFile, setKtpFile] = useState<File | null>(null);
    const [paymentFile, setPaymentFile] = useState<File | null>(null);
    const ktpInputRef = useRef<HTMLInputElement>(null);
    const paymentInputRef = useRef<HTMLInputElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [selectedNoKamar, setSelectedNoKamar] = useState("");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [availableRooms, setAvailableRooms] = useState<any[]>([]);

    // Fetch available rooms
    useEffect(() => {
        fetch("/api/rooms?kost=daisy")
            .then(res => res.json())
            .then(data => setAvailableRooms(data.rooms || []))
            .catch(console.error);
    }, []);

    // Filter rooms by selected type that are available
    const filteredRooms = availableRooms.filter(
        (r) => r.tipe_kamar === reservationType && r.status === "TERSEDIA"
    );

    // Reset room selection when type changes
    useEffect(() => {
        setSelectedNoKamar("");
    }, [reservationType]);

    const handleKtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) setKtpFile(e.target.files[0]);
    };
    const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) setPaymentFile(e.target.files[0]);
    };

    const handleSubmitReservasi = async () => {
        setErrorMsg("");
        if (!session?.user) {
            setErrorMsg("Anda harus login terlebih dahulu untuk reservasi.");
            return;
        }

        const namaLengkap = (document.getElementById("nama") as HTMLInputElement)?.value;
        const noWa = (document.getElementById("hp") as HTMLInputElement)?.value;

        if (!namaLengkap) { setErrorMsg("Nama lengkap wajib diisi."); return; }
        if (!noWa) { setErrorMsg("No. WhatsApp wajib diisi."); return; }
        if (!tglMasuk) { setErrorMsg("Tanggal masuk wajib diisi."); return; }
        if (!selectedNoKamar) { setErrorMsg("Nomor kamar wajib dipilih."); return; }
        if (!ktpFile) { setErrorMsg("Foto KTP wajib diunggah."); return; }
        if (!paymentFile) { setErrorMsg("Bukti transfer Deposit wajib diunggah."); return; }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("nama_lengkap", namaLengkap);
            formData.append("no_wa", noWa);
            formData.append("kost_tujuan", "DAISY");
            formData.append("tipe_kamar", reservationType);
            formData.append("no_kamar", selectedNoKamar);
            formData.append("tgl_masuk", tglMasuk);
            formData.append("durasi_unit", durasiUnit);
            formData.append("durasi_jumlah", String(durasiJumlah));
            formData.append("bukti_bayar", paymentFile);
            formData.append("foto_ktp", ktpFile);

            const res = await fetch("/api/reserve", { method: "POST", body: formData });
            const data = await res.json();
            if (!res.ok) {
                setErrorMsg(data.message || "Gagal mengajukan reservasi.");
            } else {
                setShowSuccess(true);
            }
        } catch {
            setErrorMsg("Terjadi kesalahan jaringan.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="theme-pink min-h-screen bg-gradient-to-br from-pink-50 via-background to-pink-100/50 dark:from-pink-950/20 dark:via-background dark:to-pink-900/10 pb-20">

            {/* Header Banner */}
            <div className="flex flex-col overflow-hidden">
                <ContainerScroll
                    titleComponent={
                        <>
                            <h1 className="text-4xl font-semibold text-black dark:text-white">
                                Selamat Datang di <br />
                                <span className="text-4xl md:text-[6rem] font-bold mt-1 text-primary leading-none">
                                    Kost Putri Daisy
                                </span>
                            </h1>
                            <p className="text-xl md:text-2xl mt-4 text-muted-foreground text-center">Kenyamanan Maksimal di Pusat Solo Baru</p>
                        </>
                    }
                >
                    <img
                        src="/img/daisyLuar2.png"
                        alt="Kost Daisy"
                        className="mx-auto rounded-2xl object-cover h-full object-left-top"
                        draggable={false}
                    />
                </ContainerScroll>
            </div>

            <div className="container mx-auto px-4 mt-12 space-y-12">

                {/* Informasi Kost */}
                <section>
                    <h2 className="text-3xl font-semibold mb-4 text-primary">Informasi Kost</h2>
                    <p className="text-muted-foreground leading-relaxed text-lg">
                        Kost Daisy menawarkan hunian asri dengan desain minimalis tropis. Berlokasi di Jl. Raya Solo - Baki No.KM, RW.1, Bangorwo, Kwarasan, Kec. Grogol, Kabupaten Sukoharjo, Jawa Tengah 57552. Sangat dekat dengan area perkantoran, pusat kuliner, dan pusat perbelanjaan seperti The Park Mall. Kami menjamin lingkungan yang tenang, aman, dan nyaman.
                    </p>
                    <div className="mt-4 flex items-center text-muted-foreground font-medium">
                        <MapPin className="h-5 w-5 mr-2 text-primary" />
                        Jl. Raya Solo Baru Sektor 1 No. 45, Grogol, Sukoharjo
                    </div>
                </section>

                {/* Tipe Kamar */}
                <section>
                    <h2 className="text-3xl font-semibold mb-6 text-primary">Tipe Kamar &amp; Fasilitas</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="border-2 hover:border-primary transition-colors cursor-pointer" onClick={() => setReservationType("A")}>
                            <CardHeader>
                                <CardTitle className="text-xl">Tipe A</CardTitle>
                                <CardDescription className="font-medium text-primary">Rp 700.000 / bulan</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <img src="/img/daisyA.jpeg" alt="Tipe A" className="w-full h-40 object-cover rounded-md mb-3" />
                                <ul className="space-y-1.5">
                                    <li className="flex items-center text-sm"><Maximize className="h-4 w-4 mr-2 text-primary shrink-0" /> Kamar 3x3 M (Lantai 2)</li>
                                    <li className="flex items-center text-sm"><Wind className="h-4 w-4 mr-2 text-primary shrink-0" /> Non AC</li>
                                    <li className="flex items-center text-sm"><Bath className="h-4 w-4 mr-2 text-primary shrink-0" /> KM Luar</li>
                                </ul>
                            </CardContent>
                        </Card>
                        <Card className="border-2 hover:border-primary transition-colors cursor-pointer" onClick={() => setReservationType("B")}>
                            <CardHeader>
                                <CardTitle className="text-xl">Tipe B</CardTitle>
                                <CardDescription className="font-medium text-primary">Rp 1.200.000 / bulan</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <img src="/img/daisyB.jpeg" alt="Tipe B" className="w-full h-40 object-cover rounded-md mb-3" />
                                <ul className="space-y-1.5">
                                    <li className="flex items-center text-sm"><Maximize className="h-4 w-4 mr-2 text-primary shrink-0" /> Kamar 3x3.5 M</li>
                                    <li className="flex items-center text-sm"><Wind className="h-4 w-4 mr-2 text-primary shrink-0" /> AC</li>
                                    <li className="flex items-center text-sm"><Bath className="h-4 w-4 mr-2 text-primary shrink-0" /> KM Dalam</li>
                                </ul>
                            </CardContent>
                        </Card>
                        <Card className="border-2 hover:border-primary transition-colors cursor-pointer" onClick={() => setReservationType("C")}>
                            <CardHeader>
                                <CardTitle className="text-xl">Tipe C</CardTitle>
                                <CardDescription className="font-medium text-primary">Rp 1.300.000 / bulan</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <img src="/img/daisyC.jpeg" alt="Tipe C" className="w-full h-40 object-cover rounded-md mb-3" />
                                <ul className="space-y-1.5">
                                    <li className="flex items-center text-sm"><Maximize className="h-4 w-4 mr-2 text-primary shrink-0" /> Kamar 4x4 M</li>
                                    <li className="flex items-center text-sm"><Wind className="h-4 w-4 mr-2 text-primary shrink-0" /> AC</li>
                                    <li className="flex items-center text-sm"><Bath className="h-4 w-4 mr-2 text-primary shrink-0" /> KM Dalam</li>
                                </ul>
                            </CardContent>
                        </Card>
                        <Card className="border-2 hover:border-primary transition-colors cursor-pointer" onClick={() => setReservationType("A Spesial")}>
                            <CardHeader>
                                <CardTitle className="text-xl">Tipe A Spesial</CardTitle>
                                <CardDescription className="font-medium text-primary">Rp 750.000 / bulan</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <img src="/img/daisyAView.jpeg" alt="Tipe A Spesial" className="w-full h-40 object-cover rounded-md mb-3" />
                                <ul className="space-y-1.5">
                                    <li className="flex items-center text-sm"><Maximize className="h-4 w-4 mr-2 text-primary shrink-0" /> Kamar 3x3 M (Lantai 2)</li>
                                    <li className="flex items-center text-sm"><Wind className="h-4 w-4 mr-2 text-primary shrink-0" /> Non AC, Jendela Depan</li>
                                    <li className="flex items-center text-sm"><Bath className="h-4 w-4 mr-2 text-primary shrink-0" /> KM Luar</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Keunggulan */}
                <section data-aos="fade-up">
                    <h2 className="text-3xl font-semibold mb-6 text-primary">Keunggulan Kost Daisy</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="flex flex-col items-center text-center p-5 bg-muted rounded-xl shadow-sm">
                            <Shield className="h-10 w-10 text-primary mb-3" />
                            <h3 className="font-semibold text-base mb-1">Keamanan 24/7</h3>
                            <p className="text-xs text-muted-foreground">CCTV 24 Jam.</p>
                        </div>
                        <div className="flex flex-col items-center text-center p-5 bg-muted rounded-xl shadow-sm">
                            <MapPin className="h-10 w-10 text-primary mb-3" />
                            <h3 className="font-semibold text-base mb-1">Lokasi Strategis</h3>
                            <p className="text-xs text-muted-foreground">Dekat perkantoran, kuliner, The Park Mall dan Pakuwon Mall.</p>
                        </div>
                        <div className="flex flex-col items-center text-center p-5 bg-muted rounded-xl shadow-sm">
                            <CheckCircle2 className="h-10 w-10 text-primary mb-3" />
                            <h3 className="font-semibold text-base mb-1">Full Furnish</h3>
                            <p className="text-xs text-muted-foreground">Dilengkapi springbed, lemari, dan meja.</p>
                        </div>
                        <div className="flex flex-col items-center text-center p-5 bg-muted rounded-xl shadow-sm">
                            <Coffee className="h-10 w-10 text-primary mb-3" />
                            <h3 className="font-semibold text-base mb-1">Dapur Bersama</h3>
                            <p className="text-xs text-muted-foreground">Area dapur umum yang nyaman dan lengkap.</p>
                        </div>
                    </div>
                </section>

                {/* Lokasi / Peta */}
                <section data-aos="fade-up">
                    <h2 className="text-2xl font-semibold mb-4 text-primary">Lokasi Kost Daisy</h2>
                    <div className="rounded-xl overflow-hidden shadow-md w-full">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3954.823887984182!2d110.81044637605298!3d-7.594138075046727!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a1738e5ab19b1%3A0x13c2b5451a7e5435!2sKost%20Putri%20Daisy!5e0!3m2!1sid!2sid!4v1772719684952!5m2!1sid!2sid"
                            width="100%"
                            height="400"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        />
                    </div>
                </section>

                {/* Denah Kamar */}
                <RoomMap kost="daisy" title="Denah Ketersediaan Kamar Kost Daisy" />

                {/* Form Reservasi + Metode Pembayaran (sejajar) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                    {/* ===== FORM RESERVASI (kiri) ===== */}
                    <Card className="border-primary shadow-xl">
                        <CardHeader className="bg-primary/5 border-b py-4">
                            <CardTitle className="text-xl text-center">Reservasi Kamar</CardTitle>
                            <CardDescription className="text-center text-sm">
                                Pemesanan kamar <span className="font-semibold text-primary"></span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-5 px-5">
                            <form className="space-y-4">

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="nama">Nama Lengkap</Label>
                                        <Input id="nama" placeholder="Sesuai KTP" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="hp">No. WhatsApp</Label>
                                        <Input id="hp" type="tel" placeholder="08xxxxxxxxxx" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="tipe">Tipe Kamar</Label>
                                        <select
                                            id="tipe"
                                            value={reservationType}
                                            onChange={(e) => setReservationType(e.target.value as typeof reservationType)}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-bold text-primary"
                                        >
                                            <option value="A">Tipe A</option>
                                            <option value="A Spesial">Tipe A Spesial</option>
                                            <option value="B">Tipe B</option>
                                            <option value="C">Tipe C</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="no_kamar">No. Kamar</Label>
                                        <select
                                            id="no_kamar"
                                            value={selectedNoKamar}
                                            onChange={(e) => setSelectedNoKamar(e.target.value)}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-bold text-primary"
                                        >
                                            <option value="">Pilih kamar...</option>
                                            {filteredRooms.map((room) => (
                                                <option key={room.id} value={room.no_kamar}>Kamar {room.no_kamar}</option>
                                            ))}
                                        </select>
                                        {filteredRooms.length === 0 && (
                                            <p className="text-xs text-red-500">Tidak ada kamar tersedia untuk tipe ini.</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="tanggal">Tgl. Masuk</Label>
                                        <div className="relative">
                                            <Input id="tanggal" type="date" className="pl-9" value={tglMasuk} onChange={(e) => setTglMasuk(e.target.value)} />
                                            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        </div>
                                    </div>
                                </div>

                                {/* Durasi Sewa */}
                                <div className="space-y-1.5">
                                    <Label>Durasi Sewa</Label>
                                    <div className="flex gap-2">
                                        {(["Harian", "Mingguan", "Bulanan"] as const).map((unit) => (
                                            <button
                                                key={unit}
                                                type="button"
                                                onClick={() => setDurasiUnit(unit)}
                                                className={`flex-1 py-2 rounded-md text-sm font-semibold border-2 transition-colors ${durasiUnit === unit
                                                    ? "border-primary bg-primary text-primary-foreground"
                                                    : "border-border bg-background text-muted-foreground hover:border-primary/50"
                                                    }`}
                                            >
                                                {unit}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            min="1"
                                            value={durasiJumlah}
                                            onChange={(e) => setDurasiJumlah(Number(e.target.value))}
                                            className="w-24"
                                        />
                                        <span className="text-sm text-muted-foreground">{durasiUnit.toLowerCase()}</span>
                                    </div>
                                </div>

                                {/* Upload KTP & Bukti Bayar */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label>Foto KTP</Label>
                                        <div
                                            className="border-2 border-dashed border-border rounded-lg p-3 text-center cursor-pointer hover:border-primary/60 transition-colors"
                                            onClick={() => ktpInputRef.current?.click()}
                                        >
                                            {ktpFile ? (
                                                <div className="space-y-1">
                                                    <img src={URL.createObjectURL(ktpFile)} alt="KTP" className="mx-auto max-h-20 rounded object-cover" />
                                                    <p className="text-xs text-primary font-medium">Klik untuk ganti</p>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center gap-1.5 py-2">
                                                    <ImageIcon className="h-7 w-7 text-muted-foreground" />
                                                    <p className="text-xs text-muted-foreground">Unggah Foto KTP</p>
                                                </div>
                                            )}
                                            <input ref={ktpInputRef} type="file" accept="image/*" className="hidden" onChange={handleKtpChange} />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Bukti Transfer Deposit</Label>
                                        <div
                                            className="border-2 border-dashed border-border rounded-lg p-3 text-center cursor-pointer hover:border-primary/60 transition-colors"
                                            onClick={() => paymentInputRef.current?.click()}
                                        >
                                            {paymentFile ? (
                                                <div className="space-y-1">
                                                    <img src={URL.createObjectURL(paymentFile)} alt="Bukti" className="mx-auto max-h-20 rounded object-cover" />
                                                    <p className="text-xs text-primary font-medium">Klik untuk ganti</p>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center gap-1.5 py-2">
                                                    <Upload className="h-7 w-7 text-muted-foreground" />
                                                    <p className="text-xs text-muted-foreground">Bukti Transfer</p>
                                                </div>
                                            )}
                                            <input ref={paymentInputRef} type="file" accept="image/*" className="hidden" onChange={handlePaymentChange} />
                                        </div>
                                    </div>
                                </div>

                            </form>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-2 px-5 pb-5 pt-2">
                            {errorMsg && <p className="text-sm text-red-600 text-center font-medium">{errorMsg}</p>}
                            <Button className="w-full text-base h-11" onClick={handleSubmitReservasi} disabled={isSubmitting}>
                                {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Memproses...</> : "Ajukan Reservasi"}
                            </Button>
                            {!session?.user && (
                                <p className="text-xs text-center text-muted-foreground">
                                    Login sebagai Member untuk menyelesaikan reservasi.
                                </p>
                            )}
                        </CardFooter>
                    </Card>

                    {/* ===== METODE PEMBAYARAN (kanan) ===== */}
                    <Card className="border-2 border-primary/30 bg-primary/5">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-xl flex items-center gap-2 text-primary">
                                <CreditCard className="h-5 w-5" /> Metode Pembayaran
                            </CardTitle>
                            <CardDescription>Informasi pembayaran Deposit untuk reservasi</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Deposit Info */}
                            <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl">
                                <Info className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                                <div>
                                    <p className="font-semibold text-amber-800 dark:text-amber-400">Deposit — Rp 500.000</p>
                                    <p className="text-sm text-amber-700 dark:text-amber-500 mt-1">
                                        Deposit sebesar <strong>Rp 500.000</strong> dibayarkan untuk mengamankan kamar. Bersifat <span className="font-semibold underline">refundable</span> — dikembalikan penuh saat penyewa keluar.
                                    </p>
                                </div>
                            </div>

                            {/* Bank Transfer Info */}
                            <div className="flex items-center gap-4 p-5 bg-background border-2 border-primary/20 rounded-xl">
                                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 shrink-0">
                                    <CreditCard className="h-7 w-7 text-primary" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-1">Transfer via</p>
                                    <p className="text-xl font-bold text-primary">Bank Mandiri</p>
                                    <p className="text-2xl font-mono font-bold tracking-widest mt-1">1380007779122</p>
                                    <p className="text-sm text-muted-foreground mt-1">a.n <span className="font-semibold text-foreground">Endang Sustyani Rahayu</span></p>
                                    <span className="inline-block mt-2 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">KOST DAISY</span>
                                </div>
                            </div>

                            {/* Langkah */}
                            <div className="space-y-2">
                                <p className="text-sm font-semibold text-foreground">Langkah Reservasi:</p>
                                <ol className="space-y-1.5 text-sm text-muted-foreground list-none">
                                    <li className="flex items-start gap-2"><span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0 mt-0.5">1</span> Transfer Deposit Rp 500.000 ke rekening di atas</li>
                                    <li className="flex items-start gap-2"><span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0 mt-0.5">2</span> Isi form reservasi dan unggah foto KTP</li>
                                    <li className="flex items-start gap-2"><span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0 mt-0.5">3</span> Unggah bukti transfer Deposit</li>
                                    <li className="flex items-start gap-2"><span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0 mt-0.5">4</span> Klik &quot;Ajukan Reservasi&quot; dan segera konfirmasi admin</li>
                                </ol>
                            </div>

                            <p className="text-xs text-muted-foreground border-t pt-3">
                                💡 Deposit akan dikembalikan saat penyewa memutuskan untuk keluar dari kost.
                            </p>
                        </CardContent>
                    </Card>

                </div>

            </div>

            {/* Success Modal */}
            {showSuccess && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md shadow-2xl">
                        <CardHeader className="text-center pb-2">
                            <button onClick={() => setShowSuccess(false)} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
                                <X className="h-5 w-5" />
                            </button>
                            <div className="flex justify-center mb-3">
                                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                                </div>
                            </div>
                            <CardTitle className="text-xl text-green-700">Reservasi Berhasil Diajukan!</CardTitle>
                            <CardDescription className="text-base mt-2">
                                Pembayaran sedang dikonfirmasi admin.<br />
                                <span className="font-semibold text-amber-600">Tunggu maksimal 1x24 jam.</span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 text-center">
                            <p className="text-sm text-muted-foreground">Segera konfirmasi ke Admin Kost Daisy via WhatsApp:</p>
                            <a
                                href={`https://wa.me/628996512404?text=${encodeURIComponent("Halo Admin Kost Daisy, saya sudah melakukan reservasi kamar dan transfer uang deposit. Tolong segera dikonfirmasi. Terima kasih.")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors text-base"
                            >
                                <MessageCircle className="h-5 w-5" /> Konfirmasi via WhatsApp
                            </a>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
