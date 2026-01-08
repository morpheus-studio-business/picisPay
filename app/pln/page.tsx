'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, CreditCard, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

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

export default function PLNPage() {
    const router = useRouter();
    const [meterId, setMeterId] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [buying, setBuying] = useState<string | null>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/digiflazz/price-list', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cmd: 'prepaid' }),
            });
            const data = await res.json();
            if (data.success) {
                // Filter only PLN Token products
                const plnProducts = data.data.filter(
                    (p: Product) =>
                        p.category === 'PLN' &&
                        p.brand === 'PLN' &&
                        p.buyer_product_status &&
                        p.seller_product_status
                ).sort((a: Product, b: Product) => a.price - b.price);
                setProducts(plnProducts);
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBuy = async (product: Product) => {
        if (!meterId || meterId.length < 10) {
            alert('Masukkan ID Pelanggan yang valid (minimal 10 digit)');
            return;
        }

        setBuying(product.buyer_sku_code);

        try {
            const res = await fetch('/api/digiflazz/transaction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    buyer_sku_code: product.buyer_sku_code,
                    customer_no: meterId,
                    price: product.selling_price || product.price,
                    product_name: product.product_name,
                }),
            });

            const data = await res.json();

            if (data.success) {
                alert(`Transaksi berhasil! Status: ${data.data.status}`);
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

    // Extract nominal from product name for display
    const getNominal = (name: string) => {
        const match = name.match(/(\d+)/);
        return match ? parseInt(match[1]) : 0;
    };

    return (
        <div className="min-h-screen bg-black text-white pb-24 font-sans">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-white/5 px-6 pt-8 pb-4 flex items-center gap-4">
                <Link href="/" className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-white hover:bg-[#bef264] hover:text-black transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-lg font-bold">Token PLN</h1>
            </header>

            {/* Meter ID Input */}
            <div className="px-6 py-6">
                <div className="relative">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                    <input
                        type="text"
                        value={meterId}
                        onChange={(e) => setMeterId(e.target.value.replace(/\D/g, ''))}
                        placeholder="Masukkan ID Pelanggan / No. Meter..."
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-[#bef264] focus:ring-1 focus:ring-[#bef264] transition-all placeholder:text-neutral-600"
                    />
                </div>

                {meterId.length >= 10 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 p-3 bg-[#bef264]/10 rounded-xl border border-[#bef264]/20"
                    >
                        <p className="text-xs text-[#bef264]">✓ ID Pelanggan: {meterId}</p>
                    </motion.div>
                )}
            </div>

            {/* Token Nominals */}
            <div className="px-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4">Pilih Nominal Token</h3>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-[#bef264]" />
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-neutral-500 text-sm">Produk PLN tidak tersedia</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {products.map((product) => {
                            const isGangguan = !product.buyer_product_status || !product.seller_product_status;
                            return (
                                <motion.div
                                    key={product.buyer_sku_code}
                                    whileTap={isGangguan ? {} : { scale: 0.95 }}
                                    onClick={() => !isGangguan && meterId.length >= 10 && !buying && handleBuy(product)}
                                    className={`bg-neutral-900 border rounded-2xl p-5 transition-all group ${isGangguan
                                        ? 'border-red-900/50 opacity-60 cursor-not-allowed'
                                        : meterId.length < 10
                                            ? 'border-neutral-800 opacity-50 cursor-not-allowed'
                                            : buying === product.buyer_sku_code
                                                ? 'border-neutral-800 opacity-50 pointer-events-none'
                                                : 'border-neutral-800 cursor-pointer hover:border-[#bef264] hover:bg-neutral-800'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-xs text-neutral-500 uppercase tracking-wide">Token</span>
                                        {isGangguan && (
                                            <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-medium rounded-full">
                                                Gangguan
                                            </span>
                                        )}
                                    </div>
                                    <p className={`text-lg font-black ${isGangguan ? 'text-neutral-400' : 'text-white group-hover:text-[#bef264]'}`}>
                                        {product.product_name.replace('PLN ', '')}
                                    </p>
                                    <p className={`text-sm font-bold mt-1 ${isGangguan ? 'text-neutral-500' : 'text-[#bef264]'}`}>
                                        Rp {(product.selling_price || product.price).toLocaleString('id-ID')}
                                    </p>
                                    {buying === product.buyer_sku_code && (
                                        <Loader2 className="w-4 h-4 animate-spin text-[#bef264] mt-2" />
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {meterId.length < 10 && !loading && products.length > 0 && (
                    <p className="text-center text-neutral-600 text-xs mt-6">
                        Masukkan ID Pelanggan untuk melanjutkan
                    </p>
                )}
            </div>
        </div>
    );
}
