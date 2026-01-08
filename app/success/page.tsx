'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Download, Home, Share2, Copy } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

function SuccessContent() {
    const searchParams = useSearchParams();
    const [copied, setCopied] = useState(false);

    const product = searchParams.get('product') || 'Produk';
    const total = parseInt(searchParams.get('total') || '0');
    const detail = searchParams.get('detail') || '';
    const type = searchParams.get('type') || 'general';

    // Generate transaction ID from timestamp
    const trxId = `PCS${Date.now().toString().slice(-10)}`;
    const timestamp = new Date().toLocaleString('id-ID', {
        dateStyle: 'long',
        timeStyle: 'short',
    });

    const copyTrxId = () => {
        navigator.clipboard.writeText(trxId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-black text-white pb-32 font-sans">
            {/* Success Animation */}
            <div className="pt-16 pb-8 px-6 flex flex-col items-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', duration: 0.5 }}
                    className="w-24 h-24 bg-[#bef264] rounded-full flex items-center justify-center mb-6 shadow-[0_0_60px_rgba(190,242,100,0.4)]"
                >
                    <CheckCircle className="w-12 h-12 text-black" />
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl font-black text-center mb-2"
                >
                    Transaksi Berhasil!
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-neutral-400 text-center"
                >
                    Pembayaran telah dikonfirmasi
                </motion.p>
            </div>

            {/* Receipt Card */}
            <div className="px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 relative overflow-hidden"
                >
                    {/* Decorative circles for receipt look */}
                    <div className="absolute -left-3 top-1/2 w-6 h-6 bg-black rounded-full" />
                    <div className="absolute -right-3 top-1/2 w-6 h-6 bg-black rounded-full" />

                    <div className="space-y-4">
                        {/* Transaction ID */}
                        <div className="flex justify-between items-center pb-4 border-b border-dashed border-neutral-800">
                            <div>
                                <p className="text-xs text-neutral-500 mb-1">ID Transaksi</p>
                                <p className="font-mono font-bold text-white">{trxId}</p>
                            </div>
                            <button
                                onClick={copyTrxId}
                                className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 transition-colors"
                            >
                                <Copy className={`w-5 h-5 ${copied ? 'text-[#bef264]' : 'text-neutral-400'}`} />
                            </button>
                        </div>

                        {/* Details */}
                        <div className="space-y-3 py-2">
                            <div className="flex justify-between">
                                <span className="text-neutral-400">Produk</span>
                                <span className="font-semibold text-white">{product}</span>
                            </div>
                            {detail && (
                                <div className="flex justify-between">
                                    <span className="text-neutral-400">Tujuan</span>
                                    <span className="font-semibold text-white">{detail}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-neutral-400">Waktu</span>
                                <span className="font-semibold text-white text-right text-sm">{timestamp}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-400">Status</span>
                                <span className="font-semibold text-[#bef264]">Sukses</span>
                            </div>
                        </div>

                        {/* Total */}
                        <div className="pt-4 border-t border-dashed border-neutral-800">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-white">Total Dibayar</span>
                                <span className="text-2xl font-black text-[#bef264]">Rp {total.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Token/Serial for PLN */}
                        {type === 'pln' && (
                            <div className="mt-4 p-4 bg-[#bef264]/10 rounded-2xl border border-[#bef264]/20">
                                <p className="text-xs text-[#bef264] mb-2 font-semibold">TOKEN PLN</p>
                                <p className="font-mono text-xl font-black text-white tracking-widest">
                                    1234-5678-9012-3456-7890
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 mt-6 space-y-3">
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="w-full py-4 rounded-2xl font-bold bg-neutral-900 border border-neutral-800 text-white flex items-center justify-center gap-2 hover:bg-neutral-800 transition-colors"
                >
                    <Download className="w-5 h-5" />
                    Simpan Bukti
                </motion.button>

                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="w-full py-4 rounded-2xl font-bold bg-neutral-900 border border-neutral-800 text-white flex items-center justify-center gap-2 hover:bg-neutral-800 transition-colors"
                >
                    <Share2 className="w-5 h-5" />
                    Bagikan
                </motion.button>
            </div>

            {/* Back to Home */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-black/90 backdrop-blur-lg border-t border-neutral-800">
                <Link href="/">
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-4 rounded-2xl font-bold text-lg bg-[#bef264] text-black hover:bg-[#d4fc79] transition-colors flex items-center justify-center gap-2"
                    >
                        <Home className="w-5 h-5" />
                        Kembali ke Beranda
                    </motion.button>
                </Link>
            </div>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#bef264] border-t-transparent rounded-full animate-spin" /></div>}>
            <SuccessContent />
        </Suspense>
    );
}
