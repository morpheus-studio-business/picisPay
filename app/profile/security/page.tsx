'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Shield, LogOut, Loader2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

export default function SecurityPage() {
    const router = useRouter();
    const [revoking, setRevoking] = useState(false);

    const handleRevokeAllSessions = async () => {
        if (!confirm('Yakin ingin logout dari semua perangkat lain? Anda harus login ulang di perangkat tersebut.')) {
            return;
        }

        setRevoking(true);
        try {
            await authClient.revokeOtherSessions();
            alert('✅ Berhasil! Semua sesi perangkat lain telah di-logout.');
        } catch (error) {
            console.error(error);
            alert('Gagal merevoke sesi. Silakan coba lagi.');
        } finally {
            setRevoking(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white pb-24 font-sans">
            <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-white/5 px-6 pt-8 pb-4 flex items-center gap-4">
                <Link href="/profile" className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-white hover:bg-[#bef264] hover:text-black transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-lg font-bold">Keamanan Akun</h1>
            </header>

            <div className="px-6 py-8 space-y-8">

                {/* Session Management - ACTIVE */}
                <div>
                    <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3 pl-2">Sesi Aktif</h3>
                    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden">
                        <div className="p-5 flex items-start gap-4">
                            <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center shrink-0">
                                <AlertTriangle className="w-6 h-6 text-red-400" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-bold mb-1">Logout Semua Perangkat</h4>
                                <p className="text-xs text-neutral-500 mb-4">
                                    Hapus semua sesi login aktif di perangkat lain. Gunakan jika Anda mencurigai akun Anda diakses orang lain.
                                </p>
                                <button
                                    onClick={handleRevokeAllSessions}
                                    disabled={revoking}
                                    className="w-full bg-red-500/10 border border-red-500/30 text-red-400 font-bold rounded-xl py-3 flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                                >
                                    {revoking ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <LogOut className="w-4 h-4" />
                                            Logout Perangkat Lain
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security Info */}
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-[#bef264] shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-bold text-white mb-1">Tips Keamanan</h4>
                            <ul className="text-xs text-neutral-500 space-y-1">
                                <li>• Jangan bagikan password ke siapapun</li>
                                <li>• Gunakan PIN unik untuk transaksi</li>
                                <li>• Logout jika menggunakan perangkat umum</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Verification - DISABLED (Future Feature)
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
                */}

            </div>
        </div>
    );
}
