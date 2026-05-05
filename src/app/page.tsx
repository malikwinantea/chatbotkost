import { Button } from "@/components/ui/button";
import { MoveRight, MapPin, Shield, Wifi, Coffee, ShieldCheck, Car } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Hero } from "@/components/ui/animated-hero";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      {/* Hero Section */}
      <Hero />

      {/* About Section */}
      <section data-aos="fade-up" className="container mx-auto px-4 py-20 text-center max-w-4xl">
        <h2 className="text-3xl font-bold mb-6">Tentang Kami</h2>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Kami menyediakan pengalaman hunian eksklusif di kawasan Solo Baru.
          Kost Daisy dan Kost Camellia dirancang secara khusus untuk memenuhi kebutuhan profesional
          serta calon penyewa yang mengutamakan kenyamanan, keamanan, dan privasi.
          Setiap properti kami dikelola secara profesional dengan komitmen penuh pada standar kualitas tinggi.
        </p>
      </section>

      {/* Feature Highlights */}
      <section data-aos="fade-up" className="bg-muted w-full py-20">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col items-center text-center p-6 bg-background rounded-lg shadow-sm">
            <MapPin className="h-10 w-10 text-primary mb-4" />
            <h3 className="font-semibold text-xl mb-2">Lokasi Strategis</h3>
            <p className="text-sm text-muted-foreground">Berada di pusat bisnis, perbelanjaan Solo Baru dan area rumah sakit.</p>
          </div>
          <div className="flex flex-col items-center text-center p-6 bg-background rounded-lg shadow-sm">
            <Shield className="h-10 w-10 text-primary mb-4" />
            <h3 className="font-semibold text-xl mb-2">Keamanan 24/7</h3>
            <p className="text-sm text-muted-foreground">Dilengkapi CCTV dan akses khusus penghuni.</p>
          </div>
          <div className="flex flex-col items-center text-center p-6 bg-background rounded-lg shadow-sm">
            <Wifi className="h-10 w-10 text-primary mb-4" />
            <h3 className="font-semibold text-xl mb-2">Internet Cepat</h3>
            <p className="text-sm text-muted-foreground">Koneksi WiFi kecepatan tinggi di seluruh area hunian.</p>
          </div>
          <div className="flex flex-col items-center text-center p-6 bg-background rounded-lg shadow-sm">
            <Coffee className="h-10 w-10 text-primary mb-4" />
            <h3 className="font-semibold text-xl mb-2">Ruang Bersama</h3>
            <p className="text-sm text-muted-foreground">Area komunal yang nyaman untuk bersosialisasi dan bekerja.</p>
          </div>
        </div>
      </section>

      {/* Tentang Kost Daisy Section */}
      <section data-aos="fade-up" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/img/daisyLuar.png"
                alt="Kost Daisy Room"
                fill
                className="object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="space-y-6">
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-primary border-primary/20 bg-primary/10">
                Eksklusif Putri
              </div>
              <h2 className="text-4xl font-bold tracking-tight">Kost Daisy</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Kost Daisy dirancang khusus untuk kenyamanan dan keamanan hunian putri. Dilengkapi fasilitas unggulan untuk menunjang aktivitas harian di kawasan Solo Baru.
              </p>
              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="space-y-2">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Wifi className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Internet Cepat</h3>
                  <p className="text-sm text-muted-foreground">Koneksi stabil 24/7</p>
                </div>
                <div className="space-y-2">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Keamanan 24 Jam</h3>
                  <p className="text-sm text-muted-foreground">CCTV</p>
                </div>
              </div>
              <Button className="mt-6" asChild>
                <Link href="/daisy">Lihat Detail Kamar</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Tentang Kost Camellia Section */}
      <section data-aos="fade-up" className="py-24 bg-white dark:bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 order-2 md:order-1">
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-purple-600 border-purple-200 bg-purple-100 dark:bg-purple-900/30">
                Premium Class
              </div>
              <h2 className="text-4xl font-bold tracking-tight">Kost Camellia</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Pilihan premium untuk Anda yang menginginkan lebih dari sekadar tempat tinggal. Desain modern, ruang lebih luas.
              </p>
              <div className="flex flex-col gap-4 pt-4">
                <div className="flex items-center gap-4 p-4 rounded-xl border bg-muted/50 transition-colors hover:bg-muted">
                  <Coffee className="h-8 w-8 text-purple-600" />
                  <div>
                    <h3 className="font-semibold">Communal Space</h3>
                    <p className="text-sm text-muted-foreground">Area bersantai</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl border bg-muted/50 transition-colors hover:bg-muted">
                  <Car className="h-8 w-8 text-purple-600" />
                  <div>
                    <h3 className="font-semibold">Parkir Luas</h3>
                    <p className="text-sm text-muted-foreground">Kapasitas mobil & motor</p>
                  </div>
                </div>
              </div>
              <Button className="mt-6 bg-purple-600 hover:bg-purple-700" asChild>
                <Link href="/camellia">Jelajahi Fasilitas</Link>
              </Button>
            </div>
            <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl order-1 md:order-2">
              <Image
                src="/img/camelliaLuar1.jpeg"
                alt="Kost Camellia Room"
                fill
                className="object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Property Selection */}
      <section data-aos="fade-up" className="container mx-auto px-4 py-24 mb-10">
        <h2 className="text-4xl font-bold mb-12 text-center text-primary">Pilihan Hunian Anda</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

          {/* Kost Daisy Card */}
          <div className="flex flex-col border border-border bg-card rounded-xl overflow-hidden shadow-lg transition-transform hover:-translate-y-1 hover:shadow-xl">
            <div className="h-64 bg-zinc-200 relative">
              <img src="/img/daisyLuar.png" alt="Kost Daisy" className="object-cover w-full h-full" />
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-2xl font-bold drop-shadow-md">Kost Daisy</h3>
                <p className="flex items-center text-sn mt-1 drop-shadow-md"><MapPin className="w-4 h-4 mr-1" /> Jl. Raya Solo - Baki No.KM, RW.1, Bangorwo, Kwarasan, Kec. Grogol, Kabupaten Sukoharjo, Jawa Tengah 57552</p>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <p className="text-muted-foreground mb-6">Hunian modern dan asri dengan desain minimalis. Sangat cocok bagi Anda yang menginginkan ketenangan di tengah aktivitas yang padat.</p>
              <div className="mt-auto">
                <Button asChild className="w-full h-12 text-lg">
                  <Link href="/daisy">
                    Lihat Detail & Reservasi <MoveRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Kost Camellia Card */}
          <div className="flex flex-col border border-border bg-card rounded-xl overflow-hidden shadow-lg transition-transform hover:-translate-y-1 hover:shadow-xl">
            <div className="h-64 bg-zinc-200 relative">
              <img src="/img/camelliaLuar.jpg" alt="Kost Camellia" className="object-cover w-full h-full" />
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-2xl font-bold drop-shadow-md">Kost Camellia</h3>
                <p className="flex items-center text-sn mt-1 drop-shadow-md"><MapPin className="w-4 h-4 mr-1" /> Sawah, Kudu, Kec. Baki, Kabupaten Sukoharjo, Jawa Tengah</p>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <p className="text-muted-foreground mb-6">Hunian premium berkonsep elegan dengan fasilitas eksklusif. Menyajikan kenyamanan hunian kelas atas dengan akses mudah ke pusat perbelanjaan.</p>
              <div className="mt-auto">
                <Button asChild className="w-full h-12 text-lg">
                  <Link href="/camellia">
                    Lihat Detail & Reservasi <MoveRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-slate-900 text-slate-400 py-8 text-center mt-auto border-t">
        <p>© {new Date().getFullYear()} Sistem Reservasi Kost Solo Baru. All rights reserved.</p>
      </footer>
    </div>
  );
}
