"use client";

import { useEffect, useState } from "react";
import { Search, RefreshCw, Check, X, Clock, AlertCircle } from "lucide-react";

interface Transaction {
    id: string;
    userId: string;
    refId: string;
    buyerSkuCode: string;
    customerNo: string;
    productName: string | null;
    price: number;
    status: string;
    sn: string | null;
    message: string | null;
    createdAt: string;
}

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "sukses" | "pending" | "gagal">("all");

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/transactions");
            const data = await res.json();
            if (data.success) {
                setTransactions(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch transactions:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTransactions =
        filter === "all"
            ? transactions
            : transactions.filter((t) => t.status === filter);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "sukses":
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
            case "gagal":
                return (
                    <span className="flex items-center gap-1 text-xs bg-red-500/10 text-red-500 px-2 py-1 rounded-lg">
                        <X className="w-3 h-3" /> Gagal
                    </span>
                );
            default:
                return (
                    <span className="flex items-center gap-1 text-xs bg-neutral-500/10 text-neutral-500 px-2 py-1 rounded-lg">
                        <AlertCircle className="w-3 h-3" /> {status}
                    </span>
                );
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Transactions</h1>
                    <p className="text-neutral-500 text-sm mt-1">
                        Riwayat semua pembelian produk PPOB
                    </p>
                </div>
                <button
                    onClick={fetchTransactions}
                    className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-colors"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 flex-wrap">
                {[
                    { key: "all", label: "Semua" },
                    { key: "sukses", label: "Sukses" },
                    { key: "pending", label: "Pending" },
                    { key: "gagal", label: "Gagal" },
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
                                    Ref ID
                                </th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">
                                    Produk
                                </th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">
                                    Tujuan
                                </th>
                                <th className="text-right px-6 py-4 text-sm font-medium text-neutral-500">
                                    Harga
                                </th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">
                                    Status
                                </th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">
                                    SN
                                </th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">
                                    Waktu
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-neutral-500">
                                        Loading...
                                    </td>
                                </tr>
                            ) : filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-neutral-500">
                                        Belum ada transaksi
                                    </td>
                                </tr>
                            ) : (
                                filteredTransactions.map((trx) => (
                                    <tr
                                        key={trx.id}
                                        className="border-b border-neutral-800 hover:bg-neutral-800/50"
                                    >
                                        <td className="px-6 py-4 text-xs font-mono text-neutral-400">
                                            {trx.refId.substring(0, 20)}...
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {trx.productName || trx.buyerSkuCode}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-neutral-400">
                                            {trx.customerNo}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-right font-semibold">
                                            Rp {trx.price.toLocaleString("id-ID")}
                                        </td>
                                        <td className="px-6 py-4">{getStatusBadge(trx.status)}</td>
                                        <td className="px-6 py-4 text-xs font-mono text-neutral-500">
                                            {trx.sn || "-"}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-neutral-500">
                                            {new Date(trx.createdAt).toLocaleString("id-ID")}
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
