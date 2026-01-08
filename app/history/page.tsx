'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Filter, Search, Receipt, Share2, Download, Loader2, X, Printer } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useSession } from '@/lib/auth-client';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface Transaction {
    id: string;
    type: 'topup' | 'purchase';
    title: string;
    description: string;
    amount: number;
    status: string;
    date: string;
    details: any;
}

// Extend User type locally if needed or just use any for simple fix
interface CustomUser {
    name: string;
    email: string;
    image?: string | null;
    storeName?: string;
    storeAddress?: string;
    phone?: string;
    defaultMargin?: number;
}

export default function HistoryPage() {
    const { data: sessionData } = useSession();
    const session = sessionData as { user: CustomUser } | null; // Cast for now
    const [activeTab, setActiveTab] = useState('Semua');
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTrx, setSelectedTrx] = useState<Transaction | null>(null);
    const [sellingPrice, setSellingPrice] = useState<string>(''); // For receipt

    const tabs = ['Semua', 'Sukses', 'Pending', 'Gagal'];

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch('/api/history');
                const json = await res.json();
                if (json.success) {
                    setTransactions(json.data);
                }
            } catch (error) {
                console.error("Failed to fetch history", error);
            } finally {
                setLoading(false);
            }
        };

        if (session?.user) {
            fetchHistory();
        } else {
            setLoading(false); // Stop loading if not logged in (will show empty)
        }
    }, [session]);

    const filteredTransactions = transactions.filter(trx => {
        const statusMap: Record<string, string> = {
            'sukses': 'Sukses',
            'completed': 'Sukses',
            'pending': 'Pending',
            'gagal': 'Gagal',
            'failed': 'Gagal',
            'expired': 'Gagal'
        };
        const normalizedStatus = statusMap[trx.status.toLowerCase()] || trx.status;

        if (activeTab === 'Semua') return true;
        return normalizedStatus === activeTab;
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), 'dd MMM yyyy, HH:mm', { locale: id });
    };

    const handleOpenDetail = (trx: Transaction) => {
        // Set default selling price based on user's global margin
        const margin = session?.user?.defaultMargin || 0;
        const price = trx.amount + margin;

        setSellingPrice(price.toString());
        setSelectedTrx(trx);
    };

    // Placeholder for receipt printing/downloading
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-black text-white pb-24 font-sans print:bg-white print:text-black">
            {/* Header - Hide on Print */}
            <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-white/5 px-6 pt-8 pb-4 flex items-center justify-between print:hidden">
                <div className="flex items-center gap-4">
                    <Link href="/" className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-white hover:bg-[#bef264] hover:text-black transition-colors">
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-lg font-bold">Riwayat</h1>
                </div>
                {/* <button className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-white hover:text-[#bef264] transition-colors">
                    <Filter className="w-5 h-5" />
                </button> */}
            </header>

            {/* Tabs - Hide on Print */}
            <div className="px-6 py-4 flex gap-2 overflow-x-auto scrollbar-hide print:hidden">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap
              ${activeTab === tab
                                ? 'bg-[#bef264] text-black'
                                : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Transaction List */}
            <div className="px-6 space-y-3 print:hidden">
                {loading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="w-8 h-8 animate-spin text-[#bef264]" />
                    </div>
                ) : filteredTransactions.length === 0 ? (
                    <div className="text-center py-10 text-neutral-500">
                        <p>Belum ada transaksi</p>
                    </div>
                ) : (
                    filteredTransactions.map((trx, idx) => (
                        <motion.div
                            key={trx.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => handleOpenDetail(trx)}
                            className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex justify-between items-center cursor-pointer hover:bg-neutral-800 transition-colors active:scale-98"
                        >
                            <div className="flex-1">
                                <h4 className="font-bold text-sm mb-1 truncate pr-2">{trx.title}</h4>
                                <p className="text-xs text-neutral-500">{formatDate(trx.date)}</p>
                            </div>
                            <div className="text-right whitespace-nowrap">
                                <p className={`font-bold text-sm ${trx.type === 'topup' ? 'text-[#bef264]' : 'text-white'}`}>
                                    {trx.type === 'topup' ? '+' : '-'}{formatCurrency(trx.amount)}
                                </p>
                                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full inline-block mt-1 capitalize
                ${trx.status.toLowerCase() === 'sukses' || trx.status.toLowerCase() === 'completed' ? 'bg-[#bef264]/10 text-[#bef264]' :
                                        trx.status.toLowerCase() === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'}`}>
                                    {trx.status}
                                </span>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Receipt Modal */}
            <AnimatePresence>
                {selectedTrx && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/90 backdrop-blur-sm p-4 sm:p-6 print:absolute print:bg-white print:z-auto print:inset-auto"
                        onClick={() => setSelectedTrx(null)}
                    >
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            className="bg-neutral-900 w-full max-w-sm rounded-t-3xl sm:rounded-3xl overflow-hidden relative print:bg-white print:text-black print:w-full print:max-w-none print:shadow-none"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="p-6 pb-2 print:hidden flex justify-between items-center">
                                <h2 className="font-bold text-lg">Detail Transaksi</h2>
                                <button onClick={() => setSelectedTrx(null)} className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-neutral-400 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Struk Content */}
                            <div id="receipt-area" className="p-6 bg-white text-black m-4 rounded-xl print:m-0 print:p-0 print:rounded-none">
                                <div className="text-center border-b border-dashed border-neutral-300 pb-4 mb-4">
                                    <h3 className="font-bold text-lg">{session?.user?.storeName || session?.user?.name || "picisPay Cell"}</h3>
                                    <p className="text-xs text-neutral-500">{session?.user?.storeAddress || "Alamat Toko"}</p>
                                    <p className="text-xs text-neutral-500">{session?.user?.phone || "-"}</p>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-neutral-500">Tanggal</span>
                                        <span className="font-mono">{formatDate(selectedTrx.date)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-neutral-500">No. Ref</span>
                                        <span className="font-mono">{selectedTrx.type === 'purchase' ? selectedTrx.details.refId : selectedTrx.details.orderId}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-neutral-500">Produk</span>
                                        <span className="font-medium text-right w-1/2">{selectedTrx.title}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-neutral-500">Tujuan</span>
                                        <span className="font-mono">{selectedTrx.description}</span>
                                    </div>
                                    {selectedTrx.details.sn && (
                                        <div className="flex justify-between text-xs">
                                            <span className="text-neutral-500">SN</span>
                                            <span className="font-mono">{selectedTrx.details.sn}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="border-t border-dashed border-neutral-300 pt-4 mb-2">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold text-sm">Total Bayar</span>
                                        {/* Input Harga Jual Custom */}
                                        <div className="flex items-center gap-1 print:hidden">
                                            <span className="text-xs text-neutral-400 font-normal mr-1">Edit:</span>
                                            <input
                                                type="number"
                                                value={sellingPrice}
                                                onChange={(e) => setSellingPrice(e.target.value)}
                                                className="w-24 text-right border-b border-neutral-300 focus:outline-none focus:border-black font-bold text-lg p-0 h-7"
                                            />
                                        </div>
                                        <span className="font-bold text-xl hidden print:block">
                                            {formatCurrency(parseInt(sellingPrice) || 0)}
                                        </span>
                                    </div>
                                    {/* Display currency only when not editing in print mode logic handled above basically */}
                                </div>

                                <div className="text-center mt-6">
                                    <p className="text-[10px] text-neutral-400">Terima kasih atas kunjungan Anda</p>
                                    <p className="text-[10px] text-neutral-400">--- Simpan struk ini sebagai bukti ---</p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="p-6 pt-0 flex gap-3 print:hidden">
                                <button
                                    onClick={() => window.print()}
                                    className="flex-1 bg-[#bef264] text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#bef264]/90 transition-colors"
                                >
                                    <Printer className="w-5 h-5" />
                                    Cetak
                                </button>
                                <button className="flex-1 bg-neutral-800 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-neutral-700 transition-colors">
                                    <Share2 className="w-5 h-5" />
                                    Share
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #receipt-area, #receipt-area * {
                        visibility: visible;
                    }
                    #receipt-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0;
                        padding: 20px;
                    }
                }
            `}</style>
        </div>
    );
}
