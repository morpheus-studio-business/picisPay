'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, Camera, User, Mail, Phone, Save, Store, MapPin, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

export default function EditProfilePage() {
    const { data: session } = useSession();
    const router = useRouter();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [storeName, setStoreName] = useState('');
    const [storeAddress, setStoreAddress] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (session?.user) {
            setName(session.user.name || '');
            setEmail(session.user.email || '');
            setPhone((session.user as any).phone || '');
            setStoreName((session.user as any).storeName || '');
            setStoreAddress((session.user as any).storeAddress || '');
        }
    }, [session]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    storeName,
                    phone,
                    storeAddress
                })
            });

            if (res.ok) {
                alert('Profil berhasil disimpan!');
                router.push('/profile');
                router.refresh();
            } else {
                const data = await res.json();
                alert(data.error || 'Gagal menyimpan profil');
            }
        } catch (error) {
            alert('Terjadi kesalahan');
        } finally {
            setSaving(false);
        }
    };

    if (!session) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#bef264]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white pb-24 font-sans">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-white/5 px-6 pt-8 pb-4 flex items-center gap-4">
                <Link href="/profile" className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-white hover:bg-[#bef264] hover:text-black transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-lg font-bold">Edit Profil</h1>
            </header>

            <div className="px-6 py-8">

                {/* Avatar */}
                <div className="flex justify-center mb-8">
                    <div className="relative">
                        <div className="w-28 h-28 bg-neutral-800 rounded-full flex items-center justify-center overflow-hidden border-4 border-black ring-2 ring-[#bef264]">
                            {session.user.image ? (
                                <img src={session.user.image} alt={name} className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-12 h-12 text-neutral-400" />
                            )}
                        </div>
                        <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#bef264] text-black rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                            <Camera className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Nama Lengkap</label>
                        <div className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 rounded-2xl px-4 py-3">
                            <User className="w-5 h-5 text-neutral-500" />
                            <input
                                type="text"
                                value={name}
                                disabled
                                className="w-full bg-transparent text-neutral-500 focus:outline-none font-medium cursor-not-allowed"
                            />
                        </div>
                        <p className="text-xs text-neutral-600 mt-1">Nama tidak dapat diubah</p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Email</label>
                        <div className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 rounded-2xl px-4 py-3">
                            <Mail className="w-5 h-5 text-neutral-500" />
                            <input
                                type="email"
                                value={email}
                                disabled
                                className="w-full bg-transparent text-neutral-500 focus:outline-none font-medium cursor-not-allowed"
                            />
                        </div>
                        <p className="text-xs text-neutral-600 mt-1">Email tidak dapat diubah</p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Nomor HP</label>
                        <div className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 rounded-2xl px-4 py-3 focus-within:border-[#bef264] transition-colors">
                            <Phone className="w-5 h-5 text-neutral-500" />
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="08xxxxxxxxxx"
                                className="w-full bg-transparent text-white focus:outline-none font-medium"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Nama Toko</label>
                        <div className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 rounded-2xl px-4 py-3 focus-within:border-[#bef264] transition-colors">
                            <Store className="w-5 h-5 text-neutral-500" />
                            <input
                                type="text"
                                value={storeName}
                                onChange={(e) => setStoreName(e.target.value)}
                                placeholder="Nama Konter / Toko Anda"
                                className="w-full bg-transparent text-white focus:outline-none font-medium"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Alamat Toko</label>
                        <div className="flex items-start gap-3 bg-neutral-900 border border-neutral-800 rounded-2xl px-4 py-3 focus-within:border-[#bef264] transition-colors">
                            <MapPin className="w-5 h-5 text-neutral-500 mt-0.5" />
                            <textarea
                                value={storeAddress}
                                onChange={(e) => setStoreAddress(e.target.value)}
                                placeholder="Alamat lengkap konter"
                                rows={2}
                                className="w-full bg-transparent text-white focus:outline-none font-medium resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-[#bef264] text-black font-bold rounded-2xl py-4 mt-10 hover:bg-[#bef264]/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {saving ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            Simpan Perubahan
                        </>
                    )}
                </button>

            </div>
        </div>
    );
}
