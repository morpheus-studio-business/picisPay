'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Plus, Image as ImageIcon, ExternalLink, Loader2 } from 'lucide-react';

interface Banner {
    id: string;
    imageUrl: string;
    title: string | null;
    linkUrl: string | null;
    isActive: boolean;
    priority: number;
}

export default function BannersPage() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        imageUrl: '',
        title: '',
        linkUrl: '',
        priority: 0
    });

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            const res = await fetch('/api/admin/banners');
            const data = await res.json();
            if (data.success) {
                setBanners(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch banners:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/banners', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!res.ok) throw new Error('Failed');

            setIsAdding(false);
            setFormData({ imageUrl: '', title: '', linkUrl: '', priority: 0 });
            fetchBanners();
        } catch (error) {
            alert('Gagal menambah banner');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Yakin hapus banner ini?')) return;
        try {
            const res = await fetch(`/api/admin/banners?id=${id}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed');
            fetchBanners();
        } catch (error) {
            alert('Gagal menghapus banner');
        }
    };

    if (loading) return <div className="p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Slide Banner</h1>
                    <p className="text-neutral-500">Kelola gambar slide di halaman utama</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 bg-[#bef264] text-black px-4 py-2 rounded-xl font-bold hover:bg-[#a3e635] transition-colors"
                >
                    {isAdding ? 'Batal' : <><Plus className="w-4 h-4" /> Tambah Banner</>}
                </button>
            </div>

            {/* Add Form */}
            {isAdding && (
                <motion.form
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleAdd}
                    className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4"
                >
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-neutral-500 mb-1 block">Image URL (Cloudinary/External)</label>
                            <input
                                required
                                type="url"
                                placeholder="https://res.cloudinary.com/..."
                                className="w-full bg-black/50 border border-neutral-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#bef264]"
                                value={formData.imageUrl}
                                onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-xs text-neutral-500 mb-1 block">Judul (Opsional)</label>
                            <input
                                type="text"
                                placeholder="Promo Lebaran"
                                className="w-full bg-black/50 border border-neutral-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#bef264]"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-xs text-neutral-500 mb-1 block">Link Action (Opsional)</label>
                            <input
                                type="text"
                                placeholder="/games/mobile-legends"
                                className="w-full bg-black/50 border border-neutral-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#bef264]"
                                value={formData.linkUrl}
                                onChange={e => setFormData({ ...formData, linkUrl: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-xs text-neutral-500 mb-1 block">Urutan (Priority)</label>
                            <input
                                type="number"
                                className="w-full bg-black/50 border border-neutral-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#bef264]"
                                value={formData.priority}
                                onChange={e => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            className="bg-white text-black px-6 py-2 rounded-xl font-bold hover:bg-neutral-200"
                        >
                            Simpan Banner
                        </button>
                    </div>
                </motion.form>
            )}

            {/* Banner List */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {banners.map((banner) => (
                    <motion.div
                        key={banner.id}
                        layout
                        className="group bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden relative"
                    >
                        {/* Image Preview */}
                        <div className="aspect-video bg-neutral-950 relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={banner.imageUrl}
                                alt={banner.title || 'Banner'}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button
                                    onClick={() => handleDelete(banner.id)}
                                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Info */}
                        <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-white truncate">{banner.title || 'Tanpa Judul'}</h3>
                                <span className="text-xs bg-neutral-800 text-neutral-400 px-2 py-1 rounded">
                                    Urutan: {banner.priority}
                                </span>
                            </div>
                            {banner.linkUrl && (
                                <div className="flex items-center gap-1 text-xs text-[#bef264]">
                                    <ExternalLink className="w-3 h-3" />
                                    <span className="truncate">{banner.linkUrl}</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}

                {banners.length === 0 && !loading && (
                    <div className="col-span-full py-12 text-center text-neutral-500">
                        <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>Belum ada banner aktif.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
