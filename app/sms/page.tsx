'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Loader2, MessageSquare, X, Phone } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';

interface Product {
    product_name: string;
    buyer_sku_code: string;
    price: number;
    selling_price?: number;
    seller_name: string;
    brand: string;
    category: string;
    desc: string;
    buyer_product_status: boolean;
    seller_product_status: boolean;
}

interface Brand {
    name: string;
    brand: string;
    productCount: number;
}

const brandColors: Record<string, string> = {
    'TELKOMSEL': 'bg-red-600',
    'INDOSAT': 'bg-yellow-500',
    'AXIS': 'bg-purple-600',
    'SMARTFREN': 'bg-pink-600',
    'THREE': 'bg-black',
    'XL': 'bg-blue-600',
};

const getBrandColor = (brand: string): string => {
    const upperBrand = brand.toUpperCase();
    for (const [key, color] of Object.entries(brandColors)) {
        if (upperBrand.includes(key)) return color;
    }
    return 'bg-neutral-700';
};

const formatBrandName = (brand: string): string => {
    return brand
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

export default function SMSPage() {
    const router = useRouter();
    const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [buying, setBuying] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [phoneNumber, setPhoneNumber] = useState('');

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
                const smsProducts = data.data.filter(
                    (p: Product) =>
                        (p.category.toLowerCase().includes('sms') ||
                            p.category.toLowerCase().includes('telepon') ||
                            p.category.toLowerCase().includes('telpon') ||
                            p.product_name.toLowerCase().includes('sms') ||
                            p.product_name.toLowerCase().includes('nelpon') ||
                            p.product_name.toLowerCase().includes('telepon')) &&
                        p.buyer_product_status &&
                        p.seller_product_status
                );
                setAllProducts(smsProducts);
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
        if (!selectedProduct || !phoneNumber) return;

        setBuying(selectedProduct.buyer_sku_code);

        try {
            const res = await fetch('/api/digiflazz/transaction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    buyer_sku_code: selectedProduct.buyer_sku_code,
                    customer_no: phoneNumber,
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
                    <h1 className="text-lg font-bold">Paket SMS & Telepon</h1>
                </header>

                <div className="px-6 py-6">
                    {availableBrands.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-neutral-500 text-sm">Tidak ada paket SMS/Telepon yang tersedia saat ini</p>
                        </div>
                    ) : (
                        <>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4">
                                Pilih Provider ({availableBrands.length} tersedia)
                            </h3>
                            <div className="grid grid-cols-3 gap-3">
                                {availableBrands.map((brand) => (
                                    <motion.div
                                        key={brand.brand}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setSelectedBrand(brand)}
                                        className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 cursor-pointer hover:border-[#bef264] hover:bg-neutral-800 transition-all group flex flex-col items-center justify-center gap-2"
                                    >
                                        <div className={`w-10 h-10 rounded-full ${getBrandColor(brand.brand)} flex items-center justify-center text-sm font-bold text-white`}>
                                            {brand.name[0]}
                                        </div>
                                        <span className="font-semibold text-xs text-white group-hover:text-[#bef264] text-center">{brand.name}</span>
                                        <span className="text-[10px] text-neutral-500">{brand.productCount} produk</span>
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
                        setPhoneNumber('');
                    }}
                    className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-white hover:bg-[#bef264] hover:text-black transition-colors"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-lg font-bold">SMS/Telepon {selectedBrand.name}</h1>
                    <p className="text-xs text-neutral-500">Masukkan nomor HP</p>
                </div>
            </header>

            <div className="px-6 py-6">
                {/* Input at Top */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 mb-6">
                    <label className="text-xs text-neutral-500 block mb-2">Nomor HP</label>
                    <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-neutral-500" />
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                            placeholder="08xxxxxxxxxx"
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
                            onClick={() => phoneNumber && setSelectedProduct(product)}
                            className={`bg-neutral-900 border rounded-2xl p-4 transition-all ${!phoneNumber
                                ? 'border-neutral-800 opacity-50 cursor-not-allowed'
                                : 'border-neutral-800 hover:border-[#bef264] hover:bg-neutral-800 cursor-pointer'
                                }`}
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-white text-sm">{product.product_name}</h3>
                                    <p className="text-xs text-neutral-500 mt-1">{product.desc}</p>
                                </div>
                                <span className="text-[#bef264] font-bold">
                                    Rp {(product.selling_price || product.price).toLocaleString('id-ID')}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {!phoneNumber && brandProducts.length > 0 && (
                    <p className="text-center text-neutral-600 text-xs mt-6">
                        Masukkan nomor HP untuk melanjutkan
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
                                    <p className="text-xs text-neutral-500 mb-1">Nomor HP</p>
                                    <p className="font-semibold">{phoneNumber}</p>
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
