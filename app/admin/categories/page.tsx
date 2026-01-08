'use client';

import { useState, useEffect } from 'react';
import { Loader2, Save, Trash2, Eye, EyeOff, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

interface CategoryMapping {
    id?: string;
    originalType: string;
    brand: string;
    customName: string;
    isHidden: boolean;
    priority: number;
}

interface DigiflazzType {
    type: string;
    brand: string;
    count: number;
}

export default function AdminCategoriesPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [mappings, setMappings] = useState<CategoryMapping[]>([]);
    const [digiflazzTypes, setDigiflazzTypes] = useState<DigiflazzType[]>([]);
    const [selectedBrand, setSelectedBrand] = useState('all');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch saved mappings
            const mappingsRes = await fetch('/api/admin/categories');
            const mappingsData = await mappingsRes.json();
            if (mappingsData.success) {
                setMappings(mappingsData.data);
            }

            // Fetch Digiflazz types from products
            const productsRes = await fetch('/api/digiflazz/price-list', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cmd: 'prepaid' }),
            });
            const productsData = await productsRes.json();
            if (productsData.success && Array.isArray(productsData.data)) {
                // Extract unique types per brand
                const typeMap = new Map<string, DigiflazzType>();
                productsData.data
                    .filter((p: any) => p.category === 'Data' && p.type && p.buyer_product_status && p.seller_product_status)
                    .forEach((p: any) => {
                        const key = `${p.brand}-${p.type}`;
                        if (typeMap.has(key)) {
                            typeMap.get(key)!.count++;
                        } else {
                            typeMap.set(key, { type: p.type, brand: p.brand, count: 1 });
                        }
                    });
                setDigiflazzTypes(Array.from(typeMap.values()));
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const brands = [...new Set(digiflazzTypes.map(t => t.brand))].sort();

    const filteredTypes = selectedBrand === 'all'
        ? digiflazzTypes
        : digiflazzTypes.filter(t => t.brand === selectedBrand);

    const getMapping = (type: string, brand: string): CategoryMapping | undefined => {
        return mappings.find(m => m.originalType === type && m.brand === brand);
    };

    const handleSave = async (type: string, brand: string, customName: string, isHidden: boolean, priority: number) => {
        const key = `${brand}-${type}`;
        setSaving(key);
        try {
            await fetch('/api/admin/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ originalType: type, brand, customName, isHidden, priority }),
            });
            await fetchData();
        } catch (error) {
            console.error('Failed to save:', error);
        } finally {
            setSaving(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Reset kategori ini ke default?')) return;
        try {
            await fetch('/api/admin/categories', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
            await fetchData();
        } catch (error) {
            console.error('Failed to delete:', error);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white pb-24 font-sans">
            <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-white/5 px-6 pt-8 pb-4 flex items-center gap-4">
                <Link href="/admin" className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-white hover:bg-[#bef264] hover:text-black transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-lg font-bold">Kategori</h1>
                    <p className="text-xs text-neutral-500">Kustomisasi nama kategori produk</p>
                </div>
            </header>

            <div className="px-6 py-6">
                {/* Brand Filter */}
                <div className="mb-6">
                    <label className="text-xs text-neutral-500 block mb-2">Filter Provider</label>
                    <select
                        value={selectedBrand}
                        onChange={(e) => setSelectedBrand(e.target.value)}
                        className="bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-white w-full"
                    >
                        <option value="all">Semua Provider</option>
                        {brands.map(brand => (
                            <option key={brand} value={brand}>{brand}</option>
                        ))}
                    </select>
                </div>

                {/* Info */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 mb-6">
                    <p className="text-sm text-neutral-400">
                        Ubah nama kategori yang ditampilkan di frontend. Kategori asli dari Digiflazz tetap tersimpan.
                    </p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-[#bef264]" />
                    </div>
                ) : filteredTypes.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-neutral-500">Tidak ada kategori ditemukan</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredTypes.sort((a, b) => a.type.localeCompare(b.type)).map((item) => {
                            const mapping = getMapping(item.type, item.brand);
                            const key = `${item.brand}-${item.type}`;
                            const isSaving = saving === key;

                            return (
                                <CategoryRow
                                    key={key}
                                    item={item}
                                    mapping={mapping}
                                    isSaving={isSaving}
                                    onSave={handleSave}
                                    onDelete={handleDelete}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

function CategoryRow({
    item,
    mapping,
    isSaving,
    onSave,
    onDelete,
}: {
    item: DigiflazzType;
    mapping?: CategoryMapping;
    isSaving: boolean;
    onSave: (type: string, brand: string, customName: string, isHidden: boolean, priority: number) => void;
    onDelete: (id: string) => void;
}) {
    const [customName, setCustomName] = useState(mapping?.customName || item.type);
    const [isHidden, setIsHidden] = useState(mapping?.isHidden || false);
    const [priority, setPriority] = useState(mapping?.priority || 0);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        setCustomName(mapping?.customName || item.type);
        setIsHidden(mapping?.isHidden || false);
        setPriority(mapping?.priority || 0);
        setIsDirty(false);
    }, [mapping, item.type]);

    const handleChange = (field: string, value: any) => {
        if (field === 'customName') setCustomName(value);
        if (field === 'isHidden') setIsHidden(value);
        if (field === 'priority') setPriority(value);
        setIsDirty(true);
    };

    return (
        <div className={`bg-neutral-900 border rounded-xl p-4 ${isHidden ? 'border-red-900/50 opacity-60' : 'border-neutral-800'}`}>
            {/* Header Row - Brand & Original Type */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <span className="text-xs bg-neutral-800 px-2 py-1 rounded text-neutral-400 mr-2">{item.brand}</span>
                    <span className="text-xs text-neutral-500">{item.count} produk</span>
                </div>
                {/* Actions */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleChange('isHidden', !isHidden)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${isHidden ? 'bg-red-900/50 text-red-400' : 'bg-neutral-800 text-neutral-400 hover:text-white'}`}
                        title={isHidden ? 'Tampilkan' : 'Sembunyikan'}
                    >
                        {isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>

                    {isDirty && (
                        <button
                            onClick={() => onSave(item.type, item.brand, customName, isHidden, priority)}
                            disabled={isSaving}
                            className="w-8 h-8 rounded-lg bg-[#bef264] text-black flex items-center justify-center hover:bg-[#a8d94e]"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        </button>
                    )}

                    {mapping && (
                        <button
                            onClick={() => onDelete(mapping.id!)}
                            className="w-8 h-8 rounded-lg bg-neutral-800 text-neutral-400 hover:text-red-400 flex items-center justify-center"
                            title="Reset ke default"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Original Type */}
            <p className="font-bold text-white text-lg mb-4">{item.type}</p>

            {/* Input Row */}
            <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                    <label className="text-xs text-neutral-500 block mb-1">Nama Tampil</label>
                    <input
                        type="text"
                        value={customName}
                        onChange={(e) => handleChange('customName', e.target.value)}
                        className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white w-full text-sm"
                    />
                </div>
                <div>
                    <label className="text-xs text-neutral-500 block mb-1">Urutan</label>
                    <input
                        type="number"
                        value={priority}
                        onChange={(e) => handleChange('priority', parseInt(e.target.value) || 0)}
                        className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white w-full text-sm text-center"
                    />
                </div>
            </div>
        </div>
    );
}
