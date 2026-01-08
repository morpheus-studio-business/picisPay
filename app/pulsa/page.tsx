'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Phone, Loader2, Smartphone, X } from 'lucide-react';
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

interface Provider {
    name: string;
    brand: string;
    image: string; // Using simple colored placeholders or initals if no image
    color: string;
}

const providers: Provider[] = [
    { name: 'Axis', brand: 'AXIS', image: 'https://res.cloudinary.com/dbewzh9kl/image/upload/v1767789832/axis_gxofry.png', color: 'bg-purple-600' },
    { name: 'By.U', brand: 'BY.U', image: 'https://res.cloudinary.com/dbewzh9kl/image/upload/v1767790207/byu_v2xzi0.png', color: 'bg-blue-500' },
    { name: 'Indosat', brand: 'INDOSAT', image: 'https://res.cloudinary.com/dbewzh9kl/image/upload/v1767791249/indosat_qn4gby.png', color: 'bg-yellow-500' },
    { name: 'Smartfren', brand: 'SMARTFREN', image: 'https://res.cloudinary.com/dbewzh9kl/image/upload/v1767791248/smartfren_qdoanw.png', color: 'bg-pink-600' },
    { name: 'Telkomsel', brand: 'TELKOMSEL', image: 'https://res.cloudinary.com/dbewzh9kl/image/upload/v1767791248/tsel_hgnvf3.png', color: 'bg-red-600' },
    { name: 'Tri', brand: 'THREE', image: 'https://res.cloudinary.com/dbewzh9kl/image/upload/v1767791248/tri_lfl1ff.png', color: 'bg-black' },
    { name: 'XL', brand: 'XL', image: 'https://res.cloudinary.com/dbewzh9kl/image/upload/v1767790433/xl_bh5wiz.png', color: 'bg-blue-600' },
];

const extractSubCategory = (productName: string): string => {
    const name = productName.toUpperCase();
    if (name.includes('TRANSFER')) return 'Transfer';
    if (name.includes('MASA AKTIF')) return 'Masa Aktif';
    if (name.includes('PAKET SMS')) return 'SMS';
    if (name.includes('NELPON') || name.includes('TELEPON')) return 'Nelpon';
    return 'Reguler';
};

export default function PulsaPage() {
    const router = useRouter();
    const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [buying, setBuying] = useState<string | null>(null);
    const [selectedTab, setSelectedTab] = useState('All');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    // Fetch products only when provider is selected
    useEffect(() => {
        if (selectedProvider) {
            fetchProducts(selectedProvider.brand);
        }
    }, [selectedProvider]);

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
                // Filter by category Pulsa AND selected brand
                const pulsaProducts = data.data.filter(
                    (p: Product) =>
                        p.category === 'Pulsa' &&
                        p.brand.toUpperCase().includes(brand.toUpperCase()) &&
                        p.buyer_product_status &&
                        p.seller_product_status
                ).sort((a: Product, b: Product) => a.price - b.price);
                setProducts(pulsaProducts);
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    const subCategories = useMemo(() => {
        if (products.length === 0) return [];
        const categories = new Set<string>();
        products.forEach(p => {
            categories.add(extractSubCategory(p.product_name));
        });
        const cats = Array.from(categories);
        if (cats.length <= 1) return [];
        return ['All', ...cats.sort()];
    }, [products]);

    const filteredProducts = useMemo(() => {
        let filtered = products;
        if (selectedTab !== 'All') {
            filtered = filtered.filter(p => extractSubCategory(p.product_name) === selectedTab);
        }
        return filtered;
    }, [products, selectedTab]);

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

    // View: Select Provider
    if (!selectedProvider) {
        return (
            <div className="min-h-screen bg-black text-white pb-24 font-sans">
                <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-white/5 px-6 pt-8 pb-4 flex items-center gap-4">
                    <Link href="/" className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-white hover:bg-[#bef264] hover:text-black transition-colors">
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-lg font-bold">Isi Pulsa</h1>
                </header>

                <div className="px-6 py-6" id="products-section">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4">Pilih Provider</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {providers.map((provider) => (
                            <motion.div
                                key={provider.name}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedProvider(provider)}
                                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 cursor-pointer hover:border-[#bef264] hover:bg-neutral-800 transition-all group flex flex-col items-center justify-center gap-3 relative overflow-hidden"
                            >
                                {provider.image ? (
                                    <div className="w-16 h-16 rounded-full overflow-hidden mb-1 bg-[#bef264] p-1">
                                        <img src={provider.image} alt={provider.name} className="w-full h-full object-cover rounded-full" />
                                    </div>
                                ) : (
                                    <div className={`w-12 h-12 rounded-full ${provider.color} flex items-center justify-center text-xl font-bold`}>
                                        {provider.name[0]}
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

    // View: Input Number & Products
    return (
        <div className="min-h-screen bg-black text-white pb-24 font-sans">
            <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-white/5 px-6 pt-8 pb-4 flex items-center gap-4">
                <button
                    onClick={() => {
                        setSelectedProvider(null);
                        setPhoneNumber('');
                        setProducts([]);
                        setSelectedTab('All');
                    }}
                    className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-white hover:bg-[#bef264] hover:text-black transition-colors"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-lg font-bold">Pulsa {selectedProvider.name}</h1>
                    <p className="text-xs text-neutral-500">Masukkan nomor tujuan</p>
                </div>
            </header>

            <div className="px-6 py-6">
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 mb-6">
                    <label className="text-xs text-neutral-500 block mb-2">Nomor Telepon</label>
                    <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-neutral-500" />
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9]/g, '');
                                setPhoneNumber(val);
                            }}
                            placeholder="Contoh: 08123456789"
                            className="w-full bg-transparent text-lg font-bold text-white placeholder:text-neutral-700 focus:outline-none"
                            autoFocus
                        />
                    </div>
                </div>

                {products.length > 0 && subCategories.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-4 mb-2 scrollbar-hide">
                        {subCategories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedTab(cat)}
                                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${selectedTab === cat
                                    ? 'bg-[#bef264] text-black'
                                    : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-[#bef264]" />
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-neutral-500 text-sm">Produk tidak tersedia untuk provider ini</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3">
                        {filteredProducts.map((product) => (
                            <motion.div
                                key={product.buyer_sku_code}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => phoneNumber && setSelectedProduct(product)}
                                className={`bg-neutral-900 border rounded-2xl p-4 relative overflow-hidden transition-all ${!phoneNumber
                                    ? 'border-neutral-800 opacity-50 cursor-not-allowed'
                                    : 'border-neutral-800 hover:border-[#bef264] hover:bg-neutral-800 cursor-pointer'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-bold text-white text-sm mb-1">{product.product_name}</h3>
                                        <p className="text-xs text-neutral-500 line-clamp-2">{product.desc}</p>
                                    </div>
                                    {/* <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-xl">
                                        📱
                                    </div> */}
                                </div>
                                <div className="flex justify-between items-center mt-3 pt-3 border-t border-neutral-800">
                                    <span className="text-xs font-medium px-2 py-1 rounded bg-neutral-800 text-neutral-400">
                                        {product.category}
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
                            className="bg-neutral-900 rounded-t-3xl w-full max-w-lg p-6 max-h-[60vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold">Konfirmasi Pembelian</h2>
                                <button
                                    onClick={() => !buying && setSelectedProduct(null)}
                                    className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl flex gap-3">
                                    <div className="p-2 bg-orange-500/20 rounded-lg h-fit">
                                        <Smartphone className="w-4 h-4 text-orange-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-orange-400 font-bold mb-1">Cek Kembali Nomor Anda</p>
                                        <p className="text-[10px] text-orange-500/80 leading-relaxed">
                                            Pastikan nomor HP tujuan benar. Transaksi tidak dapat dibatalkan jika nomor salah.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-neutral-800 rounded-xl p-3 col-span-2">
                                        <p className="text-[10px] text-neutral-500 mb-0.5">Produk</p>
                                        <p className="text-sm font-semibold truncate">{selectedProduct.product_name}</p>
                                    </div>
                                    <div className="bg-neutral-800 rounded-xl p-3 col-span-2">
                                        <p className="text-[10px] text-neutral-500 mb-0.5">Nomor Tujuan</p>
                                        <p className="text-lg font-mono font-bold tracking-wider">{phoneNumber}</p>
                                    </div>
                                </div>

                                <div className="bg-neutral-800 rounded-xl p-4 flex justify-between items-center">
                                    <p className="text-xs text-neutral-500">Total Harga</p>
                                    <p className="text-xl font-bold text-[#bef264]">
                                        Rp {(selectedProduct.selling_price || selectedProduct.price).toLocaleString('id-ID')}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={handleConfirmBuy}
                                disabled={buying !== null}
                                className="w-full bg-[#bef264] text-black font-bold rounded-2xl py-4 hover:bg-[#bef264]/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {buying ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Memproses...</span>
                                    </>
                                ) : (
                                    'Konfirmasi & Bayar'
                                )}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
