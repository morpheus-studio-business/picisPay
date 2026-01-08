'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ArrowUpRight, ArrowDownLeft, Loader2, RefreshCw, Calendar, Printer, X, Bluetooth, Check, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { useSession } from '@/lib/auth-client';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { id } from 'date-fns/locale';
import { bluetoothPrinter } from '@/lib/bluetooth-printer';

interface MutasiItem {
    id: string;
    type: string;
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    referenceId: string | null;
    description: string | null;
    createdAt: string;
}

export default function MutasiPage() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [mutasi, setMutasi] = useState<MutasiItem[]>([]);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showPrintOptions, setShowPrintOptions] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [printing, setPrinting] = useState(false);
    const [btConnected, setBtConnected] = useState(false);
    const [btDeviceName, setBtDeviceName] = useState<string | null>(null);
    const [btError, setBtError] = useState<string | null>(null);
    const [btSupported, setBtSupported] = useState(true);

    useEffect(() => {
        if (session?.user) {
            fetchMutasi();
        }
        // Check Bluetooth support
        if (typeof window !== 'undefined') {
            setBtSupported(bluetoothPrinter.isSupported());
        }
    }, [session]);

    const fetchMutasi = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/mutasi');
            const data = await res.json();
            if (data.success) {
                setMutasi(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch mutasi');
        } finally {
            setLoading(false);
        }
    };

    // Filter mutasi by date range
    const filteredMutasi = useMemo(() => {
        if (!startDate || !endDate) return mutasi;

        const start = startOfDay(new Date(startDate));
        const end = endOfDay(new Date(endDate));

        return mutasi.filter(item => {
            const itemDate = new Date(item.createdAt);
            return isWithinInterval(itemDate, { start, end });
        });
    }, [mutasi, startDate, endDate]);

    // Calculate summary for filtered data
    const summary = useMemo(() => {
        let totalIn = 0;
        let totalOut = 0;
        filteredMutasi.forEach(item => {
            if (item.type === 'topup' || item.type === 'refund') {
                totalIn += item.amount;
            } else {
                totalOut += item.amount;
            }
        });
        return { totalIn, totalOut, count: filteredMutasi.length };
    }, [filteredMutasi]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), 'dd MMM yyyy, HH:mm', { locale: id });
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'topup': return 'text-[#bef264]';
            case 'refund': return 'text-blue-400';
            case 'purchase': return 'text-white';
            default: return 'text-neutral-400';
        }
    };

    const getTypeIcon = (type: string) => {
        if (type === 'topup' || type === 'refund') {
            return <ArrowDownLeft className="w-4 h-4" />;
        }
        return <ArrowUpRight className="w-4 h-4" />;
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'topup': return 'Isi Saldo';
            case 'refund': return 'Refund';
            case 'purchase': return 'Pembelian';
            default: return type;
        }
    };

    // Connect to Bluetooth printer
    const connectBluetooth = async () => {
        setBtError(null);
        try {
            await bluetoothPrinter.connect();
            setBtConnected(true);
            setBtDeviceName(bluetoothPrinter.getDeviceName());
        } catch (error: any) {
            setBtError(error.message || 'Gagal menghubungkan printer');
            setBtConnected(false);
        }
    };

    // Disconnect Bluetooth printer
    const disconnectBluetooth = () => {
        bluetoothPrinter.disconnect();
        setBtConnected(false);
        setBtDeviceName(null);
    };

    // Print via Bluetooth thermal printer
    const handleBluetoothPrint = async () => {
        if (!btConnected) {
            setBtError('Hubungkan printer terlebih dahulu');
            return;
        }

        setPrinting(true);
        setBtError(null);

        try {
            const dateRange = startDate && endDate
                ? `${format(new Date(startDate), 'dd/MM/yyyy')} - ${format(new Date(endDate), 'dd/MM/yyyy')}`
                : undefined;

            await bluetoothPrinter.printMutasiReceipt({
                title: 'Laporan Mutasi',
                dateRange,
                items: filteredMutasi.map(item => ({
                    type: item.type,
                    amount: item.amount,
                    date: format(new Date(item.createdAt), 'dd/MM/yy HH:mm'),
                    description: item.description || undefined,
                })),
                summary,
            });

            setShowPrintOptions(false);
        } catch (error: any) {
            setBtError(error.message || 'Gagal mencetak');
        } finally {
            setPrinting(false);
        }
    };

    // Print via browser dialog
    const handleBrowserPrint = () => {
        setPrinting(true);

        const printContent = `
            <html>
            <head>
                <title>Laporan Mutasi Saldo</title>
                <style>
                    body { font-family: 'Courier New', monospace; font-size: 12px; padding: 10px; }
                    h1 { font-size: 14px; text-align: center; margin-bottom: 10px; }
                    .header { text-align: center; margin-bottom: 15px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
                    .date-range { font-size: 10px; margin-bottom: 10px; }
                    .item { border-bottom: 1px dashed #ccc; padding: 8px 0; }
                    .row { display: flex; justify-content: space-between; }
                    .amount { font-weight: bold; }
                    .plus { color: green; }
                    .minus { color: red; }
                    .summary { margin-top: 15px; border-top: 2px solid #000; padding-top: 10px; }
                    .summary-row { display: flex; justify-content: space-between; margin: 5px 0; }
                    .footer { text-align: center; margin-top: 20px; font-size: 10px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>LAPORAN MUTASI SALDO</h1>
                    <p>PicisPay</p>
                    ${startDate && endDate ? `<p class="date-range">Periode: ${format(new Date(startDate), 'dd/MM/yyyy')} - ${format(new Date(endDate), 'dd/MM/yyyy')}</p>` : ''}
                </div>
                
                ${filteredMutasi.map(item => `
                    <div class="item">
                        <div class="row">
                            <span>${getTypeLabel(item.type)}</span>
                            <span class="amount ${item.type === 'topup' || item.type === 'refund' ? 'plus' : 'minus'}">
                                ${item.type === 'topup' || item.type === 'refund' ? '+' : '-'}${formatCurrency(item.amount)}
                            </span>
                        </div>
                        <div class="row" style="font-size: 10px; color: #666;">
                            <span>${format(new Date(item.createdAt), 'dd/MM/yyyy HH:mm')}</span>
                        </div>
                        ${item.description ? `<div style="font-size: 10px; color: #888;">${item.description}</div>` : ''}
                    </div>
                `).join('')}
                
                <div class="summary">
                    <div class="summary-row">
                        <span>Total Masuk:</span>
                        <span class="plus">${formatCurrency(summary.totalIn)}</span>
                    </div>
                    <div class="summary-row">
                        <span>Total Keluar:</span>
                        <span class="minus">${formatCurrency(summary.totalOut)}</span>
                    </div>
                    <div class="summary-row">
                        <span>Jumlah Transaksi:</span>
                        <span>${summary.count}</span>
                    </div>
                </div>
                
                <div class="footer">
                    <p>Dicetak: ${format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
                </div>
            </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 250);
        }

        setPrinting(false);
        setShowPrintOptions(false);
    };

    const clearDateFilter = () => {
        setStartDate('');
        setEndDate('');
    };

    if (!session) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <p className="text-neutral-500">Silakan login terlebih dahulu</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white pb-24 font-sans">
            <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-white/5 px-6 pt-8 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/" className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-white hover:bg-[#bef264] hover:text-black transition-colors">
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-lg font-bold">Mutasi Saldo</h1>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowDatePicker(true)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${startDate && endDate ? 'bg-[#bef264] text-black' : 'bg-neutral-900 text-white hover:bg-neutral-800'}`}
                    >
                        <Calendar className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setShowPrintOptions(true)}
                        disabled={filteredMutasi.length === 0}
                        className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-white hover:bg-neutral-800 disabled:opacity-50"
                    >
                        <Printer className="w-5 h-5" />
                    </button>
                    <button onClick={fetchMutasi} className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-white hover:bg-neutral-800">
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </header>

            {/* Date Range Filter Badge */}
            {startDate && endDate && (
                <div className="px-6 pt-4">
                    <div className="bg-[#bef264]/10 border border-[#bef264]/20 rounded-2xl px-4 py-3 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-[#bef264]">Filter Tanggal Aktif</p>
                            <p className="text-sm text-white font-semibold">
                                {format(new Date(startDate), 'dd MMM yyyy')} - {format(new Date(endDate), 'dd MMM yyyy')}
                            </p>
                        </div>
                        <button onClick={clearDateFilter} className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center">
                            <X className="w-4 h-4 text-white" />
                        </button>
                    </div>
                </div>
            )}

            {/* Current Balance */}
            <div className="px-6 py-6">
                <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 mb-6 text-center">
                    <p className="text-neutral-500 text-sm mb-1">Saldo Saat Ini</p>
                    <p className="text-3xl font-black text-[#bef264]">
                        {formatCurrency((session.user as any).balance || 0)}
                    </p>
                </div>

                {/* Summary when filtered */}
                {startDate && endDate && (
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 text-center">
                            <p className="text-[10px] text-neutral-500 uppercase">Masuk</p>
                            <p className="text-sm font-bold text-[#bef264]">{formatCurrency(summary.totalIn)}</p>
                        </div>
                        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 text-center">
                            <p className="text-[10px] text-neutral-500 uppercase">Keluar</p>
                            <p className="text-sm font-bold text-white">{formatCurrency(summary.totalOut)}</p>
                        </div>
                        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 text-center">
                            <p className="text-[10px] text-neutral-500 uppercase">Transaksi</p>
                            <p className="text-sm font-bold text-white">{summary.count}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Mutasi List */}
            <div className="px-6">
                <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-4">
                    Riwayat Mutasi {filteredMutasi.length !== mutasi.length && `(${filteredMutasi.length} dari ${mutasi.length})`}
                </h2>

                {loading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="w-8 h-8 animate-spin text-[#bef264]" />
                    </div>
                ) : filteredMutasi.length === 0 ? (
                    <div className="text-center py-10 text-neutral-500">
                        <p>{startDate && endDate ? 'Tidak ada mutasi di rentang tanggal ini' : 'Belum ada mutasi'}</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredMutasi.map((item, idx) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.03 }}
                                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.type === 'topup' || item.type === 'refund'
                                            ? 'bg-[#bef264]/10 text-[#bef264]'
                                            : 'bg-red-500/10 text-red-400'
                                            }`}>
                                            {getTypeIcon(item.type)}
                                        </div>
                                        <div>
                                            <p className={`font-bold text-sm ${getTypeColor(item.type)}`}>
                                                {getTypeLabel(item.type)}
                                            </p>
                                            <p className="text-xs text-neutral-500">{formatDate(item.createdAt)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-bold ${item.type === 'topup' || item.type === 'refund'
                                            ? 'text-[#bef264]'
                                            : 'text-white'
                                            }`}>
                                            {item.type === 'topup' || item.type === 'refund' ? '+' : '-'}
                                            {formatCurrency(item.amount)}
                                        </p>
                                    </div>
                                </div>

                                {item.description && (
                                    <p className="text-xs text-neutral-500 mb-2 pl-11">{item.description}</p>
                                )}

                                <div className="flex justify-between text-[10px] text-neutral-600 pl-11">
                                    <span>Sebelum: {formatCurrency(item.balanceBefore)}</span>
                                    <span>Sesudah: {formatCurrency(item.balanceAfter)}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Date Picker Modal */}
            <AnimatePresence>
                {showDatePicker && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 z-50 flex items-end justify-center"
                        onClick={() => setShowDatePicker(false)}
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="bg-neutral-900 rounded-t-3xl w-full max-w-lg p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-bold">Filter Tanggal</h2>
                                <button onClick={() => setShowDatePicker(false)} className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="bg-neutral-800 rounded-2xl p-4">
                                    <label className="text-xs text-neutral-500 block mb-2">Dari Tanggal</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#bef264]"
                                    />
                                </div>
                                <div className="bg-neutral-800 rounded-2xl p-4">
                                    <label className="text-xs text-neutral-500 block mb-2">Sampai Tanggal</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#bef264]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => {
                                        clearDateFilter();
                                        setShowDatePicker(false);
                                    }}
                                    className="w-full bg-neutral-800 text-white font-bold rounded-2xl py-4 hover:bg-neutral-700 transition-colors"
                                >
                                    Reset
                                </button>
                                <button
                                    onClick={() => setShowDatePicker(false)}
                                    disabled={!startDate || !endDate}
                                    className="w-full bg-[#bef264] text-black font-bold rounded-2xl py-4 hover:bg-[#bef264]/90 transition-colors disabled:opacity-50"
                                >
                                    Terapkan
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Print Options Modal */}
            <AnimatePresence>
                {showPrintOptions && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 z-50 flex items-end justify-center"
                        onClick={() => setShowPrintOptions(false)}
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="bg-neutral-900 rounded-t-3xl w-full max-w-lg p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-bold">Cetak Laporan</h2>
                                <button onClick={() => setShowPrintOptions(false)} className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Bluetooth Printer Section */}
                            <div className="bg-neutral-800 rounded-2xl p-4 mb-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <Bluetooth className={`w-5 h-5 ${btConnected ? 'text-[#bef264]' : 'text-neutral-500'}`} />
                                        <div>
                                            <p className="text-sm font-semibold">Printer Bluetooth</p>
                                            <p className="text-xs text-neutral-500">
                                                {btConnected ? btDeviceName : 'Belum terhubung'}
                                            </p>
                                        </div>
                                    </div>
                                    {btConnected ? (
                                        <div className="flex items-center gap-2">
                                            <Check className="w-4 h-4 text-[#bef264]" />
                                            <button
                                                onClick={disconnectBluetooth}
                                                className="text-xs text-red-400 hover:underline"
                                            >
                                                Putus
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={connectBluetooth}
                                            disabled={!btSupported}
                                            className="bg-[#bef264] text-black text-xs font-bold px-4 py-2 rounded-xl disabled:opacity-50"
                                        >
                                            Hubungkan
                                        </button>
                                    )}
                                </div>

                                {!btSupported && (
                                    <div className="flex items-center gap-2 text-amber-400 text-xs">
                                        <AlertCircle className="w-4 h-4" />
                                        <span>Browser tidak mendukung Web Bluetooth</span>
                                    </div>
                                )}

                                {btError && (
                                    <div className="flex items-center gap-2 text-red-400 text-xs mt-2">
                                        <AlertCircle className="w-4 h-4" />
                                        <span>{btError}</span>
                                    </div>
                                )}

                                {btConnected && (
                                    <button
                                        onClick={handleBluetoothPrint}
                                        disabled={printing}
                                        className="w-full mt-3 bg-[#bef264] text-black font-bold rounded-xl py-3 hover:bg-[#bef264]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {printing ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Mencetak...
                                            </>
                                        ) : (
                                            <>
                                                <Printer className="w-4 h-4" />
                                                Cetak via Bluetooth
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>

                            {/* Browser Print Section */}
                            <div className="bg-neutral-800 rounded-2xl p-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <Printer className="w-5 h-5 text-neutral-500" />
                                    <div>
                                        <p className="text-sm font-semibold">Cetak via Browser</p>
                                        <p className="text-xs text-neutral-500">Gunakan dialog print bawaan</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleBrowserPrint}
                                    disabled={printing}
                                    className="w-full bg-neutral-700 text-white font-bold rounded-xl py-3 hover:bg-neutral-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <Printer className="w-4 h-4" />
                                    Buka Dialog Print
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
