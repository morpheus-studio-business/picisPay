'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Wallet, Phone, Loader2, X } from 'lucide-react';
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

interface WalletType {
    id: string;
    name: string;
    image?: string;
}

const wallets: WalletType[] = [
    { id: 'GOPAY', name: 'GoPay' },
    { id: 'OVO', name: 'OVO' },
    { id: 'DANA', name: 'DANA' },
    { id: 'SHOPEE', name: 'ShopeePay' },
    { id: 'LINK', name: 'LinkAja' },
];

export default function EwalletPage() {
    const router = useRouter();
    const [selectedWallet, setSelectedWallet] = useState<WalletType | null>(null);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [buying, setBuying] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    useEffect(() => {
        if (selectedWallet) {
            fetchProducts(selectedWallet.id);
        }
    }, [selectedWallet]);

    const fetchProducts = async (walletId: string) => {
        setLoading(true);
        try {
            const res = await fetch('/api/digiflazz/price-list', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cmd: 'prepaid' }),
            });
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
                const filtered = data.data.filter(
                    (p: Product) =>
                        (p.category === 'E-Money' || p.category === 'E-Wallet') &&
                        p.brand.toUpperCase().includes(walletId) &&
                        p.buyer_product_status &&
                        p.seller_product_status
                ).sort((a: Product, b: Product) => a.price - b.price);
                setProducts(filtered);
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmBuy = async () => {
        if (!selectedProduct) return;
        if (!phoneNumber || phoneNumber.length < 10) {
            alert('Masukkan nomor HP yang valid');
            return;
        }

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

    // Step 1: Wallet Selection
    if (!selectedWallet) {
        return (
            <div className="min-h-screen bg-black text-white pb-24 font-sans">
                <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-white/5 px-6 pt-8 pb-4 flex items-center gap-4">
                    <Link href="/" className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-white hover:bg-[#bef264] hover:text-black transition-colors">
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-lg font-bold">E-Wallet</h1>
                </header>

                <div className="px-6 py-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4">Pilih E-Wallet</h3>
                    <div className="grid grid-cols-1 gap-3">
                        {wallets.map((wallet) => (
                            <motion.div
                                key={wallet.id}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedWallet(wallet)}
                                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 cursor-pointer hover:border-[#bef264] hover:bg-neutral-800 transition-all flex items-center gap-4"
                            >
                                <div className="w-12 h-12 rounded-full bg-[#bef264] flex items-center justify-center">
                                    <Wallet className="w-6 h-6 text-black" />
                                </div>
                                <span className="font-bold text-white text-lg">{wallet.name}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Step 2: Input Number + Products
    return (
        <div className="min-h-screen bg-black text-white pb-24 font-sans">
            <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-white/5 px-6 pt-8 pb-4 flex items-center gap-4">
                <button
                    onClick={() => {
                        setSelectedWallet(null);
                        setPhoneNumber('');
                        setProducts([]);
                    }}
                    className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-white hover:bg-[#bef264] hover:text-black transition-colors"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-lg font-bold">{selectedWallet.name}</h1>
                    <p className="text-xs text-neutral-500">Masukkan nomor tujuan</p>
                </div>
            </header>

            {/* Phone Number Input */}
            <div className="px-6 py-6">
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 mb-6">
                    <label className="text-xs text-neutral-500 block mb-2">Nomor HP</label>
                    <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-neutral-500" />
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                            placeholder="08xxxxxxxxxx"
                            className="flex-1 bg-transparent text-xl font-bold text-white placeholder:text-neutral-600 focus:outline-none"
                            autoFocus
                        />
                    </div>
                </div>

                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4">Pilih Nominal</h3>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-[#bef264]" />
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-neutral-500 text-sm">Produk tidak tersedia</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3">
                        {products.map((product) => (
                            <motion.div
                                key={product.buyer_sku_code}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => phoneNumber.length >= 10 && !buying && setSelectedProduct(product)}
                                className={`bg-neutral-900 border rounded-2xl p-4 transition-all ${phoneNumber.length < 10
                                        ? 'border-neutral-800 opacity-50 cursor-not-allowed'
                                        : 'border-neutral-800 cursor-pointer hover:border-[#bef264] hover:bg-neutral-800'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-lg font-bold text-white">
                                            {product.product_name.replace(/[^0-9.]/g, '')}
                                        </p>
                                        <p className="text-xs text-neutral-500">{product.brand}</p>
                                    </div>
                                    <p className="text-lg font-bold text-[#bef264]">
                                        Rp {(product.selling_price || product.price).toLocaleString('id-ID')}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {phoneNumber.length < 10 && products.length > 0 && (
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
                        className="fixed inset-0 z-50 flex items-end justify-center bg-black/80"
                        onClick={() => setSelectedProduct(null)}
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25 }}
                            className="w-full max-w-lg bg-neutral-900 rounded-t-3xl p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-white">Konfirmasi Pembelian</h3>
                                <button
                                    onClick={() => setSelectedProduct(null)}
                                    className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center"
                                >
                                    <X className="w-4 h-4 text-white" />
                                </button>
                            </div>

                            <div className="bg-neutral-800 rounded-2xl p-4 mb-4">
                                <p className="text-sm text-neutral-500 mb-1">Produk</p>
                                <p className="font-bold text-white">{selectedProduct.product_name}</p>
                            </div>

                            <div className="bg-neutral-800 rounded-2xl p-4 mb-4">
                                <p className="text-sm text-neutral-500 mb-1">Nomor Tujuan</p>
                                <p className="font-bold text-white font-mono">{phoneNumber}</p>
                            </div>

                            <div className="bg-neutral-800 rounded-2xl p-4 mb-6">
                                <p className="text-sm text-neutral-500 mb-1">Total Pembayaran</p>
                                <p className="text-2xl font-bold text-[#bef264]">
                                    Rp {(selectedProduct.selling_price || selectedProduct.price).toLocaleString('id-ID')}
                                </p>
                            </div>

                            <button
                                onClick={handleConfirmBuy}
                                disabled={buying !== null}
                                className="w-full py-4 bg-[#bef264] text-black font-bold rounded-2xl hover:bg-[#a8d94e] disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {buying ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Memproses...
                                    </>
                                ) : (
                                    'Bayar Sekarang'
                                )}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
