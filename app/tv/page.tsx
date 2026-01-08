'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Loader2, Tv, X, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { filterTVProducts, Product } from '@/lib/product-categories';

interface Brand {
    name: string;
    brand: string;
    productCount: number;
}

const formatBrandName = (brand: string): string => {
    return brand
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

export default function TVPage() {
    const router = useRouter();
    const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [buying, setBuying] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [customerNo, setCustomerNo] = useState('');

    useEffect(() => {
        fetchAllProducts();
    }, []);

    const fetchAllProducts = async () => {
        try {
            const res = await fetch('/api/digiflazz/price-list', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cmd: 'prepaid' }),
            });
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
                const tvProducts = filterTVProducts(data.data);
                setAllProducts(tvProducts);
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    const availableBrands = useMemo(() => {
        const brandMap = new Map<string, number>();
        allProducts.forEach(p => {
            const brand = p.brand.toUpperCase();
            brandMap.set(brand, (brandMap.get(brand) || 0) + 1);
        });
        return Array.from(brandMap.entries())
            .map(([brand, count]) => ({
                name: formatBrandName(brand),
                brand: brand,
                productCount: count,
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [allProducts]);

    const brandProducts = useMemo(() => {
        if (!selectedBrand) return [];
        return allProducts
            .filter(p => p.brand.toUpperCase() === selectedBrand.brand)
            .sort((a, b) => a.price - b.price);
    }, [allProducts, selectedBrand]);

    const handleConfirmBuy = async () => {
        if (!selectedProduct || !customerNo) return;

        setBuying(selectedProduct.buyer_sku_code);

        try {
            const res = await fetch('/api/digiflazz/transaction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    buyer_sku_code: selectedProduct.buyer_sku_code,
                    customer_no: customerNo,
                    price: selectedProduct.selling_price || selectedProduct.price,
                    product_name: selectedProduct.product_name,
                }),
            });

            const data = await res.json();

            if (data.success) {
                alert(`Transaksi berhasil! Status: ${data.data.status}`);
                setSelectedProduct(null);
                router.push('/');
            } else {
                alert(`Gagal: ${data.error || 'Terjadi kesalahan'}`);
            }
        } catch (error) {
            alert('Terjadi kesalahan saat memproses transaksi');
        } finally {
            setBuying(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#bef264]" />
            </div>
        );
    }

    // Step 1: Brand Selection
    if (!selectedBrand) {
        return (
            <div className="min-h-screen bg-black text-white pb-24 font-sans">
                <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-white/5 px-6 pt-8 pb-4 flex items-center gap-4">
                    <Link href="/" className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-white hover:bg-[#bef264] hover:text-black transition-colors">
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-lg font-bold">TV Kabel</h1>
                </header>

                <div className="px-6 py-6">
                    {availableBrands.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-neutral-500 text-sm">Tidak ada produk TV tersedia</p>
                        </div>
                    ) : (
                        <>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4">
                                Pilih Provider ({availableBrands.length} tersedia)
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                {availableBrands.map((brand) => (
                                    <motion.div
                                        key={brand.brand}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setSelectedBrand(brand)}
                                        className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 cursor-pointer hover:border-[#bef264] hover:bg-neutral-800 transition-all group flex flex-col items-center justify-center gap-3"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center">
                                            <Tv className="w-6 h-6 text-white" />
                                        </div>
                                        <span className="font-bold text-white group-hover:text-[#bef264] text-center">{brand.name}</span>
                                        <span className="text-xs text-neutral-500">{brand.productCount} produk</span>
                                    </motion.div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }

    // Step 2: Input at Top + Products
    return (
        <div className="min-h-screen bg-black text-white pb-24 font-sans">
            <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-white/5 px-6 pt-8 pb-4 flex items-center gap-4">
                <button
                    onClick={() => {
                        setSelectedBrand(null);
                        setCustomerNo('');
                    }}
                    className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-white hover:bg-[#bef264] hover:text-black transition-colors"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-lg font-bold">{selectedBrand.name}</h1>
                    <p className="text-xs text-neutral-500">Masukkan nomor pelanggan</p>
                </div>
            </header>

            <div className="px-6 py-6">
                {/* Input at Top */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 mb-6">
                    <label className="text-xs text-neutral-500 block mb-2">No. Pelanggan / Smartcard</label>
                    <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-neutral-500" />
                        <input
                            type="text"
                            value={customerNo}
                            onChange={(e) => setCustomerNo(e.target.value)}
                            placeholder="Masukkan nomor pelanggan..."
                            className="w-full bg-transparent text-lg font-bold text-white placeholder:text-neutral-700 focus:outline-none"
                            autoFocus
                        />
                    </div>
                </div>

                {/* Products */}
                <div className="space-y-3">
                    {brandProducts.map((product) => (
                        <motion.div
                            key={product.buyer_sku_code}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => customerNo && setSelectedProduct(product)}
                            className={`bg-neutral-900 border rounded-2xl p-4 transition-all ${!customerNo
                                ? 'border-neutral-800 opacity-50 cursor-not-allowed'
                                : 'border-neutral-800 hover:border-[#bef264] hover:bg-neutral-800 cursor-pointer'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-bold text-white text-sm mb-1">{product.product_name}</h3>
                                    <p className="text-xs text-neutral-500 line-clamp-2">{product.desc}</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-neutral-800">
                                <span className="text-xs font-medium px-2 py-1 rounded bg-neutral-800 text-neutral-400">
                                    {selectedBrand.name}
                                </span>
                                <span className="text-[#bef264] font-bold">
                                    Rp {(product.selling_price || product.price).toLocaleString('id-ID')}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {!customerNo && brandProducts.length > 0 && (
                    <p className="text-center text-neutral-600 text-xs mt-6">
                        Masukkan nomor pelanggan untuk melanjutkan
                    </p>
                )}
            </div>

            {/* Confirmation Modal */}
            <AnimatePresence>
                {selectedProduct && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 z-50 flex items-end justify-center"
                        onClick={() => !buying && setSelectedProduct(null)}
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="bg-neutral-900 rounded-t-3xl w-full max-w-lg p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-bold">Konfirmasi Pembelian</h2>
                                <button onClick={() => !buying && setSelectedProduct(null)} className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="bg-neutral-800 rounded-2xl p-4">
                                    <p className="text-xs text-neutral-500 mb-1">Produk</p>
                                    <p className="font-semibold">{selectedProduct.product_name}</p>
                                </div>
                                <div className="bg-neutral-800 rounded-2xl p-4">
                                    <p className="text-xs text-neutral-500 mb-1">No. Pelanggan</p>
                                    <p className="font-semibold">{customerNo}</p>
                                </div>
                                <div className="bg-neutral-800 rounded-2xl p-4">
                                    <p className="text-xs text-neutral-500 mb-1">Total Harga</p>
                                    <p className="text-2xl font-bold text-[#bef264]">Rp {(selectedProduct.selling_price || selectedProduct.price).toLocaleString('id-ID')}</p>
                                </div>
                            </div>

                            <button
                                onClick={handleConfirmBuy}
                                disabled={buying !== null}
                                className="w-full bg-[#bef264] text-black font-bold rounded-2xl py-4 hover:bg-[#bef264]/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {buying ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Konfirmasi & Bayar'}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
