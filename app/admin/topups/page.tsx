"use client";

import { useEffect, useState } from "react";
import { Search, RefreshCw, Check, X, Clock } from "lucide-react";

interface Topup {
    id: string;
    userId: string;
    orderId: string;
    amount: number;
    fee: number | null;
    status: string;
    paymentMethod: string | null;
    createdAt: string;
    completedAt: string | null;
}

export default function TopupsPage() {
    const [topups, setTopups] = useState<Topup[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

    useEffect(() => {
        fetchTopups();
    }, []);

    const fetchTopups = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/topups");
            const data = await res.json();
            if (data.success) {
                setTopups(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch topups:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTopups =
        filter === "all"
            ? topups
            : topups.filter((t) => t.status === filter);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "completed":
                return (
                    <span className="flex items-center gap-1 text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded-lg">
                        <Check className="w-3 h-3" /> Sukses
                    </span>
                );
            case "pending":
                return (
                    <span className="flex items-center gap-1 text-xs bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded-lg">
                        <Clock className="w-3 h-3" /> Pending
                    </span>
                );
            default:
                return (
                    <span className="flex items-center gap-1 text-xs bg-red-500/10 text-red-500 px-2 py-1 rounded-lg">
                        <X className="w-3 h-3" /> {status}
                    </span>
                );
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Top-ups</h1>
                    <p className="text-neutral-500 text-sm mt-1">
                        Riwayat semua transaksi top-up saldo
                    </p>
                </div>
                <button
                    onClick={fetchTopups}
                    className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-colors"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2">
                {[
                    { key: "all", label: "Semua" },
                    { key: "pending", label: "Pending" },
                    { key: "completed", label: "Sukses" },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key as typeof filter)}
                        className={`px-4 py-2 rounded-xl text-sm transition-colors ${filter === tab.key
                                ? "bg-[#bef264] text-black font-semibold"
                                : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-neutral-800">
                                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">
                                    Order ID
                                </th>
                                <th className="text-right px-6 py-4 text-sm font-medium text-neutral-500">
                                    Amount
                                </th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">
                                    Metode
                                </th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">
                                    Status
                                </th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">
                                    Waktu
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-neutral-500">
                                        Loading...
                                    </td>
                                </tr>
                            ) : filteredTopups.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-neutral-500">
                                        Belum ada data top-up
                                    </td>
                                </tr>
                            ) : (
                                filteredTopups.map((topup) => (
                                    <tr
                                        key={topup.id}
                                        className="border-b border-neutral-800 hover:bg-neutral-800/50"
                                    >
                                        <td className="px-6 py-4 text-sm font-mono text-neutral-300">
                                            {topup.orderId}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-right font-semibold">
                                            Rp {topup.amount.toLocaleString("id-ID")}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-neutral-400 uppercase">
                                            {topup.paymentMethod || "-"}
                                        </td>
                                        <td className="px-6 py-4">{getStatusBadge(topup.status)}</td>
                                        <td className="px-6 py-4 text-sm text-neutral-500">
                                            {new Date(topup.createdAt).toLocaleString("id-ID")}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
