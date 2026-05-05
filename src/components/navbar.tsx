"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Navbar() {
    const { data: session, status } = useSession();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">

                {/* Logo / Title Left */}
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="text-xl font-bold text-primary tracking-tight">Kost Solo Baru</span>
                    </Link>
                </div>

                {/* Central Nav Links (Desktop) */}
                <nav className="hidden md:flex gap-6 items-center absolute left-1/2 transform -translate-x-1/2">
                    <Link href="/" className="text-sm font-medium text-foreground/80 hover:text-foreground">Home</Link>
                    <Link href="/daisy" className="text-sm font-medium text-foreground/80 hover:text-foreground">Kost Daisy</Link>
                    <Link href="/camellia" className="text-sm font-medium text-foreground/80 hover:text-foreground">Kost Camellia</Link>
                    <Link href="/kontak" className="text-sm font-medium text-foreground/80 hover:text-foreground">Kontak</Link>
                </nav>

                {/* Auth Buttons / User Menu Right */}
                <div className="flex items-center gap-4">
                    {/* Mobile Menu Toggle Button */}
                    <button
                        className="md:hidden p-2 -mr-2 text-foreground/80 hover:text-foreground"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>

                    <div className="hidden md:flex items-center gap-4">
                        {status === "loading" ? (
                            <div className="h-9 w-20 bg-muted animate-pulse rounded-md"></div>
                        ) : session?.user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                                        <Avatar className="h-9 w-9">
                                            <AvatarFallback className="bg-primary/10 text-primary">
                                                {session.user.name?.substring(0, 2).toUpperCase() || "US"}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{session.user.name}</p>
                                            <p className="text-xs leading-none text-muted-foreground">
                                                {session.user.email}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href="/settings" className="cursor-pointer">Pengaturan Profil</Link>
                                    </DropdownMenuItem>
                                    {session.user.role === "ADMIN" && (
                                        <DropdownMenuItem asChild>
                                            <Link href="/admin" className="cursor-pointer text-emerald-600">Dashboard Admin</Link>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={() => signOut()}>
                                        Log out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <>
                                <Button variant="ghost" asChild>
                                    <Link href="/login">Login</Link>
                                </Button>
                                <Button asChild>
                                    <Link href="/register">Daftar</Link>
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Nav Dropdown */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-16 left-0 w-full bg-background border-b shadow-lg z-40 py-4 px-4 flex flex-col gap-4">
                    <nav className="flex flex-col gap-4 border-b pb-4">
                        <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-foreground/80 hover:text-foreground px-2">Home</Link>
                        <Link href="/daisy" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-foreground/80 hover:text-foreground px-2">Kost Daisy</Link>
                        <Link href="/camellia" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-foreground/80 hover:text-foreground px-2">Kost Camellia</Link>
                        <Link href="/kontak" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-foreground/80 hover:text-foreground px-2">Kontak</Link>
                    </nav>
                    <div className="flex flex-col gap-3">
                        {status === "loading" ? (
                            <div className="h-9 w-full bg-muted animate-pulse rounded-md"></div>
                        ) : session?.user ? (
                            <div className="flex flex-col gap-3 text-sm">
                                <div className="px-2 pb-2 mb-2 border-b">
                                    <p className="font-medium">{session.user.name}</p>
                                    <p className="text-xs text-muted-foreground">{session.user.email}</p>
                                </div>
                                <Link href="/settings" onClick={() => setIsMobileMenuOpen(false)} className="px-2 hover:text-primary">Pengaturan Profil</Link>
                                {session.user.role === "ADMIN" && (
                                    <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="px-2 text-emerald-600 hover:underline">Dashboard Admin</Link>
                                )}
                                <button className="text-left px-2 text-red-600 font-medium pt-2 mt-2 border-t" onClick={() => { setIsMobileMenuOpen(false); signOut(); }}>
                                    Log out
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <Button variant="outline" className="w-full justify-center" asChild onClick={() => setIsMobileMenuOpen(false)}>
                                    <Link href="/login">Login</Link>
                                </Button>
                                <Button className="w-full justify-center" asChild onClick={() => setIsMobileMenuOpen(false)}>
                                    <Link href="/register">Daftar</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
