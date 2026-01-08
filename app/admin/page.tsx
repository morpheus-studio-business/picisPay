"use client";

import { useEffect, useState } from "react";
import {
    Users,
    CreditCard,
    ShoppingCart,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react";

interface Stats {
    totalUsers: number;
    totalTopups: number;
    totalTransactions: number;
    totalRevenue: number;
    pendingTopups: number;
    todayTransactions: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats>({
        totalUsers: 0,
        totalTopups: 0,
        totalTransactions: 0,
        totalRevenue: 0,
        pendingTopups: 0,
        todayTransactions: 0,
    });
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

    const statCards = [
        {
            title: "Total Users",
            value: stats.totalUsers,
            icon: Users,
            color: "bg-blue-500/10 text-blue-500",
            trend: "+12%",
            trendUp: true,
        },
        {
            title: "Total Top-ups",
            value: stats.totalTopups,
            icon: CreditCard,
            color: "bg-green-500/10 text-green-500",
            subtext: `${stats.pendingTopups} pending`,
        },
        {
            title: "Total Transactions",
            value: stats.totalTransactions,
            icon: ShoppingCart,
            color: "bg-purple-500/10 text-purple-500",
            subtext: `${stats.todayTransactions} hari ini`,
        },
        {
            title: "Total Revenue",
            value: `Rp ${stats.totalRevenue.toLocaleString("id-ID")}`,
            icon: TrendingUp,
            color: "bg-[#bef264]/10 text-[#bef264]",
            trend: "+8%",
            trendUp: true,
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Dashboard</h1>
                <p className="text-neutral-500">Overview sistem PicisPay</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                    <p className="text-sm text-neutral-500 mb-1">Total Users</p>
                    <p className="text-2xl font-bold text-white">{loading ? "-" : stats.totalUsers}</p>
                    <p className="text-xs text-green-500 mt-2">+12% bulan ini</p>
                </div>
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                    <p className="text-sm text-neutral-500 mb-1">Total Top-ups</p>
                    <p className="text-2xl font-bold text-white">{loading ? "-" : stats.totalTopups}</p>
                    <p className="text-xs text-neutral-600 mt-2">{stats.pendingTopups} pending</p>
                </div>
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                    <p className="text-sm text-neutral-500 mb-1">Transactions</p>
                    <p className="text-2xl font-bold text-white">{loading ? "-" : stats.totalTransactions}</p>
                    <p className="text-xs text-neutral-600 mt-2">{stats.todayTransactions} hari ini</p>
                </div>
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                    <p className="text-sm text-neutral-500 mb-1">Revenue</p>
                    <p className="text-2xl font-bold text-[#bef264]">{loading ? "-" : `Rp ${stats.totalRevenue.toLocaleString("id-ID")}`}</p>
                    <p className="text-xs text-green-500 mt-2">+8% bulan ini</p>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Top-ups */}
                <div>
                    <h3 className="text-lg font-bold text-white mb-4">Top-up Terbaru</h3>
                    <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden">
                        {/* Placeholder data since we don't have real list yet */}
                        <div className="p-8 text-center text-neutral-600 text-sm">
                            Belum ada data top-up
                        </div>
                    </div>
                </div>

                {/* Recent Transactions */}
                <div>
                    <h3 className="text-lg font-bold text-white mb-4">Transaksi Terbaru</h3>
                    <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden">
                        <div className="p-8 text-center text-neutral-600 text-sm">
                            Belum ada data transaksi
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
