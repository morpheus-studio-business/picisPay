"use client";

import { useEffect, useState } from "react";
import {
    Users,
    CreditCard,
    ShoppingCart,
    TrendingUp,
    Wallet,
    Clock,
    Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface RecentTopup {
    id: string;
    amount: number;
    fee: number | null;
    status: string;
    paymentMethod: string | null;
    createdAt: string;
}

interface RecentTransaction {
    id: string;
    productName: string | null;
    customerNo: string;
    price: number;
    status: string;
    createdAt: string;
}

interface ChartDataPoint {
    date: string;
    label: string;
    transactions: number;
    revenue: number;
}

interface Stats {
    totalUsers: number;
    totalUserBalance: number;
    totalTopups: number;
    totalTransactions: number;
    totalRevenue: number;
    pendingTopups: number;
    todayTransactions: number;
    todayRevenue: number;
    recentTopups: RecentTopup[];
    recentTransactions: RecentTransaction[];
    chartData: ChartDataPoint[];
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch("/api/admin/stats");
            const data = await res.json();
            if (data.success) {
                setStats(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch stats:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatTime = (dateString: string) => {
        return format(new Date(dateString), "dd MMM, HH:mm", { locale: id });
    };

    const getStatusColor = (status: string) => {
        const lower = status.toLowerCase();
        if (lower === "success" || lower === "sukses" || lower === "completed") return "text-[#bef264] bg-[#bef264]/10";
        if (lower === "pending") return "text-yellow-500 bg-yellow-500/10";
        return "text-red-500 bg-red-500/10";
    };

    // Calculate max for chart scaling
    const maxChartValue = stats?.chartData
        ? Math.max(...stats.chartData.map((d) => d.transactions), 1)
        : 1;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-[#bef264]" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Dashboard</h1>
                <p className="text-neutral-500">Overview sistem PicisPay</p>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {/* Total Users */}
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-500" />
                        </div>
                        <p className="text-sm text-neutral-500">Total Users</p>
                    </div>
                    <p className="text-3xl font-bold text-white">{stats?.totalUsers || 0}</p>
                </div>

                {/* Total User Balance (Saldo Beredar) */}
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                            <Wallet className="w-5 h-5 text-purple-500" />
                        </div>
                        <p className="text-sm text-neutral-500">Saldo Beredar</p>
                    </div>
                    <p className="text-2xl font-bold text-white">{formatCurrency(stats?.totalUserBalance || 0)}</p>
                </div>

                {/* Today Transactions */}
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                            <ShoppingCart className="w-5 h-5 text-green-500" />
                        </div>
                        <p className="text-sm text-neutral-500">Transaksi Hari Ini</p>
                    </div>
                    <p className="text-3xl font-bold text-white">{stats?.todayTransactions || 0}</p>
                    <p className="text-xs text-neutral-500 mt-1">dari {stats?.totalTransactions || 0} total</p>
                </div>

                {/* Today Revenue */}
                <div className="bg-neutral-900/50 border border-[#bef264]/30 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-[#bef264]/10 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-[#bef264]" />
                        </div>
                        <p className="text-sm text-neutral-500">Pendapatan Hari Ini</p>
                    </div>
                    <p className="text-2xl font-bold text-[#bef264]">{formatCurrency(stats?.todayRevenue || 0)}</p>
                    <p className="text-xs text-neutral-500 mt-1">Total: {formatCurrency(stats?.totalRevenue || 0)}</p>
                </div>
            </div>

            {/* Chart Section */}
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-6">Transaksi 7 Hari Terakhir</h3>
                <div className="flex items-end gap-2 h-40">
                    {stats?.chartData?.map((day, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                            <div className="w-full flex flex-col items-center">
                                <span className="text-xs text-[#bef264] font-bold mb-1">{day.transactions}</span>
                                <div
                                    className="w-full max-w-12 bg-[#bef264] rounded-t-lg transition-all"
                                    style={{
                                        height: `${Math.max((day.transactions / maxChartValue) * 100, 4)}px`,
                                    }}
                                />
                            </div>
                            <span className="text-xs text-neutral-500">{day.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Activity Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Top-ups */}
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <CreditCard className="w-4 h-4" /> Top-up Terbaru
                        </h3>
                        <span className="text-xs text-neutral-500">{stats?.pendingTopups || 0} pending</span>
                    </div>
                    {stats?.recentTopups && stats.recentTopups.length > 0 ? (
                        <div className="divide-y divide-neutral-800">
                            {stats.recentTopups.map((topup) => (
                                <div key={topup.id} className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-bold text-white">
                                            {formatCurrency(topup.amount + (topup.fee || 0))}
                                        </p>
                                        <p className="text-xs text-neutral-500 flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {formatTime(topup.createdAt)}
                                        </p>
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-lg capitalize ${getStatusColor(topup.status)}`}>
                                        {topup.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-neutral-600 text-sm">
                            Belum ada data top-up
                        </div>
                    )}
                </div>

                {/* Recent Transactions */}
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-neutral-800">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <ShoppingCart className="w-4 h-4" /> Transaksi Terbaru
                        </h3>
                    </div>
                    {stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
                        <div className="divide-y divide-neutral-800">
                            {stats.recentTransactions.map((trx) => (
                                <div key={trx.id} className="p-4 flex items-center justify-between">
                                    <div className="flex-1 min-w-0 pr-3">
                                        <p className="text-sm font-bold text-white truncate">{trx.productName || "Produk"}</p>
                                        <p className="text-xs text-neutral-500 truncate">{trx.customerNo}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-white">{formatCurrency(trx.price)}</p>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-lg capitalize ${getStatusColor(trx.status)}`}>
                                            {trx.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-neutral-600 text-sm">
                            Belum ada data transaksi
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
