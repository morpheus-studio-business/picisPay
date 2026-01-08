'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, Plus, CreditCard, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function PaymentMethodsPage() {
    return (
        <div className="min-h-screen bg-black text-white pb-24 font-sans">
            <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-white/5 px-6 pt-8 pb-4 flex items-center gap-4">
                <Link href="/profile" className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-white hover:bg-[#bef264] hover:text-black transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-lg font-bold">Metode Pembayaran</h1>
            </header>

            <div className="px-6 py-8 space-y-4">

                {/* Card 1 */}
                <div className="bg-linear-to-br from-blue-800 to-blue-600 rounded-3xl p-6 relative overflow-hidden shadow-lg">
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="font-bold text-lg">BCA Debit</h3>
                            <CreditCard className="w-6 h-6 text-white/50" />
                        </div>
                        <p className="text-white/70 text-sm mb-1">Nomor Kartu</p>
                        <p className="font-mono text-xl tracking-wider">•••• •••• •••• 8842</p>
                    </div>
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                </div>

                {/* Card 2 */}
                <div className="bg-linear-to-br from-neutral-800 to-neutral-700 rounded-3xl p-6 relative overflow-hidden shadow-lg border border-white/5">
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="font-bold text-lg">Mandiri</h3>
                            <CreditCard className="w-6 h-6 text-white/50" />
                        </div>
                        <p className="text-white/70 text-sm mb-1">Nomor Kartu</p>
                        <p className="font-mono text-xl tracking-wider">•••• •••• •••• 1234</p>
                    </div>
                    <button className="absolute top-4 right-4 p-2 bg-black/20 rounded-full text-red-400 hover:bg-black/50 transition-colors">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>

                {/* Add New */}
                <button className="w-full bg-neutral-900 border border-neutral-800 border-dashed rounded-3xl p-6 flex flex-col items-center justify-center gap-3 text-neutral-500 hover:border-[#bef264] hover:text-[#bef264] transition-colors group">
                    <div className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center group-hover:bg-[#bef264]/10 transition-colors">
                        <Plus className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-sm">Tambah Kartu Baru</span>
                </button>

            </div>
        </div>
    );
}
