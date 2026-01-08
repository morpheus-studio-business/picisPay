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
    const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
    const [logs, setLogs] = useState<any[]>([]);
    const [loadingLogs, setLoadingLogs] = useState(false);
    const [showLogs, setShowLogs] = useState(false);

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

    const handleViewLogs = async (tx: Transaction) => {
        setSelectedTx(tx);
        setShowLogs(true);
        setLoadingLogs(true);
        try {
            const res = await fetch(`/api/admin/transactions/${tx.refId}/logs`);
            const data = await res.json();
            if (data.success) {
                setLogs(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch logs');
        } finally {
            setLoadingLogs(false);
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
            {/* ... Header & Filters ... */}
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

            {/* Desktop Table */}
            <div className="hidden md:block bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-neutral-800">
                                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">Ref ID</th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">Produk</th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">Tujuan</th>
                                <th className="text-right px-6 py-4 text-sm font-medium text-neutral-500">Harga</th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">Status</th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">Waktu</th>
                                <th className="text-right px-6 py-4 text-sm font-medium text-neutral-500">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-neutral-500">Loading...</td>
                                </tr>
                            ) : filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-neutral-500">Belum ada transaksi</td>
                                </tr>
                            ) : (
                                filteredTransactions.map((trx) => (
                                    <tr key={trx.id} className="border-b border-neutral-800 hover:bg-neutral-800/50">
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
                                        <td className="px-6 py-4 text-sm text-neutral-500">
                                            {new Date(trx.createdAt).toLocaleString("id-ID")}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleViewLogs(trx)}
                                                className="text-xs bg-neutral-800 hover:bg-neutral-700 px-3 py-1.5 rounded-lg text-white transition-colors"
                                            >
                                                Logs
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {loading ? (
                    <div className="text-center py-8 text-neutral-500">Loading...</div>
                ) : filteredTransactions.length === 0 ? (
                    <div className="text-center py-8 text-neutral-500">Belum ada transaksi</div>
                ) : (
                    filteredTransactions.map((trx) => (
                        <div key={trx.id} className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex flex-col gap-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-semibold text-white">{trx.productName || trx.buyerSkuCode}</div>
                                    <div className="text-xs text-neutral-500 font-mono mt-1">{trx.refId}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-neutral-500">{new Date(trx.createdAt).toLocaleDateString("id-ID")}</div>
                                    <div className="text-xs text-neutral-600">{new Date(trx.createdAt).toLocaleTimeString("id-ID")}</div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center bg-neutral-950 p-3 rounded-lg">
                                <span className="text-neutral-400 text-sm">{trx.customerNo}</span>
                                <span className="text-[#bef264] font-bold">Rp {trx.price.toLocaleString("id-ID")}</span>
                            </div>

                            <div className="flex justify-between items-center pt-2 border-t border-neutral-800">
                                <div>{getStatusBadge(trx.status)}</div>
                                <button
                                    onClick={() => handleViewLogs(trx)}
                                    className="text-xs bg-neutral-800 hover:bg-neutral-700 px-3 py-1.5 rounded-lg text-white transition-colors"
                                >
                                    View Logs
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Logs Modal */}
            {showLogs && selectedTx && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setShowLogs(false)}>
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold">Transaction Logs</h3>
                                <p className="text-sm text-neutral-500 font-mono mt-1">{selectedTx.refId}</p>
                            </div>
                            <button onClick={() => setShowLogs(false)} className="p-2 hover:bg-neutral-800 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {loadingLogs ? (
                                <div className="text-center py-8"><RefreshCw className="w-8 h-8 animate-spin mx-auto opacity-50" /></div>
                            ) : logs.length === 0 ? (
                                <div className="text-center py-8 text-neutral-500">No logs found for this transaction.</div>
                            ) : (
                                logs.map((log) => (
                                    <div key={log.id} className="bg-black/50 border border-neutral-800 rounded-xl p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${log.type === 'request' ? 'bg-blue-900 text-blue-300' :
                                                    log.type === 'response' ? 'bg-green-900 text-green-300' : 'bg-neutral-800'
                                                    }`}>
                                                    {log.type}
                                                </span>
                                                <span className="text-xs text-neutral-400">{log.provider}</span>
                                            </div>
                                            <span className="text-xs text-neutral-500">
                                                {new Date(log.createdAt).toLocaleTimeString()}
                                            </span>
                                        </div>
                                        <pre className="text-[10px] font-mono whitespace-pre-wrap text-neutral-300 bg-black p-3 rounded-lg overflow-x-auto">
                                            {log.payload ? JSON.stringify(JSON.parse(log.payload), null, 2) : 'No Payload'}
                                        </pre>
                                        {log.statusCode && (
                                            <div className="mt-2 text-xs text-neutral-500">Status: {log.statusCode}</div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
