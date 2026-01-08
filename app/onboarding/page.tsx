'use client';

import { motion } from 'framer-motion';
import { Store, Phone, MapPin, Loader2, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function OnboardingPage() {
    const router = useRouter();
    const [storeName, setStoreName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    storeName,
                    phone,
                    storeAddress: address
                })
            });

            const json = await res.json();

            if (json.success) {
                // Force session refresh or just redirect
                router.push('/');
                router.refresh();
            } else {
                alert(json.error || 'Gagal menyimpan profil');
                setLoading(false);
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Terjadi kesalahan');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-white/5 px-6 pt-8 pb-4">
                <h1 className="text-lg font-bold text-center">Lengkapi Profil</h1>
            </header>

            <div className="px-6 py-8">
                {/* Welcome */}
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-[#bef264]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-10 h-10 text-[#bef264]" />
                    </div>
                    <h2 className="text-2xl font-bold">Selamat Datang!</h2>
                    <p className="text-neutral-500 text-sm mt-2">
                        Lengkapi profil toko Anda untuk mulai berjualan
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Store Name */}
                    <div>
                        <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">
                            Nama Toko
                        </label>
                        <div className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 rounded-2xl px-4 py-3 focus-within:border-[#bef264] transition-colors">
                            <Store className="w-5 h-5 text-neutral-500" />
                            <input
                                type="text"
                                value={storeName}
                                onChange={(e) => setStoreName(e.target.value)}
                                placeholder="Toko Pulsa Jaya"
                                required
                                className="w-full bg-transparent text-white focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">
                            Nomor WhatsApp
                        </label>
                        <div className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 rounded-2xl px-4 py-3 focus-within:border-[#bef264] transition-colors">
                            <Phone className="w-5 h-5 text-neutral-500" />
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                placeholder="08123456789"
                                required
                                className="w-full bg-transparent text-white focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">
                            Alamat (Opsional)
                        </label>
                        <div className="flex items-start gap-3 bg-neutral-900 border border-neutral-800 rounded-2xl px-4 py-3 focus-within:border-[#bef264] transition-colors">
                            <MapPin className="w-5 h-5 text-neutral-500 mt-0.5" />
                            <textarea
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="Jl. Contoh No. 123, Kota"
                                rows={2}
                                className="w-full bg-transparent text-white focus:outline-none resize-none"
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#bef264] text-black font-bold rounded-2xl py-4 hover:bg-[#bef264]/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-8"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Menyimpan...
                            </>
                        ) : (
                            'Mulai Berjualan'
                        )}
                    </button>
                </form>

                {/* Skip */}
                <button
                    onClick={() => router.push('/')}
                    className="w-full text-neutral-500 text-sm mt-4 py-2 hover:text-white transition-colors"
                >
                    Lewati untuk sekarang
                </button>
            </div>
        </div>
    );
}
