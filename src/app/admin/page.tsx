"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    FileText, CheckCircle, XCircle, AlertTriangle, DollarSign, Users, Home,
    Zap, Send, Loader2, Eye, Trash2, Pencil, X, BedDouble,
} from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DashboardData = any;

export default function AdminDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [data, setData] = useState<DashboardData>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"reservasi" | "penyewa" | "kamar" | "listrik">("reservasi");
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Electricity calculator
    const [kwh, setKwh] = useState<number>(0);
    const [selectedTenantWa, setSelectedTenantWa] = useState("");
    const [selectedTenantName, setSelectedTenantName] = useState("");
    const [listrikKost, setListrikKost] = useState<"DAISY" | "CAMELLIA">("DAISY");
    const [listrikKamar, setListrikKamar] = useState("");

    // Image preview
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    // Edit modal
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTglMasuk, setEditTglMasuk] = useState("");
    const [editTglKeluar, setEditTglKeluar] = useState("");
    const [editNamaPenyewa, setEditNamaPenyewa] = useState("");
    const [editNoWa, setEditNoWa] = useState("");
    const [editIdKamar, setEditIdKamar] = useState<number | "">("");
    const [editKostTujuan, setEditKostTujuan] = useState<"DAISY" | "CAMELLIA">("DAISY");
    const [editTipeKamar, setEditTipeKamar] = useState("");

    // Room Status Modal
    const [editRoomId, setEditRoomId] = useState<number | null>(null);
    const [editRoomKost, setEditRoomKost] = useState<"DAISY" | "CAMELLIA" | null>(null);
    const [editRoomNo, setEditRoomNo] = useState("");
    const [editRoomStatus, setEditRoomStatus] = useState("");

    const fetchDashboard = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/dashboard");
            if (res.ok) {
                const json = await res.json();
                setData(json);
            }
        } catch (err) {
            console.error("Failed to fetch dashboard:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (status === "loading") return;
        if (!session?.user || session.user.role !== "ADMIN") {
            router.push("/login");
            return;
        }
        fetchDashboard();
    }, [session, status, router, fetchDashboard]);

    const handleAction = async (id: string, action: string) => {
        setActionLoading(id);
        try {
            const res = await fetch(`/api/admin/reservasi/${id}`, {
                method: action === "delete" ? "DELETE" : "PUT",
                headers: { "Content-Type": "application/json" },
                body: action !== "delete" ? JSON.stringify({ action }) : undefined,
            });
            if (res.ok) {
                fetchDashboard();
            }
        } catch (err) {
            console.error("Action error:", err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleEdit = async (id: string) => {
        setActionLoading(id);
        try {
            await fetch(`/api/admin/reservasi/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "edit",
                    tgl_masuk: editTglMasuk || undefined,
                    tgl_keluar: editTglKeluar || undefined,
                    nama_penyewa: editNamaPenyewa || undefined,
                    no_wa_penyewa: editNoWa || undefined,
                    id_kamar: editIdKamar || undefined,
                }),
            });
            setEditingId(null);
            fetchDashboard();
        } catch (err) {
            console.error("Edit error:", err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleEditRoomStatus = async () => {
        if (!editRoomId || !editRoomKost || !editRoomStatus) return;
        setActionLoading(`room-${editRoomId}`);
        try {
            await fetch("/api/admin/rooms", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: editRoomId,
                    kost: editRoomKost,
                    status: editRoomStatus,
                }),
            });
            setEditRoomId(null);
            fetchDashboard();
        } catch (err) {
            console.error("Room edit error:", err);
        } finally {
            setActionLoading(null);
        }
    };

    const formatRp = (amount: number) => `Rp ${amount.toLocaleString("id-ID")}`;
    const formatDate = (dateStr: string) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
    };

    const isExpiringSoon = (tglKeluar: string) => {
        if (!tglKeluar) return false;
        const diff = new Date(tglKeluar).getTime() - Date.now();
        return diff > 0 && diff <= 7 * 24 * 60 * 60 * 1000;
    };

    const getNoKamar = (res: DashboardData) => {
        if (res.kost_tujuan === "DAISY" && data?.daisyRooms) {
            const room = data.daisyRooms.find((r: DashboardData) => r.id === res.id_kamar_daisy);
            return room ? room.no_kamar : "-";
        }
        if (res.kost_tujuan === "CAMELLIA" && data?.camelliaRooms) {
            const room = data.camelliaRooms.find((r: DashboardData) => r.id === res.id_kamar_camellia);
            return room ? room.no_kamar : "-";
        }
        return "-";
    };

    const listrikTotal = kwh * 2500;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/20 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-primary">Admin Dashboard</h1>
                        <p className="text-muted-foreground">Kelola reservasi dan penyewa Kost Daisy & Camellia.</p>
                    </div>
                </div>

                {/* Expiring Alerts */}
                {data?.expiringTenants?.length > 0 && (
                    <Card className="border-amber-400 bg-amber-50 dark:bg-amber-950/30">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-amber-700 flex items-center gap-2 text-base">
                                <AlertTriangle className="h-5 w-5" /> Peringatan Masa Sewa
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            {data.expiringTenants.map((r: DashboardData) => (
                                <p key={r.id_reservasi} className="text-sm text-amber-800">
                                    ⚠️ <strong>{r.user?.nama}</strong> — Kost {r.kost_tujuan} Kamar {getNoKamar(r)} — Sewa berakhir <strong>{formatDate(r.tgl_keluar)}</strong>
                                </p>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg"><DollarSign className="h-6 w-6 text-green-600" /></div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Total Pendapatan</p>
                                    <p className="text-lg font-bold">{formatRp(data?.totalPendapatan || 0)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg"><Users className="h-6 w-6 text-blue-600" /></div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Penyewa Aktif</p>
                                    <p className="text-lg font-bold">{data?.stats?.totalPenyewaAktif || 0}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-yellow-100 rounded-lg"><FileText className="h-6 w-6 text-yellow-600" /></div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Menunggu Konfirmasi</p>
                                    <p className="text-lg font-bold">{data?.stats?.totalMenunggu || 0}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg"><Home className="h-6 w-6 text-purple-600" /></div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Kamar Tersedia</p>
                                    <p className="text-lg font-bold">D: {data?.stats?.availableDaisy || 0} | C: {data?.stats?.availableCamellia || 0}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2 flex-wrap bg-muted p-1 rounded-lg">
                    {[
                        { key: "reservasi", label: "Validasi Reservasi", icon: FileText },
                        { key: "penyewa", label: "Penyewa Aktif", icon: Users },
                        { key: "kamar", label: "Status Kamar", icon: BedDouble },
                        { key: "listrik", label: "Hitung Listrik", icon: Zap },
                    ].map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key as typeof activeTab)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === key ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                        >
                            <Icon className="h-4 w-4" /> {label}
                        </button>
                    ))}
                </div>

                {/* TAB: Validasi Reservasi */}
                {activeTab === "reservasi" && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Reservasi Menunggu Konfirmasi</CardTitle>
                            <CardDescription>Validasi bukti Deposit dan setujui atau tolak reservasi.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {data?.pendingReservations?.length === 0 ? (
                                <p className="text-center py-8 text-muted-foreground">Tidak ada reservasi yang menunggu konfirmasi.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Nama</TableHead>
                                                <TableHead>Kost</TableHead>
                                                <TableHead>Kamar</TableHead>
                                                <TableHead>Tgl Masuk</TableHead>
                                                <TableHead>Durasi</TableHead>
                                                <TableHead>Total</TableHead>
                                                <TableHead>Bukti Deposit</TableHead>
                                                <TableHead className="text-right">Aksi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {data?.pendingReservations?.map((res: DashboardData) => (
                                                <TableRow key={res.id_reservasi}>
                                                    <TableCell className="font-medium">
                                                        {res.nama_penyewa || `${res.user?.nama} ${res.user?.nama_belakang || ""}`}
                                                        <p className="text-xs text-muted-foreground">{res.no_wa_penyewa || res.user?.no_telp}</p>
                                                    </TableCell>
                                                    <TableCell><Badge variant="outline">{res.kost_tujuan}</Badge></TableCell>
                                                    <TableCell>{getNoKamar(res)}</TableCell>
                                                    <TableCell>{formatDate(res.tgl_masuk)}</TableCell>
                                                    <TableCell>{res.durasi_sewa_jumlah} {res.durasi_sewa_unit}</TableCell>
                                                    <TableCell className="font-semibold">{formatRp(res.total_harga)}</TableCell>
                                                    <TableCell>
                                                        <div className="flex gap-2">
                                                            {res.foto_ktp ? (
                                                                <Button variant="outline" size="sm" onClick={() => setPreviewImage(res.foto_ktp)}>
                                                                    <Eye className="h-4 w-4 mr-1" /> KTP
                                                                </Button>
                                                            ) : res.user?.foto_ktp ? (
                                                                <Button variant="outline" size="sm" onClick={() => setPreviewImage(res.user.foto_ktp)}>
                                                                    <Eye className="h-4 w-4 mr-1" /> KTP (Akun)
                                                                </Button>
                                                            ) : <span className="text-xs flex items-center text-muted-foreground">No KTP</span>}

                                                            {res.bukti_bayar_dp ? (
                                                                <Button variant="outline" size="sm" onClick={() => setPreviewImage(res.bukti_bayar_dp)}>
                                                                    <Eye className="h-4 w-4 mr-1" /> Deposit
                                                                </Button>
                                                            ) : <span className="text-xs flex items-center text-muted-foreground">No Deposit</span>}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right space-x-1">
                                                        <Button
                                                            size="sm"
                                                            className="bg-green-600 hover:bg-green-700"
                                                            disabled={actionLoading === res.id_reservasi}
                                                            onClick={() => handleAction(res.id_reservasi, "approve")}
                                                        >
                                                            {actionLoading === res.id_reservasi ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            disabled={actionLoading === res.id_reservasi}
                                                            onClick={() => handleAction(res.id_reservasi, "reject")}
                                                        >
                                                            <XCircle className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* TAB: Penyewa Aktif */}
                {activeTab === "penyewa" && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Daftar Penyewa Aktif</CardTitle>
                            <CardDescription>Edit tanggal sewa atau hapus penyewa dari sistem.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {data?.activeReservations?.length === 0 ? (
                                <p className="text-center py-8 text-muted-foreground">Belum ada penyewa aktif.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Nama</TableHead>
                                                <TableHead>Foto KTP</TableHead>
                                                <TableHead>Kost</TableHead>
                                                <TableHead>Kamar</TableHead>
                                                <TableHead>Masuk</TableHead>
                                                <TableHead>Keluar</TableHead>
                                                <TableHead>Total</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Aksi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {data?.activeReservations?.map((res: DashboardData) => (
                                                <TableRow key={res.id_reservasi} className={isExpiringSoon(res.tgl_keluar) ? "bg-red-50 dark:bg-red-950/20" : ""}>
                                                    <TableCell className="font-medium">
                                                        {res.nama_penyewa || `${res.user?.nama} ${res.user?.nama_belakang || ""}`}
                                                        <p className="text-xs text-muted-foreground">{res.no_wa_penyewa || res.user?.no_telp}</p>
                                                    </TableCell>
                                                    <TableCell>
                                                        {res.foto_ktp ? (
                                                            <Button variant="outline" size="sm" onClick={() => setPreviewImage(res.foto_ktp)}>
                                                                <Eye className="h-4 w-4 mr-1" /> KTP
                                                            </Button>
                                                        ) : res.user?.foto_ktp ? (
                                                            <Button variant="outline" size="sm" onClick={() => setPreviewImage(res.user.foto_ktp)}>
                                                                <Eye className="h-4 w-4 mr-1" /> KTP (Akun)
                                                            </Button>
                                                        ) : <span className="text-xs text-muted-foreground">-</span>}
                                                    </TableCell>
                                                    <TableCell><Badge variant="outline">{res.kost_tujuan}</Badge></TableCell>
                                                    <TableCell>{getNoKamar(res)}</TableCell>
                                                    <TableCell>{formatDate(res.tgl_masuk)}</TableCell>
                                                    <TableCell>
                                                        {formatDate(res.tgl_keluar)}
                                                        {isExpiringSoon(res.tgl_keluar) && (
                                                            <Badge variant="destructive" className="ml-2 text-xs">Segera Habis!</Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="font-semibold">{formatRp(res.total_harga)}</TableCell>
                                                    <TableCell><Badge className="bg-green-100 text-green-800 hover:bg-green-100">Aktif</Badge></TableCell>
                                                    <TableCell className="text-right space-x-1">
                                                        <Button variant="outline" size="sm" onClick={() => {
                                                            setEditingId(res.id_reservasi);
                                                            setEditTglMasuk(res.tgl_masuk?.split("T")[0] || "");
                                                            setEditTglKeluar(res.tgl_keluar?.split("T")[0] || "");
                                                            setEditNamaPenyewa(res.nama_penyewa || `${res.user?.nama} ${res.user?.nama_belakang || ""}`);
                                                            setEditNoWa(res.no_wa_penyewa || res.user?.no_telp || "");
                                                            setEditKostTujuan(res.kost_tujuan);

                                                            let theRoom = null;
                                                            if (res.kost_tujuan === "DAISY") {
                                                                theRoom = data?.daisyRooms?.find((r: DashboardData) => r.id === res.id_kamar_daisy);
                                                            } else {
                                                                theRoom = data?.camelliaRooms?.find((r: DashboardData) => r.id === res.id_kamar_camellia);
                                                            }
                                                            setEditIdKamar(theRoom?.id || "");
                                                            setEditTipeKamar(theRoom?.tipe_kamar || "");
                                                        }}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            disabled={actionLoading === res.id_reservasi}
                                                            onClick={() => handleAction(res.id_reservasi, "delete")}
                                                        >
                                                            {actionLoading === res.id_reservasi ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* TAB: Status Kamar */}
                {activeTab === "kamar" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Daisy Rooms */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Home className="h-5 w-5 text-pink-600" /> Kost Daisy</CardTitle>
                                <CardDescription>Total: {data?.daisyRooms?.length} kamar | Tersedia: {data?.stats?.availableDaisy}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6 flex-1">
                                    {Array.from(new Set(data?.daisyRooms?.map((r: DashboardData) => r.tipe_kamar) || [])).sort().map(tipe => (
                                        <div key={tipe as string} className="space-y-2">
                                            <h4 className="text-sm font-semibold text-muted-foreground border-b pb-1">Tipe {tipe as string}</h4>
                                            <div className="flex flex-wrap gap-3">
                                                {data?.daisyRooms?.filter((r: DashboardData) => r.tipe_kamar === tipe)
                                                    .sort((a: DashboardData, b: DashboardData) => a.no_kamar.localeCompare(b.no_kamar, undefined, { numeric: true }))
                                                    .map((room: DashboardData) => (
                                                        <div key={room.id}
                                                            onClick={() => {
                                                                setEditRoomId(room.id);
                                                                setEditRoomKost("DAISY");
                                                                setEditRoomNo(room.no_kamar);
                                                                setEditRoomStatus(room.status);
                                                            }}
                                                            className={`w-14 h-14 flex flex-col items-center justify-center rounded-lg font-bold text-xs shadow-sm border-2 transition-transform hover:scale-110 cursor-pointer ${room.status === "TERSEDIA" ? "bg-white border-zinc-200 text-zinc-800" :
                                                                room.status === "BOOKED" ? "bg-yellow-400 border-yellow-500 text-yellow-900" :
                                                                    room.status === "TERISI" ? "bg-red-500 border-red-600 text-white" :
                                                                        "bg-gray-400 border-gray-500 text-white"
                                                                }`}
                                                            title={`Kamar ${room.no_kamar} - Tipe ${room.tipe_kamar} - ${room.status} (Klik untuk ubah)`}
                                                        >
                                                            <span className="text-sm font-bold">{room.no_kamar}</span>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-center flex-wrap gap-4 mt-6 pt-4 border-t text-xs">
                                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-white border border-zinc-300"></div> Kosong</div>
                                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-yellow-400 border border-yellow-500"></div> Booked</div>
                                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-500 border border-red-600"></div> Terisi</div>
                                </div>
                            </CardContent>
                        </Card>
                        {/* Camellia Rooms */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Home className="h-5 w-5 text-purple-600" /> Kost Camellia</CardTitle>
                                <CardDescription>Total: {data?.camelliaRooms?.length} kamar | Tersedia: {data?.stats?.availableCamellia}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6 flex-1">
                                    {Array.from(new Set(data?.camelliaRooms?.map((r: DashboardData) => r.tipe_kamar) || [])).sort().map(tipe => (
                                        <div key={tipe as string} className="space-y-2">
                                            <h4 className="text-sm font-semibold text-muted-foreground border-b pb-1">Tipe {tipe as string}</h4>
                                            <div className="flex flex-wrap gap-3">
                                                {data?.camelliaRooms?.filter((r: DashboardData) => r.tipe_kamar === tipe)
                                                    .sort((a: DashboardData, b: DashboardData) => a.no_kamar.localeCompare(b.no_kamar, undefined, { numeric: true }))
                                                    .map((room: DashboardData) => (
                                                        <div key={room.id}
                                                            onClick={() => {
                                                                setEditRoomId(room.id);
                                                                setEditRoomKost("CAMELLIA");
                                                                setEditRoomNo(room.no_kamar);
                                                                setEditRoomStatus(room.status);
                                                            }}
                                                            className={`w-14 h-14 flex flex-col items-center justify-center rounded-lg font-bold text-xs shadow-sm border-2 transition-transform hover:scale-110 cursor-pointer ${room.status === "TERSEDIA" ? "bg-white border-zinc-200 text-zinc-800" :
                                                                room.status === "BOOKED" ? "bg-yellow-400 border-yellow-500 text-yellow-900" :
                                                                    room.status === "TERISI" ? "bg-red-500 border-red-600 text-white" :
                                                                        "bg-gray-400 border-gray-500 text-white"
                                                                }`}
                                                            title={`Kamar ${room.no_kamar} - Tipe ${room.tipe_kamar} - ${room.status} (Klik untuk ubah)`}
                                                        >
                                                            <span className="text-sm font-bold">{room.no_kamar}</span>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-center flex-wrap gap-4 mt-6 pt-4 border-t text-xs">
                                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-white border border-zinc-300"></div> Kosong</div>
                                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-yellow-400 border border-yellow-500"></div> Booked</div>
                                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-500 border border-red-600"></div> Terisi</div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* TAB: Hitung Listrik */}
                {activeTab === "listrik" && (
                    <Card className="max-w-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5 text-yellow-500" /> Kalkulator Listrik</CardTitle>
                            <CardDescription>Tarif Rp 2.500 / kWh. Pilih kost dan kamar, nama & no HP akan otomatis terisi.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label>Nama Kost</Label>
                                    <select
                                        value={listrikKost}
                                        onChange={(e) => { setListrikKost(e.target.value as "DAISY" | "CAMELLIA"); setListrikKamar(""); setSelectedTenantName(""); setSelectedTenantWa(""); }}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    >
                                        <option value="DAISY">Kost Daisy</option>
                                        <option value="CAMELLIA">Kost Camellia</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Nomor Kamar</Label>
                                    <select
                                        value={listrikKamar}
                                        onChange={(e) => {
                                            const noKamar = e.target.value;
                                            setListrikKamar(noKamar);
                                            // Auto-fill tenant data prioritizing Reservasi fields
                                            const tenant = data?.activeReservations?.find((r: DashboardData) => {
                                                const roomNo = getNoKamar(r);
                                                return r.kost_tujuan === listrikKost && roomNo === noKamar;
                                            });
                                            if (tenant) {
                                                setSelectedTenantName(tenant.nama_penyewa || `${tenant.user?.nama || ""} ${tenant.user?.nama_belakang || ""}`.trim());
                                                setSelectedTenantWa(tenant.no_wa_penyewa || tenant.user?.no_telp || "");
                                            } else {
                                                setSelectedTenantName("");
                                                setSelectedTenantWa("");
                                            }
                                        }}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    >
                                        <option value="">Pilih kamar...</option>
                                        {(listrikKost === "DAISY" ? data?.daisyRooms : data?.camelliaRooms)?.map((room: DashboardData) => (
                                            <option key={room.id} value={room.no_kamar}>Kamar {room.no_kamar}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label>Nama Penyewa</Label>
                                    <Input value={selectedTenantName} readOnly className="bg-muted" placeholder="Otomatis terisi" />
                                </div>
                                <div className="space-y-2">
                                    <Label>No. WhatsApp</Label>
                                    <Input value={selectedTenantWa} readOnly className="bg-muted" placeholder="Otomatis terisi" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Jumlah kWh</Label>
                                <Input type="number" min="0" value={kwh} onChange={(e) => setKwh(Number(e.target.value))} />
                            </div>

                            <div className="p-4 bg-muted rounded-lg text-center">
                                <p className="text-sm text-muted-foreground">Total Tagihan Listrik</p>
                                <p className="text-3xl font-bold text-primary">{formatRp(listrikTotal)}</p>
                                <p className="text-xs text-muted-foreground mt-1">{kwh} kWh × Rp 2.500</p>
                            </div>

                            <a
                                href={`https://wa.me/${selectedTenantWa.replace(/^0/, "62")}?text=${encodeURIComponent(`Halo ${selectedTenantName}, berikut tagihan listrik kost Anda:\n\nKost: ${listrikKost}\nKamar: ${listrikKamar}\nPemakaian: ${kwh} kWh\nTarif: Rp 2.500 / kWh\nTotal: ${formatRp(listrikTotal)}\n\nMohon segera dilakukan pembayaran. Terima kasih.`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`inline-flex w-full items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-base transition-colors ${kwh > 0 && selectedTenantWa ? "bg-green-600 hover:bg-green-700 text-white" : "bg-muted text-muted-foreground pointer-events-none"}`}
                            >
                                <Send className="h-5 w-5" /> Kirim Tagihan via WhatsApp
                            </a>
                        </CardContent>
                    </Card>
                )}

            </div>

            {/* Image Preview Modal */}
            {previewImage && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
                    <div className="relative max-w-2xl max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setPreviewImage(null)} className="absolute -top-3 -right-3 bg-white rounded-full p-1 shadow-lg z-10">
                            <X className="h-5 w-5" />
                        </button>
                        <img src={previewImage} alt="Bukti Deposit" className="max-w-full max-h-[80vh] rounded-lg shadow-2xl object-contain" />
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editingId && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-lg shadow-2xl h-[90vh] flex flex-col">
                        <CardHeader className="shrink-0 pb-4">
                            <CardTitle>Edit Data Penyewa</CardTitle>
                            <button onClick={() => setEditingId(null)} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
                                <X className="h-5 w-5" />
                            </button>
                        </CardHeader>
                        <CardContent className="space-y-4 overflow-y-auto flex-1 pr-2 pb-6 custom-scrollbar">
                            <div className="space-y-2">
                                <Label>Nama Penyewa Aktif</Label>
                                <Input type="text" value={editNamaPenyewa} onChange={(e) => setEditNamaPenyewa(e.target.value)} placeholder="Contoh: Budi Santoso" />
                            </div>
                            <div className="space-y-2">
                                <Label>No. WhatsApp</Label>
                                <Input type="tel" value={editNoWa} onChange={(e) => setEditNoWa(e.target.value)} placeholder="08xxxxxxxxxx" />
                            </div>
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <div className="space-y-2">
                                    <Label>Tanggal Masuk</Label>
                                    <Input type="date" value={editTglMasuk} onChange={(e) => setEditTglMasuk(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Tanggal Keluar</Label>
                                    <Input type="date" value={editTglKeluar} onChange={(e) => setEditTglKeluar(e.target.value)} />
                                </div>
                            </div>
                            <div className="pt-2 border-t mt-4 space-y-3">
                                <h3 className="font-semibold text-sm">Pindah Kamar (Opsional)</h3>
                                <div className="space-y-2 pt-1">
                                    <Label>Kamar Saat Ini (Tipe {editTipeKamar})</Label>
                                    <select
                                        value={editIdKamar}
                                        onChange={(e) => setEditIdKamar(Number(e.target.value))}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary font-medium"
                                    >
                                        <option value="">Pilih kamar baru...</option>
                                        {(editKostTujuan === "DAISY" ? data?.daisyRooms : data?.camelliaRooms)
                                            ?.filter((r: DashboardData) => r.tipe_kamar === editTipeKamar && (r.status === "TERSEDIA" || r.id === editIdKamar))
                                            ?.sort((a: DashboardData, b: DashboardData) => a.no_kamar.localeCompare(b.no_kamar, undefined, { numeric: true }))
                                            .map((room: DashboardData) => (
                                                <option key={room.id} value={room.id}>
                                                    Kamar {room.no_kamar} {room.id === editIdKamar ? "(Kamar Saat Ini)" : "- Tersedia"}
                                                </option>
                                            ))}
                                    </select>
                                    <p className="text-xs text-muted-foreground mt-1">Hanya menampilkan kamar yang kosong untuk tipe ini.</p>
                                </div>
                            </div>

                            <Button className="w-full mt-6" onClick={() => handleEdit(editingId)} disabled={actionLoading === editingId}>
                                {actionLoading === editingId ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Simpan Perubahan
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}
            {/* Edit Room Status Modal */}
            {editRoomId && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-sm shadow-2xl">
                        <CardHeader>
                            <CardTitle>Ubah Status Kamar</CardTitle>
                            <CardDescription>Kost {editRoomKost} - Kamar {editRoomNo}</CardDescription>
                            <button onClick={() => setEditRoomId(null)} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
                                <X className="h-5 w-5" />
                            </button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Status Saat Ini</Label>
                                <select
                                    value={editRoomStatus}
                                    onChange={(e) => setEditRoomStatus(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                >
                                    <option value="TERSEDIA">Kosong (TERSEDIA)</option>
                                    <option value="BOOKED">Booked</option>
                                    <option value="TERISI">Terisi</option>
                                    <option value="MAINTENANCE">Perbaikan (MAINTENANCE)</option>
                                </select>
                            </div>
                            <Button className="w-full" onClick={handleEditRoomStatus} disabled={actionLoading === `room-${editRoomId}`}>
                                {actionLoading === `room-${editRoomId}` ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Simpan Status
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
