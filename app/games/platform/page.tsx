'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Loader2, CreditCard, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { filterVoucherPlatform, Product } from '@/lib/product-categories';

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

export default function VoucherPlatformPage() {
    const router = useRouter();
    const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [buying, setBuying] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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
                const products = filterVoucherPlatform(data.data);
                setAllProducts(products);
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
        if (!selectedProduct) return;

        setBuying(selectedProduct.buyer_sku_code);

        try {
            const res = await fetch('/api/digiflazz/transaction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    buyer_sku_code: selectedProduct.buyer_sku_code,
                    customer_no: 'VOUCHER',
                    price: selectedProduct.selling_price || selectedProduct.price,
                    product_name: selectedProduct.product_name,
                }),
            });

            const data = await res.json();

            if (data.success) {
                alert(`Transaksi berhasil! Status: ${data.data.status}\n\nKode Voucher akan dikirim via notifikasi.`);
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

    if (!selectedBrand) {
        return (
            <div className="min-h-screen bg-black text-white pb-24 font-sans">
                <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-white/5 px-6 pt-8 pb-4 flex items-center gap-4">
                    <Link href="/games" className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-white hover:bg-[#bef264] hover:text-black transition-colors">
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-lg font-bold">Voucher Platform</h1>
                        <p className="text-xs text-neutral-500">Google Play, Xbox, PlayStation, Steam</p>
                    </div>
                </header>

                <div className="px-6 py-6">
                    {availableBrands.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-neutral-500 text-sm">Tidak ada voucher platform tersedia</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-3">
                            {availableBrands.map((brand) => (
                                <motion.div
                                    key={brand.brand}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setSelectedBrand(brand)}
                                    className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 cursor-pointer hover:border-[#bef264] hover:bg-neutral-800 transition-all group flex flex-col items-center justify-center gap-2"
                                >
                                    <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center">
                                        <CreditCard className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <span className="font-semibold text-xs text-white group-hover:text-[#bef264] text-center line-clamp-2">{brand.name}</span>
                                    <span className="text-[10px] text-neutral-500">{brand.productCount} produk</span>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white pb-24 font-sans">
            <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-white/5 px-6 pt-8 pb-4 flex items-center gap-4">
                <button
                    onClick={() => setSelectedBrand(null)}
                    className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-white hover:bg-[#bef264] hover:text-black transition-colors"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-lg font-bold">{selectedBrand.name}</h1>
                    <p className="text-xs text-neutral-500">{brandProducts.length} produk tersedia</p>
                </div>
            </header>

            <div className="px-6 py-6">
                <div className="space-y-3">
                    {brandProducts.map((product) => (
                        <motion.div
                            key={product.buyer_sku_code}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedProduct(product)}
                            className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 cursor-pointer hover:border-[#bef264] hover:bg-neutral-800 transition-all group flex justify-between items-center"
                        >
                            <div className="flex-1">
                                <h3 className="font-bold text-white text-sm group-hover:text-[#bef264]">{product.product_name}</h3>
                                <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{product.desc}</p>
                            </div>
                            <span className="text-[#bef264] font-bold ml-4">
                                Rp {(product.selling_price || product.price).toLocaleString('id-ID')}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </div>

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
                                <h2 className="text-lg font-bold">Beli Voucher Platform</h2>
                                <button onClick={() => !buying && setSelectedProduct(null)} className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
                                    <p className="text-xs text-amber-400">⚠️ Setelah pembayaran berhasil, Anda akan menerima <strong>KODE VOUCHER</strong> via notifikasi. Redeem kode tersebut di aplikasi/website terkait.</p>
                                </div>
                                <div className="bg-neutral-800 rounded-2xl p-4">
                                    <p className="text-xs text-neutral-500 mb-1">Produk</p>
                                    <p className="font-semibold">{selectedProduct.product_name}</p>
                                    {selectedProduct.desc && (
                                        <p className="text-xs text-neutral-400 mt-2">{selectedProduct.desc}</p>
                                    )}
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
