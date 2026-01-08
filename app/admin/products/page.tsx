'use client';

import { useState, useEffect, useMemo } from 'react';
import { Loader2, ChevronLeft, Pencil, X, RefreshCw } from 'lucide-react';
import { getProductCategory, Product } from '@/lib/product-categories';

// Admin uses Product with optional 'type' field
interface AdminProduct extends Product {
    type: string;
}

export default function AdminProductsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [savedPrices, setSavedPrices] = useState<Record<string, number>>({});

    // Navigation state
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
    const [selectedType, setSelectedType] = useState<string | null>(null);

    // Modal
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [editPrice, setEditPrice] = useState('');

    useEffect(() => {
        fetchProducts();
        fetchSavedPrices();
    }, []);

    const fetchProducts = async (force: boolean = false) => {
        setLoading(true);
        try {
            const res = await fetch('/api/digiflazz/price-list', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cmd: 'prepaid', force }),
            });
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
                setProducts(data.data);
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchSavedPrices = async () => {
        try {
            const res = await fetch('/api/admin/prices');
            const data = await res.json();
            if (data.success) {
                const map: Record<string, number> = {};
                data.data.forEach((p: any) => { map[p.skuCode] = p.sellingPrice; });
                setSavedPrices(map);
            }
        } catch { }
    };

    // Categories with count (using custom grouping)
    const categories = useMemo(() => {
        const catMap = new Map<string, number>();
        products.forEach(p => {
            const cat = getProductCategory(p);
            catMap.set(cat, (catMap.get(cat) || 0) + 1);
        });
        return Array.from(catMap.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [products]);

    // Brands for selected category
    const brands = useMemo(() => {
        if (!selectedCategory) return [];
        const brandMap = new Map<string, number>();
        products
            .filter(p => getProductCategory(p) === selectedCategory)
            .forEach(p => {
                brandMap.set(p.brand, (brandMap.get(p.brand) || 0) + 1);
            });
        return Array.from(brandMap.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [products, selectedCategory]);

    // Types for selected brand
    const types = useMemo(() => {
        if (!selectedCategory || !selectedBrand) return [];
        const typeMap = new Map<string, number>();
        products
            .filter(p => getProductCategory(p) === selectedCategory && p.brand === selectedBrand)
            .forEach(p => {
                if (p.type) typeMap.set(p.type, (typeMap.get(p.type) || 0) + 1);
            });
        return Array.from(typeMap.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [products, selectedCategory, selectedBrand]);

    // Products for selected type
    const filteredProducts = useMemo(() => {
        if (!selectedCategory || !selectedBrand || !selectedType) return [];
        return products
            .filter(p => getProductCategory(p) === selectedCategory && p.brand === selectedBrand && p.type === selectedType)
            .sort((a, b) => a.price - b.price);
    }, [products, selectedCategory, selectedBrand, selectedType]);

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        const saved = savedPrices[product.buyer_sku_code];
        setEditPrice(saved ? saved.toString() : '');
    };

    const handleSave = async () => {
        if (!editingProduct || !editPrice) return;
        setSaving(true);
        const priceNum = Number(editPrice);
        try {
            await fetch('/api/admin/prices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    skuCode: editingProduct.buyer_sku_code,
                    productName: editingProduct.product_name,
                    brand: editingProduct.brand,
                    category: editingProduct.category,
                    basePrice: editingProduct.price,
                    sellingPrice: priceNum,
                    isActive: true
                })
            });
            setSavedPrices(prev => ({ ...prev, [editingProduct.buyer_sku_code]: priceNum }));
            setEditingProduct(null);
        } finally {
            setSaving(false);
        }
    };

    const goBack = () => {
        if (selectedType) {
            setSelectedType(null);
        } else if (selectedBrand) {
            setSelectedBrand(null);
        } else if (selectedCategory) {
            setSelectedCategory(null);
        }
    };

    // Step 1: Category Selection
    if (!selectedCategory) {
        return (
            <div className="text-white pb-24">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-xl font-bold">Produk</h1>
                        <p className="text-sm text-neutral-500">Pilih kategori produk</p>
                    </div>
                    <button
                        onClick={() => fetchProducts(true)}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-[#bef264] hover:bg-[#a8d94e] text-black rounded-lg text-sm font-bold transition-colors"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        Sync
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-[#bef264]" />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {categories.map(cat => (
                            <div
                                key={cat.name}
                                onClick={() => setSelectedCategory(cat.name)}
                                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 cursor-pointer hover:border-[#bef264] hover:bg-neutral-800 transition-all"
                            >
                                <h3 className="font-bold text-white mb-1">{cat.name}</h3>
                                <p className="text-xs text-neutral-500">{cat.count} produk</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // Step 2: Brand Selection
    if (!selectedBrand) {
        return (
            <div className="text-white pb-24">
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={goBack}
                        className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-neutral-700"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold">{selectedCategory}</h1>
                        <p className="text-sm text-neutral-500">Pilih provider/brand</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {brands.map(brand => (
                        <div
                            key={brand.name}
                            onClick={() => setSelectedBrand(brand.name)}
                            className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 cursor-pointer hover:border-[#bef264] hover:bg-neutral-800 transition-all"
                        >
                            <h3 className="font-bold text-white mb-1">{brand.name}</h3>
                            <p className="text-xs text-neutral-500">{brand.count} produk</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Step 3: Type Selection
    if (!selectedType) {
        return (
            <div className="text-white pb-24">
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={goBack}
                        className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-neutral-700"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold">{selectedBrand}</h1>
                        <p className="text-sm text-neutral-500">{selectedCategory} • Pilih tipe paket</p>
                    </div>
                </div>

                {types.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-neutral-500">Tidak ada tipe paket</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3">
                        {types.map(type => (
                            <div
                                key={type.name}
                                onClick={() => setSelectedType(type.name)}
                                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 cursor-pointer hover:border-[#bef264] hover:bg-neutral-800 transition-all flex items-center justify-between"
                            >
                                <div>
                                    <h3 className="font-bold text-white">{type.name}</h3>
                                    <p className="text-xs text-neutral-500">{type.count} produk</p>
                                </div>
                                <ChevronLeft className="w-5 h-5 text-neutral-500 rotate-180" />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // Step 4: Product List
    return (
        <div className="text-white pb-24">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={goBack}
                    className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-neutral-700"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-xl font-bold">{selectedType}</h1>
                    <p className="text-sm text-neutral-500">{selectedBrand} • {selectedCategory}</p>
                </div>
            </div>

            {filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-neutral-500">Tidak ada produk</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredProducts.map(product => {
                        const saved = savedPrices[product.buyer_sku_code];
                        return (
                            <div
                                key={product.buyer_sku_code}
                                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4"
                            >
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <h3 className="font-bold text-white text-sm flex-1">{product.product_name}</h3>
                                    <button
                                        onClick={() => handleEdit(product)}
                                        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${saved
                                            ? 'bg-[#bef264] text-black'
                                            : 'bg-neutral-800 text-white hover:bg-neutral-700'
                                            }`}
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div>
                                        <p className="text-xs text-neutral-500">Modal</p>
                                        <p className="text-sm font-mono text-neutral-300">Rp {product.price.toLocaleString('id-ID')}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-neutral-500">Harga Jual</p>
                                        {saved ? (
                                            <p className="text-sm font-mono text-[#bef264] font-bold">Rp {saved.toLocaleString('id-ID')}</p>
                                        ) : (
                                            <p className="text-sm text-neutral-600">Belum diset</p>
                                        )}
                                    </div>
                                    {saved && (
                                        <div>
                                            <p className="text-xs text-neutral-500">Margin</p>
                                            <p className="text-sm font-mono text-green-400">+Rp {(saved - product.price).toLocaleString('id-ID')}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Edit Modal */}
            {editingProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={() => setEditingProduct(null)}>
                    <div
                        className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 w-full max-w-sm"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-white">Edit Harga</h2>
                            <button onClick={() => setEditingProduct(null)} className="text-neutral-500 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-sm text-white mb-1 font-medium">{editingProduct.product_name}</p>
                        <p className="text-xs text-neutral-500 mb-4">{editingProduct.brand} • {editingProduct.category}</p>

                        <div className="bg-neutral-800 rounded-xl p-3 mb-4">
                            <p className="text-xs text-neutral-500 mb-1">Harga Modal</p>
                            <p className="text-lg font-mono font-bold text-white">Rp {editingProduct.price.toLocaleString('id-ID')}</p>
                        </div>

                        <div className="mb-6">
                            <label className="text-xs text-neutral-500 block mb-2">Harga Jual</label>
                            <input
                                type="number"
                                value={editPrice}
                                onChange={e => setEditPrice(e.target.value)}
                                placeholder="Masukkan harga jual"
                                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-white font-mono text-lg focus:outline-none focus:border-[#bef264]"
                                autoFocus
                            />
                            {editPrice && Number(editPrice) > editingProduct.price && (
                                <p className="text-xs text-green-400 mt-2">
                                    Margin: +Rp {(Number(editPrice) - editingProduct.price).toLocaleString('id-ID')}
                                </p>
                            )}
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={saving || !editPrice}
                            className="w-full py-3 bg-[#bef264] text-black font-bold rounded-xl hover:bg-[#a8d94e] disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            Simpan
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
