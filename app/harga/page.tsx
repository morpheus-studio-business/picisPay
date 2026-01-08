'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, Save, Loader2, Tag, Search } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

export default function HargaPage() {
    const { data: session } = useSession();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState<any[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    const [globalMargin, setGlobalMargin] = useState<number>(0);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (session?.user) {
            setGlobalMargin((session.user as any).defaultMargin || 0);
            fetchProducts();
        }
    }, [session]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/digiflazz/price-list', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cmd: 'prepaid' }),
            });
            const data = await res.json();
            if (data.success) {
                // Sort by brand and price
                const sorted = data.data.sort((a: any, b: any) => {
                    if (a.brand < b.brand) return -1;
                    if (a.brand > b.brand) return 1;
                    return a.price - b.price;
                });
                setProducts(sorted);
                setFilteredProducts(sorted);
            }
        } catch (error) {
            console.error('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let result = products;

        if (categoryFilter !== 'all') {
            result = result.filter(p => p.category.toLowerCase().includes(categoryFilter));
        }

        if (search) {
            const lowerSearch = search.toLowerCase();
            result = result.filter(p =>
                p.product_name.toLowerCase().includes(lowerSearch) ||
                p.buyer_sku_code.toLowerCase().includes(lowerSearch) ||
                p.brand.toLowerCase().includes(lowerSearch)
            );
        }

        setFilteredProducts(result);
    }, [search, categoryFilter, products]);

    const saveMargin = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ defaultMargin: globalMargin })
            });

            if (res.ok) {
                alert('Margin berhasil disimpan!');
                window.location.reload(); // Reload to refresh session
            }
        } catch (error) {
            alert('Gagal menyimpan margin');
        } finally {
            setSaving(false);
        }
    };

    const categories = ['all', 'pulsa', 'data', 'pln', 'games', 'voucher'];

    if (!session) return null;

    return (
        <div className="min-h-screen bg-black text-white pb-24 font-sans">
            <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-white/5 px-6 pt-8 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/" className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-white hover:bg-[#bef264] hover:text-black transition-colors">
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-lg font-bold">Daftar Harga</h1>
                </div>
            </header>

            <div className="px-6 py-6">
                {/* Global Margin Setting */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <Tag className="w-5 h-5 text-[#bef264]" />
                        <h2 className="font-bold text-lg">Setting Margin/Keuntungan</h2>
                    </div>
                    <p className="text-neutral-500 text-sm mb-4">
                        Margin ini akan ditambahkan ke Harga Max (modal Anda) untuk menentukan harga jual ke pelanggan.
                    </p>

                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-bold">Rp</span>
                            <input
                                type="number"
                                value={globalMargin}
                                onChange={(e) => setGlobalMargin(Number(e.target.value))}
                                className="w-full bg-black border border-neutral-700 rounded-xl py-3 pl-10 pr-4 font-bold text-white focus:outline-none focus:border-[#bef264]"
                            />
                        </div>
                        <button
                            onClick={saveMargin}
                            disabled={saving}
                            className="bg-[#bef264] text-black font-bold px-6 rounded-xl hover:bg-[#bef264]/90 disabled:opacity-50 flex items-center gap-2"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Simpan
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="space-y-4 mb-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                        <input
                            type="text"
                            placeholder="Cari produk..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-[#bef264]"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategoryFilter(cat)}
                                className={`px-4 py-2 rounded-full text-xs font-bold capitalize whitespace-nowrap transition-colors
                                    ${categoryFilter === cat ? 'bg-white text-black' : 'bg-neutral-900 text-neutral-400'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product List */}
                {loading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="w-8 h-8 animate-spin text-[#bef264]" />
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredProducts.slice(0, 100).map((product, idx) => (
                            <div key={idx} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex justify-between items-center group">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] bg-neutral-800 px-2 py-0.5 rounded text-neutral-400 font-mono">
                                            {product.brand}
                                        </span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold
                                            ${product.buyer_product_status ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                            {product.buyer_product_status ? 'GANGGUAN' : 'NORMAL'}
                                            {/* Note: Logic status digiflazz kebalik? usually buyer_product_status=true means avaliable. Wait.
                                                Digiflazz: buyer_product_status = true (Available), false (Gangguan).
                                                So check logic above.
                                             */}
                                            {product.buyer_product_status && product.seller_product_status ? 'TERSEDIA' : 'GANGGUAN'}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-sm text-white mb-1">{product.product_name}</h3>
                                    <p className="text-xs text-neutral-500">{product.buyer_sku_code}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-neutral-500 mb-0.5">Modal: Rp {(product.selling_price || product.price).toLocaleString('id-ID')}</p>
                                    <p className="font-bold text-[#bef264] text-lg">
                                        Rp {((product.selling_price || product.price) + globalMargin).toLocaleString('id-ID')}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {filteredProducts.length === 0 && (
                            <p className="text-center text-neutral-500 py-10">Produk tidak ditemukan</p>
                        )}
                        {filteredProducts.length > 100 && (
                            <p className="text-center text-neutral-600 text-xs mt-4">Menampilkan 100 produk teratas</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
