'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Loader2, Play, X, Phone, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { filterStreamingProducts, Product } from '@/lib/product-categories';

interface Brand {
    name: string;
    brand: string;
    image?: string;
    color: string;
    inputType: 'phone' | 'id';
    inputLabel: string;
    inputPlaceholder: string;
}

const streamingProviders: Brand[] = [
    {
        name: 'Vidio',
        brand: 'VIDIO',
        image: 'https://res.cloudinary.com/dbewzh9kl/image/upload/v1736319481/vidio_logo_ewxzhs.png',
        color: 'bg-blue-600',
        inputType: 'phone',
        inputLabel: 'Nomor HP',
        inputPlaceholder: 'Contoh: 08123456789'
    },
    {
        name: 'WeTV',
        brand: 'WETV',
        image: 'https://res.cloudinary.com/dbewzh9kl/image/upload/v1736319481/wetv_logo_p6ssgv.png',
        color: 'bg-orange-500',
        inputType: 'id',
        inputLabel: 'Nomor ID WeTV',
        inputPlaceholder: 'Masukkan ID WeTV Anda'
    },
];

export default function StreamingDirectPage() {
    const router = useRouter();
    const [selectedProvider, setSelectedProvider] = useState<Brand | null>(null);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [buying, setBuying] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [customerNo, setCustomerNo] = useState('');
    const [brandIcons, setBrandIcons] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchBrandIcons();
    }, []);

    useEffect(() => {
        if (selectedProvider) {
            fetchProducts(selectedProvider.brand);
        }
    }, [selectedProvider]);

    const fetchBrandIcons = async () => {
        try {
            const res = await fetch('/api/brands?category=streaming');
            const data = await res.json();
            if (data.success) {
                const icons: Record<string, string> = {};
                data.data.forEach((brand: any) => {
                    icons[brand.id.toUpperCase()] = brand.iconDetail || brand.iconHome || '';
                    icons[brand.name.toUpperCase()] = brand.iconDetail || brand.iconHome || '';
                });
                setBrandIcons(icons);
            }
        } catch (error) {
            console.error('Failed to fetch brand icons:', error);
        }
    };

    const fetchProducts = async (brand: string) => {
        setLoading(true);
        try {
            const res = await fetch('/api/digiflazz/price-list', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cmd: 'prepaid' }),
            });
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
                const streamingProducts = filterStreamingProducts(data.data)
                    .filter(p => p.brand.toUpperCase().includes(brand.toUpperCase()));
                setAllProducts(streamingProducts);
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

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

    // Step 1: Provider Selection
    if (!selectedProvider) {
        return (
            <div className="min-h-screen bg-black text-white pb-24 font-sans">
                <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-white/5 px-6 pt-8 pb-4 flex items-center gap-4">
                    <Link href="/streaming" className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-white hover:bg-[#bef264] hover:text-black transition-colors">
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-lg font-bold">Langganan Langsung</h1>
                        <p className="text-xs text-neutral-500">Top up langsung ke akun</p>
                    </div>
                </header>

                <div className="px-6 py-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4">Pilih Platform</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {streamingProviders.map((provider) => (
                            <motion.div
                                key={provider.brand}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedProvider(provider)}
                                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 cursor-pointer hover:border-[#bef264] hover:bg-neutral-800 transition-all group flex flex-col items-center justify-center gap-3"
                            >
                                {(brandIcons[provider.brand] || brandIcons[provider.name.toUpperCase()] || provider.image) ? (
                                    <div className="w-16 h-16 rounded-full overflow-hidden bg-white p-2">
                                        <img
                                            src={brandIcons[provider.brand] || brandIcons[provider.name.toUpperCase()] || provider.image!}
                                            alt={provider.name}
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                ) : (
                                    <div className={`w-16 h-16 rounded-full ${provider.color} flex items-center justify-center`}>
                                        <Play className="w-8 h-8 text-white" />
                                    </div>
                                )}
                                <span className="font-bold text-white group-hover:text-[#bef264]">{provider.name}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Step 2: Input + Products
    return (
        <div className="min-h-screen bg-black text-white pb-24 font-sans">
            <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-white/5 px-6 pt-8 pb-4 flex items-center gap-4">
                <button
                    onClick={() => {
                        setSelectedProvider(null);
                        setAllProducts([]);
                        setCustomerNo('');
                    }}
                    className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-white hover:bg-[#bef264] hover:text-black transition-colors"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-lg font-bold">{selectedProvider.name}</h1>
                    <p className="text-xs text-neutral-500">Masukkan {selectedProvider.inputLabel.toLowerCase()}</p>
                </div>
            </header>

            <div className="px-6 py-6">
                {/* Input at Top */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 mb-6">
                    <label className="text-xs text-neutral-500 block mb-2">{selectedProvider.inputLabel}</label>
                    <div className="flex items-center gap-3">
                        {selectedProvider.inputType === 'phone' ? (
                            <Phone className="w-5 h-5 text-neutral-500" />
                        ) : (
                            <User className="w-5 h-5 text-neutral-500" />
                        )}
                        <input
                            type={selectedProvider.inputType === 'phone' ? 'tel' : 'text'}
                            value={customerNo}
                            onChange={(e) => {
                                const val = selectedProvider.inputType === 'phone'
                                    ? e.target.value.replace(/[^0-9]/g, '')
                                    : e.target.value;
                                setCustomerNo(val);
                            }}
                            placeholder={selectedProvider.inputPlaceholder}
                            className="w-full bg-transparent text-lg font-bold text-white placeholder:text-neutral-700 focus:outline-none"
                            autoFocus
                        />
                    </div>
                </div>

                {/* Products */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-[#bef264]" />
                    </div>
                ) : allProducts.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-neutral-500 text-sm">Tidak ada produk tersedia</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3">
                        {allProducts.map((product) => (
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
                                        {selectedProvider.name}
                                    </span>
                                    <span className="text-[#bef264] font-bold">
                                        Rp {(product.selling_price || product.price).toLocaleString('id-ID')}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
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
                                    <p className="text-xs text-neutral-500 mb-1">{selectedProvider.inputLabel}</p>
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
