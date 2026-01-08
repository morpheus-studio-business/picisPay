'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, User, Shield, Key, Bell, CreditCard, LogOut, ChevronRight, Edit2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from '@/lib/auth-client';

export default function ProfilePage() {
    const router = useRouter();
    const { data: session, isPending } = useSession();

    const handleLogout = async () => {
        await signOut();
        router.push('/');
    };

    if (isPending) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#bef264]" />
            </div>
        );
    }

    if (!session?.user) {
        return (
            <div className="min-h-screen bg-black text-white pb-24 font-sans">
                <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-white/5 px-6 pt-8 pb-4 flex items-center gap-4">
                    <Link href="/" className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-white hover:bg-[#bef264] hover:text-black transition-colors">
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-lg font-bold">Profil</h1>
                </header>

                <div className="px-6 py-20 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center mb-6">
                        <User className="w-10 h-10 text-neutral-600" />
                    </div>
                    <h2 className="text-xl font-bold mb-2">Belum Masuk</h2>
                    <p className="text-neutral-500 text-sm mb-8">Masuk untuk mengakses profil dan fitur lainnya</p>
                    <div className="flex gap-3">
                        <Link href="/login" className="bg-[#bef264] text-black font-bold px-8 py-3 rounded-2xl hover:bg-[#bef264]/90 transition-colors">
                            Masuk
                        </Link>
                        <Link href="/register" className="bg-neutral-900 text-white font-bold px-8 py-3 rounded-2xl border border-neutral-800 hover:bg-neutral-800 transition-colors">
                            Daftar
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white pb-24 font-sans">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-white/5 px-6 pt-8 pb-4 flex items-center gap-4">
                <Link href="/" className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-white hover:bg-[#bef264] hover:text-black transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-lg font-bold">Profil Saya</h1>
            </header>

            {/* Profile Info */}
            <div className="px-6 py-8 flex flex-col items-center">
                <div className="relative mb-4">
                    <div className="w-24 h-24 bg-neutral-800 rounded-full flex items-center justify-center overflow-hidden border-2 border-[#bef264]">
                        {session.user.image ? (
                            <img src={session.user.image} alt={session.user.name} className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-12 h-12 text-neutral-400" />
                        )}
                    </div>
                    <Link href="/profile/edit" className="absolute bottom-0 right-0 w-8 h-8 bg-white text-black rounded-full flex items-center justify-center shadow-lg">
                        <Edit2 className="w-4 h-4" />
                    </Link>
                </div>
                <h2 className="text-xl font-bold">{session.user.name}</h2>
                <p className="text-neutral-500 text-sm">{session.user.email}</p>
                <div className="mt-3 bg-[#bef264]/10 px-3 py-1 rounded-full border border-[#bef264]/20">
                    <span className="text-xs font-bold text-[#bef264] uppercase tracking-wider">
                        {(session.user as any).role === 'admin' ? 'Administrator' : 'Member'}
                    </span>
                </div>
            </div>

            {/* Menu Options */}
            <div className="px-6 space-y-6">

                {/* Admin Menu - ONLY Visible for Admin */}
                {(session.user as any).role === 'admin' && (
                    <Link href="/admin">
                        <div className="w-full bg-neutral-900 border border-[#bef264] rounded-2xl p-4 flex items-center gap-4 hover:bg-[#bef264]/10 transition-colors mb-2">
                            <div className="w-10 h-10 rounded-full bg-[#bef264] flex items-center justify-center text-black">
                                <Shield className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-[#bef264]">Dashboard Admin</h3>
                                <p className="text-xs text-neutral-400">Kelola aplikasi dan pengguna</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-[#bef264]" />
                        </div>
                    </Link>
                )}

                {/* Account Settings */}
                <div>
                    <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3 pl-2">Akun</h3>
                    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden">
                        <Link href="/profile/edit">
                            <div className="p-4 flex items-center gap-4 border-b border-neutral-800 cursor-pointer hover:bg-neutral-800 transition-colors">
                                <User className="w-5 h-5 text-white" />
                                <span className="flex-1 text-sm font-medium">Edit Profil</span>
                                <ChevronRight className="w-4 h-4 text-neutral-600" />
                            </div>
                        </Link>
                        <Link href="/profile/security">
                            <div className="p-4 flex items-center gap-4 border-b border-neutral-800 cursor-pointer hover:bg-neutral-800 transition-colors">
                                <Shield className="w-5 h-5 text-white" />
                                <span className="flex-1 text-sm font-medium">Keamanan Akun</span>
                                <ChevronRight className="w-4 h-4 text-neutral-600" />
                            </div>
                        </Link>
                        <Link href="/profile/pin">
                            <div className="p-4 flex items-center gap-4 cursor-pointer hover:bg-neutral-800 transition-colors">
                                <Key className="w-5 h-5 text-white" />
                                <span className="flex-1 text-sm font-medium">Ubah Password</span>
                                <ChevronRight className="w-4 h-4 text-neutral-600" />
                            </div>
                        </Link>
                    </div>
                </div>

                {/* General Settings */}
                <div>
                    <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3 pl-2">Umum</h3>
                    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden">
                        <div className="p-4 flex items-center gap-4 border-b border-neutral-800 cursor-pointer hover:bg-neutral-800 transition-colors">
                            <Bell className="w-5 h-5 text-white" />
                            <span className="flex-1 text-sm font-medium">Notifikasi</span>
                            <div className="w-10 h-6 bg-[#bef264] rounded-full flex items-center px-1">
                                <div className="w-4 h-4 bg-black rounded-full shadow-md translate-x-4 transition-transform"></div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="w-full bg-red-500/10 border border-red-500/20 text-red-500 font-bold rounded-2xl py-4 flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all"
                >
                    <LogOut className="w-5 h-5" />
                    Keluar Aplikasi
                </button>

                <p className="text-center text-[10px] text-neutral-600 pb-4">picisPay v1.0.0</p>

            </div>
        </div>
    );
}
