'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, Key, Lock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function PinPage() {
    const [activeTab, setActiveTab] = useState('pin'); // 'pin' or 'password'

    return (
        <div className="min-h-screen bg-black text-white pb-24 font-sans">
            <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-white/5 px-6 pt-8 pb-4 flex items-center gap-4">
                <Link href="/profile" className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-white hover:bg-[#bef264] hover:text-black transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-lg font-bold">Keamanan Akses</h1>
            </header>

            {/* Tabs */}
            <div className="px-6 pt-6">
                <div className="flex bg-neutral-900 rounded-2xl p-1">
                    <button
                        onClick={() => setActiveTab('pin')}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'pin' ? 'bg-[#bef264] text-black shadow-md' : 'text-neutral-500 hover:text-white'}`}
                    >
                        Ganti PIN
                    </button>
                    <button
                        onClick={() => setActiveTab('password')}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'password' ? 'bg-[#bef264] text-black shadow-md' : 'text-neutral-500 hover:text-white'}`}
                    >
                        Ganti Password
                    </button>
                </div>
            </div>

            <div className="px-6 py-8">

                {activeTab === 'pin' ? (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key="pin-form">
                        <div className="w-16 h-16 bg-[#bef264]/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                            <Key className="w-8 h-8 text-[#bef264]" />
                        </div>
                        <h2 className="text-center font-bold text-xl mb-2">Ubah PIN Transaksi</h2>
                        <p className="text-center text-neutral-500 text-xs mb-8">Masukkan 6 digit PIN lama Anda untuk verifikasi.</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">PIN Lama</label>
                                <input type="password" placeholder="******" className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl px-4 py-4 text-center text-white focus:outline-none focus:border-[#bef264] transition-colors font-bold text-2xl tracking-[0.5em]" maxLength={6} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">PIN Baru</label>
                                <input type="password" placeholder="******" className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl px-4 py-4 text-center text-white focus:outline-none focus:border-[#bef264] transition-colors font-bold text-2xl tracking-[0.5em]" maxLength={6} />
                            </div>
                        </div>

                        <button className="w-full bg-[#bef264] text-black font-bold rounded-2xl py-4 mt-8 hover:bg-[#bef264]/90 transition-colors flex items-center justify-center gap-2">
                            Lanjut <ArrowRight className="w-5 h-5" />
                        </button>
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key="pass-form">
                        <div className="w-16 h-16 bg-[#bef264]/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                            <Lock className="w-8 h-8 text-[#bef264]" />
                        </div>
                        <h2 className="text-center font-bold text-xl mb-2">Ubah Password Akun</h2>
                        <p className="text-center text-neutral-500 text-xs mb-8">Password baru harus berbeda dari sebelumnya.</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Password Saat Ini</label>
                                <input type="password" placeholder="••••••••" className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-[#bef264] transition-colors font-medium" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Password Baru</label>
                                <input type="password" placeholder="••••••••" className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-[#bef264] transition-colors font-medium" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Konfirmasi Password</label>
                                <input type="password" placeholder="••••••••" className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-[#bef264] transition-colors font-medium" />
                            </div>
                        </div>

                        <button className="w-full bg-[#bef264] text-black font-bold rounded-2xl py-4 mt-8 hover:bg-[#bef264]/90 transition-colors">
                            Simpan Password
                        </button>
                    </motion.div>
                )}

            </div>
        </div>
    );
}
