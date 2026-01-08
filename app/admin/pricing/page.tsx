'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Save, Loader2, Percent, DollarSign, Check } from 'lucide-react';
import Link from 'next/link';

interface Category {
    name: string;
    marginPercent: number;
    marginFlat: number;
    usePercent: boolean;
}

const defaultCategories: Category[] = [
    { name: 'Pulsa', marginPercent: 2, marginFlat: 500, usePercent: true },
    { name: 'Data', marginPercent: 2, marginFlat: 500, usePercent: true },
    { name: 'PLN', marginPercent: 1.5, marginFlat: 1000, usePercent: false },
    { name: 'E-Wallet', marginPercent: 1, marginFlat: 500, usePercent: false },
    { name: 'Games', marginPercent: 3, marginFlat: 1000, usePercent: true },
    { name: 'Voucher', marginPercent: 2, marginFlat: 500, usePercent: true },
    { name: 'PDAM', marginPercent: 1, marginFlat: 2500, usePercent: false },
    { name: 'BPJS', marginPercent: 1, marginFlat: 2500, usePercent: false },
    { name: 'Internet', marginPercent: 1, marginFlat: 2500, usePercent: false },
];

export default function PricingPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        // Load from localStorage or use defaults
        const savedData = localStorage.getItem('sellerPricing');
        if (savedData) {
            setCategories(JSON.parse(savedData));
        } else {
            setCategories(defaultCategories);
        }
        setLoading(false);
    }, []);

    const handleMarginChange = (index: number, field: 'marginPercent' | 'marginFlat', value: number) => {
        const updated = [...categories];
        updated[index][field] = value;
        setCategories(updated);
        setSaved(false);
    };

    const toggleMarginType = (index: number) => {
        const updated = [...categories];
        updated[index].usePercent = !updated[index].usePercent;
        setCategories(updated);
        setSaved(false);
    };

    const handleSave = async () => {
        setSaving(true);
        // Simulate save delay
        await new Promise(resolve => setTimeout(resolve, 500));
        localStorage.setItem('sellerPricing', JSON.stringify(categories));
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black">
                <Loader2 className="w-8 h-8 animate-spin text-[#bef264]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white pb-24">
            <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-white/5 px-6 pt-8 pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-white hover:bg-[#bef264] hover:text-black transition-colors">
                            <ChevronLeft className="w-6 h-6" />
                        </Link>
                        <h1 className="text-lg font-bold">Atur Harga Jual</h1>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 bg-[#bef264] text-black font-bold px-4 py-2 rounded-xl hover:bg-[#bef264]/90 transition-colors disabled:opacity-50"
                    >
                        {saving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : saved ? (
                            <Check className="w-4 h-4" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        {saved ? 'Tersimpan!' : 'Simpan'}
                    </button>
                </div>
            </header>

            <div className="px-6 py-6">
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6">
                    <p className="text-sm text-yellow-500">
                        💡 Atur margin keuntungan untuk setiap kategori produk. Margin akan ditambahkan ke harga modal dari Digiflazz.
                    </p>
                </div>

                <div className="space-y-4">
                    {categories.map((category, index) => (
                        <motion.div
                            key={category.name}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold">{category.name}</h3>
                                <button
                                    onClick={() => toggleMarginType(index)}
                                    className={`flex items-center gap-1 text-xs px-3 py-1 rounded-full transition-colors ${category.usePercent
                                            ? 'bg-[#bef264]/20 text-[#bef264]'
                                            : 'bg-neutral-800 text-neutral-400'
                                        }`}
                                >
                                    {category.usePercent ? (
                                        <>
                                            <Percent className="w-3 h-3" />
                                            Persen
                                        </>
                                    ) : (
                                        <>
                                            <DollarSign className="w-3 h-3" />
                                            Flat
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-neutral-500 block mb-1">Margin (%)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={category.marginPercent}
                                            onChange={(e) => handleMarginChange(index, 'marginPercent', parseFloat(e.target.value) || 0)}
                                            className={`w-full bg-neutral-800 border rounded-xl px-3 py-2 text-sm focus:outline-none transition-colors ${category.usePercent
                                                    ? 'border-[#bef264]/30 focus:border-[#bef264]'
                                                    : 'border-neutral-700 focus:border-neutral-600'
                                                }`}
                                        />
                                        <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-neutral-500 block mb-1">Margin (Rp)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="100"
                                            value={category.marginFlat}
                                            onChange={(e) => handleMarginChange(index, 'marginFlat', parseInt(e.target.value) || 0)}
                                            className={`w-full bg-neutral-800 border rounded-xl px-3 py-2 text-sm focus:outline-none transition-colors ${!category.usePercent
                                                    ? 'border-[#bef264]/30 focus:border-[#bef264]'
                                                    : 'border-neutral-700 focus:border-neutral-600'
                                                }`}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500">Rp</span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-xs text-neutral-500 mt-2">
                                Aktif: {category.usePercent
                                    ? `+${category.marginPercent}% dari harga modal`
                                    : `+Rp ${category.marginFlat.toLocaleString('id-ID')} per transaksi`
                                }
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
