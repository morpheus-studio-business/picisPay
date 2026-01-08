'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, ShieldCheck, Wallet, CreditCard, QrCode } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState } from 'react';

function CheckoutContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState('saldo');

    const product = searchParams.get('product') || 'Produk';
    const price = parseInt(searchParams.get('price') || '0');
    const detail = searchParams.get('detail') || '';
    const type = searchParams.get('type') || 'general';

    const adminFee = type === 'pln' ? 2500 : type === 'pulsa' || type === 'data' ? 1500 : 2000;
    const total = price + adminFee;

    const handlePayment = () => {
        setIsProcessing(true);
        // Simulate payment processing
        setTimeout(() => {
            router.push(`/success?product=${encodeURIComponent(product)}&price=${price}&total=${total}&detail=${encodeURIComponent(detail)}&type=${type}`);
        }, 2000);
    };

    const paymentMethods = [
        { id: 'saldo', name: 'Saldo picisPay', icon: Wallet, balance: 1050000 },
        { id: 'qris', name: 'QRIS', icon: QrCode, balance: null },
        { id: 'va', name: 'Virtual Account', icon: CreditCard, balance: null },
    ];

    return (
        <div className="min-h-screen bg-black text-white pb-32 font-sans">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-white/5 px-6 pt-8 pb-4 flex items-center gap-4">
                <Link href="/" className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-white hover:bg-[#bef264] hover:text-black transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-lg font-bold">Konfirmasi Pembayaran</h1>
            </header>

            {/* Order Summary */}
            <div className="px-6 py-6">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6"
                >
                    <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4">Detail Pesanan</h3>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-neutral-400">Produk</span>
                            <span className="font-semibold text-white">{product}</span>
                        </div>
                        {detail && (
                            <div className="flex justify-between items-center">
                                <span className="text-neutral-400">Tujuan</span>
                                <span className="font-semibold text-white">{detail}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center">
                            <span className="text-neutral-400">Harga</span>
                            <span className="font-semibold text-white">Rp {price.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-neutral-400">Biaya Admin</span>
                            <span className="font-semibold text-white">Rp {adminFee.toLocaleString()}</span>
                        </div>

                        <div className="border-t border-neutral-800 pt-3 mt-3">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-white">Total Bayar</span>
                                <span className="text-2xl font-black text-[#bef264]">Rp {total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Payment Methods */}
            <div className="px-6 mb-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4">Metode Pembayaran</h3>
                <div className="space-y-3">
                    {paymentMethods.map((method) => (
                        <motion.div
                            key={method.id}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedPayment(method.id)}
                            className={`bg-neutral-900 border rounded-2xl p-4 cursor-pointer transition-all flex items-center justify-between ${selectedPayment === method.id
                                ? 'border-[#bef264] bg-[#bef264]/5'
                                : 'border-neutral-800 hover:border-neutral-700'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedPayment === method.id ? 'bg-[#bef264] text-black' : 'bg-neutral-800 text-neutral-400'
                                    }`}>
                                    <method.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-semibold text-white">{method.name}</p>
                                    {method.balance !== null && (
                                        <p className="text-xs text-neutral-500">Saldo: Rp {method.balance.toLocaleString()}</p>
                                    )}
                                </div>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedPayment === method.id
                                ? 'border-[#bef264] bg-[#bef264]'
                                : 'border-neutral-700'
                                }`}>
                                {selectedPayment === method.id && (
                                    <div className="w-2 h-2 bg-black rounded-full" />
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Security Badge */}
            <div className="px-6 mb-6">
                <div className="flex items-center gap-2 text-neutral-500">
                    <ShieldCheck className="w-4 h-4 text-green-400" />
                    <span className="text-xs">Transaksi aman & terenkripsi</span>
                </div>
            </div>

            {/* Pay Button */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-black/90 backdrop-blur-lg border-t border-neutral-800">
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className={`w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${isProcessing
                        ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                        : 'bg-[#bef264] text-black hover:bg-[#d4fc79]'
                        }`}
                >
                    {isProcessing ? (
                        <>
                            <div className="w-5 h-5 border-2 border-neutral-500 border-t-transparent rounded-full animate-spin" />
                            Memproses...
                        </>
                    ) : (
                        <>Bayar Rp {total.toLocaleString()}</>
                    )}
                </motion.button>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#bef264] border-t-transparent rounded-full animate-spin" /></div>}>
            <CheckoutContent />
        </Suspense>
    );
}
