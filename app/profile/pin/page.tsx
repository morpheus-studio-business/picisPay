'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, Key, Lock, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { changePassword } from '@/lib/auth-client';

export default function PinPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('pin'); // 'pin' or 'password'

    // PIN State
    const [oldPin, setOldPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [pinLoading, setPinLoading] = useState(false);

    // Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passLoading, setPassLoading] = useState(false);

    const handleUpdatePin = async () => {
        if (newPin.length !== 6) {
            alert('PIN harus 6 digit angka');
            return;
        }
        setPinLoading(true);
        try {
            const res = await fetch('/api/user/pin', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pin: newPin,
                    oldPin: oldPin
                })
            });
            const data = await res.json();
            if (data.success) {
                alert('PIN berhasil diperbarui!');
                setOldPin('');
                setNewPin('');
                router.push('/profile');
            } else {
                alert(data.error || 'Gagal mengubah PIN');
            }
        } catch (error) {
            alert('Terjadi kesalahan');
        } finally {
            setPinLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            alert('Semua kolom harus diisi');
            return;
        }
        if (newPassword !== confirmPassword) {
            alert('Konfirmasi password tidak cocok');
            return;
        }
        if (newPassword.length < 8) {
            alert('Password minimal 8 karakter');
            return;
        }

        setPassLoading(true);
        try {
            await changePassword({
                newPassword: newPassword,
                currentPassword: currentPassword,
                revokeOtherSessions: true
            }, {
                onSuccess: () => {
                    alert('Password berhasil diubah!');
                    router.push('/profile');
                },
                onError: (ctx) => {
                    alert(ctx.error.message || "Gagal mengubah password");
                }
            });
        } catch (error) {
            // Error managed by onError callback usually
        } finally {
            setPassLoading(false);
        }
    };

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
                        <p className="text-center text-neutral-500 text-xs mb-8">Masukkan 6 digit angka untuk keamanan transaksi.</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">PIN Lama (Opsional jika belum ada)</label>
                                <input
                                    type="password"
                                    value={oldPin}
                                    onChange={(e) => setOldPin(e.target.value)}
                                    placeholder="******"
                                    className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl px-4 py-4 text-center text-white focus:outline-none focus:border-[#bef264] transition-colors font-bold text-2xl tracking-[0.5em]"
                                    maxLength={6}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">PIN Baru</label>
                                <input
                                    type="password"
                                    value={newPin}
                                    onChange={(e) => setNewPin(e.target.value)}
                                    placeholder="******"
                                    className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl px-4 py-4 text-center text-white focus:outline-none focus:border-[#bef264] transition-colors font-bold text-2xl tracking-[0.5em]"
                                    maxLength={6}
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleUpdatePin}
                            disabled={pinLoading}
                            className="w-full bg-[#bef264] text-black font-bold rounded-2xl py-4 mt-8 hover:bg-[#bef264]/90 transition-colors flex items-center justify-center gap-2"
                        >
                            {pinLoading ? <Loader2 className="animate-spin" /> : <>Simpan PIN <ArrowRight className="w-5 h-5" /></>}
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
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-[#bef264] transition-colors font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Password Baru</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-[#bef264] transition-colors font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Konfirmasi Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-[#bef264] transition-colors font-medium"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleChangePassword}
                            disabled={passLoading}
                            className="w-full bg-[#bef264] text-black font-bold rounded-2xl py-4 mt-8 hover:bg-[#bef264]/90 transition-colors flex items-center justify-center gap-2"
                        >
                            {passLoading ? <Loader2 className="animate-spin" /> : 'Simpan Password'}
                        </button>
                    </motion.div>
                )}

            </div>
        </div>
    );
}
