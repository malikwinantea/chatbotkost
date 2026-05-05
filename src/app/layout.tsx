import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Chatbot } from "@/components/chatbot";
import { Navbar } from "@/components/navbar";
import { Providers } from "@/components/providers";
import { AOSInit } from "@/components/aos-init";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sistem Reservasi Kost Solo Baru",
  description: "Website resmi reservasi kamar Kost Daisy dan Kost Camellia di area Solo Baru.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative min-h-screen flex flex-col`}
      >
        <Providers>
          <Navbar />
          <AOSInit />
          <main className="flex-1">
            {children}
          </main>
          <Chatbot />
        </Providers>
      </body>
    </html>
  );
}
