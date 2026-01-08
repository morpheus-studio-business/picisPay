'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, Shield, Smartphone, Fingerprint, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function SecurityPage() {
    return (
        <div className="min-h-screen bg-black text-white pb-24 font-sans">
            <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-white/5 px-6 pt-8 pb-4 flex items-center gap-4">
                <Link href="/profile" className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-white hover:bg-[#bef264] hover:text-black transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-lg font-bold">Keamanan Akun</h1>
            </header>

            <div className="px-6 py-8 space-y-8">

                {/* Verification */}
                <div>
                    <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3 pl-2">Verifikasi</h3>
                    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden">
                        <div className="p-4 flex items-center gap-4 border-b border-neutral-800">
                            <div className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center">
                                <Smartphone className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-bold">Verifikasi 2 Langkah</h4>
                                <p className="text-[10px] text-neutral-500">Kirim kode OTP saat login.</p>
                            </div>
                            <div className="w-12 h-7 bg-[#bef264] rounded-full p-1 flex justify-end cursor-pointer">
                                <div className="w-5 h-5 bg-black rounded-full shadow-sm"></div>
                            </div>
                        </div>

                        <div className="p-4 flex items-center gap-4">
                            <div className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center">
                                <Fingerprint className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-bold">Biometrik</h4>
                                <p className="text-[10px] text-neutral-500">Login dengan FaceID / Sidik Jari.</p>
                            </div>
                            <div className="w-12 h-7 bg-neutral-800 rounded-full p-1 flex justify-start cursor-pointer">
                                <div className="w-5 h-5 bg-neutral-600 rounded-full shadow-sm"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Login Activity */}
                <div>
                    <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3 pl-2">Login Aktif</h3>
                    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden">
                        <div className="p-4 flex items-center gap-4 border-b border-neutral-800">
                            <div className="w-10 h-10 bg-[#bef264]/10 rounded-full flex items-center justify-center">
                                <Shield className="w-5 h-5 text-[#bef264]" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-bold">iPhone 14 Pro</h4>
                                <p className="text-[10px] text-neutral-500">Jakarta, ID • Sedang Aktif</p>
                            </div>
                        </div>
                        <div className="p-4 flex items-center gap-4">
                            <div className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center">
                                <Shield className="w-5 h-5 text-neutral-500" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-bold">Chrome on Windows</h4>
                                <p className="text-[10px] text-neutral-500">Surabaya, ID • 2 Jam yang lalu</p>
                            </div>
                            <button className="p-2 bg-red-500/10 rounded-full text-red-500">
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
