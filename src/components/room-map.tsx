"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Room {
    id: number;
    no_kamar: string;
    tipe_kamar: string;
    status: "TERSEDIA" | "BOOKED" | "TERISI" | "MAINTENANCE";
}

export interface RoomMapProps {
    kost: "daisy" | "camellia";
    title: string;
}

export default function RoomMap({ kost, title }: RoomMapProps) {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const res = await fetch(`/api/rooms?kost=${kost}`);
                const data = await res.json();
                setRooms(data.rooms || []);
            } catch (err) {
                console.error("Error fetching rooms:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRooms();
    }, [kost]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "TERSEDIA": return "bg-white border-zinc-200 text-zinc-800";
            case "BOOKED": return "bg-yellow-400 border-yellow-500 text-yellow-900";
            case "TERISI": return "bg-red-500 border-red-600 text-white";
            case "MAINTENANCE": return "bg-gray-400 border-gray-500 text-white";
            default: return "bg-white border-zinc-200 text-zinc-800";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "TERSEDIA": return "Tersedia";
            case "BOOKED": return "Dipesan";
            case "TERISI": return "Terisi";
            case "MAINTENANCE": return "Perbaikan";
            default: return status;
        }
    };

    return (
        <Card className="w-full mt-10 lg:mt-0 col-span-1 lg:col-span-3">
            <CardHeader>
                <CardTitle className="text-xl">{title}</CardTitle>
                <CardDescription>Peta interaktif ketersediaan kamar (data langsung dari database).</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex items-center justify-center p-8 text-muted-foreground">Memuat data kamar...</div>
                ) : rooms.length === 0 ? (
                    <div className="flex items-center justify-center p-8 text-muted-foreground">Data kamar tidak ditemukan.</div>
                ) : (
                    <div className="flex flex-row overflow-x-auto gap-8 pb-4 custom-scrollbar">
                        {Array.from(new Set(rooms.map(r => r.tipe_kamar))).sort().map(tipe => (
                            <div key={tipe} className="flex flex-col min-w-[200px] border rounded-lg p-4 bg-muted/30">
                                <h4 className="text-sm font-semibold text-muted-foreground border-b pb-2 mb-3 text-center">Tipe {tipe}</h4>
                                <div className="flex flex-wrap gap-3 justify-center">
                                    {rooms.filter(r => r.tipe_kamar === tipe)
                                        .sort((a, b) => a.no_kamar.localeCompare(b.no_kamar, undefined, { numeric: true }))
                                        .map(room => (
                                            <div
                                                key={room.id}
                                                className={cn(
                                                    "w-12 h-12 flex items-center justify-center rounded-md font-bold shadow-sm border-2 transition-transform hover:scale-110 cursor-help",
                                                    getStatusColor(room.status)
                                                )}
                                                title={`Kamar ${room.no_kamar} (${room.tipe_kamar}) - ${getStatusLabel(room.status)}`}
                                            >
                                                {room.no_kamar}
                                            </div>
                                        ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Legend */}
                <div className="flex justify-center flex-wrap gap-4 mt-6 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-white border border-zinc-300"></div> <span>Kosong</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-yellow-400 border border-yellow-500"></div> <span>Booked</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-red-500 border border-red-600"></div> <span>Terisi</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
