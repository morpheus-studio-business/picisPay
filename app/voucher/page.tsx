'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Loader2, Ticket, X, ChevronRight, Smartphone, CreditCard, Signal, ClipboardList, ShoppingBag } from 'lucide-react';
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

interface VoucherBrand {
    name: string;
    brand: string;
    productCount: number;
}

interface VoucherMenu {
    id: string;
    label: string;
    icon: React.ReactNode;
    description: string;
}

// Brand HP untuk filter
const MOBILE_BRANDS = ['TELKOMSEL', 'INDOSAT', 'AXIS', 'SMARTFREN', 'THREE', 'XL', 'TRI', 'BY.U'];

const isMobileBrand = (brand: string): boolean => {
    const upperBrand = brand.toUpperCase();
    return MOBILE_BRANDS.some(mb => upperBrand.includes(mb));
};

// Color mapping for known brands
const brandColors: Record<string, string> = {
    'TELKOMSEL': 'bg-red-600',
    'INDOSAT': 'bg-yellow-500',
    'AXIS': 'bg-purple-600',
    'SMARTFREN': 'bg-pink-600',
    'THREE': 'bg-black',
    'XL': 'bg-blue-600',
    'GOOGLE PLAY': 'bg-green-600',
    'PLAYSTATION': 'bg-blue-700',
    'STEAM': 'bg-slate-700',
    'ALFAMART': 'bg-red-600',
    'INDOMARET': 'bg-blue-600',
    'SPOTIFY': 'bg-green-500',
    'VIDIO': 'bg-blue-500',
    'XBOX': 'bg-green-700',
    'WETV': 'bg-orange-600',
    'VIU': 'bg-yellow-600',
    'NETFLIX': 'bg-red-700',
    'ITUNES': 'bg-pink-500',
    'GARENA': 'bg-orange-500',
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

// Menu items
const VOUCHER_MENUS: VoucherMenu[] = [
    { id: 'voucher-data', label: 'Voucher Data', icon: <Smartphone className="w-5 h-5" />, description: 'Voucher kode SN paket data' },
    { id: 'act-voucher', label: 'Cetak Voucher', icon: <CreditCard className="w-5 h-5" />, description: 'Aktivasi voucher fisik kosong' },
    { id: 'perdana', label: 'Cetak Perdana', icon: <Signal className="w-5 h-5" />, description: 'Aktivasi kartu SIM baru' },
    { id: 'cek-status', label: 'Cek/Redeem Voucher', icon: <ClipboardList className="w-5 h-5" />, description: 'Cek status atau redeem kode' },
    { id: 'voucher-lainnya', label: 'Voucher Lainnya', icon: <ShoppingBag className="w-5 h-5" />, description: 'Indomaret, Netflix, Games, dll' },
];

export default function VoucherPage() {
    const router = useRouter();
    const [selectedMenu, setSelectedMenu] = useState<VoucherMenu | null>(null);
    const [selectedBrand, setSelectedBrand] = useState<VoucherBrand | null>(null);
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
                // Filter only active voucher, aktivasi voucher, and perdana products
                const voucherProducts = data.data.filter(
                    (p: Product) =>
                        (p.category === 'Voucher' || p.category === 'Aktivasi Voucher' || p.category === 'Perdana') &&
                        p.buyer_product_status &&
                        p.seller_product_status
                );
                setAllProducts(voucherProducts);
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter products based on selected menu
    const menuProducts = useMemo(() => {
        if (!selectedMenu) return [];

        switch (selectedMenu.id) {
            case 'voucher-data':
                // Voucher HP only
                return allProducts.filter(p => p.category === 'Voucher' && isMobileBrand(p.brand));
            case 'act-voucher':
                // Aktivasi voucher (cetak voucher) - uses Digiflazz 'Aktivasi Voucher' category
                return allProducts.filter(p => p.category === 'Aktivasi Voucher' && isMobileBrand(p.brand));
            case 'perdana':
                // Kartu perdana
                return allProducts.filter(p => p.category === 'Perdana' && isMobileBrand(p.brand));
            case 'voucher-lainnya':
                // Non-HP vouchers
                return allProducts.filter(p => p.category === 'Voucher' && !isMobileBrand(p.brand));
            default:
                return [];
        }
    }, [allProducts, selectedMenu]);

    // Extract unique brands from menu products
    const availableBrands = useMemo(() => {
        const brandMap = new Map<string, number>();

        menuProducts.forEach(p => {
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
    }, [menuProducts]);

    // Filter products by selected brand
    const brandProducts = useMemo(() => {
        if (!selectedBrand) return [];
        return menuProducts
            .filter(p => p.brand.toUpperCase() === selectedBrand.brand)
            .sort((a, b) => a.price - b.price);
    }, [menuProducts, selectedBrand]);

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

    const handleBack = () => {
        if (selectedBrand) {
            setSelectedBrand(null);
        } else if (selectedMenu) {
            setSelectedMenu(null);
        } else {
            router.push('/');
        }
    };

    // View: Loading
    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#bef264]" />
            </div>
        );
    }

    // View: Cek Status (Special page)
    if (selectedMenu?.id === 'cek-status') {
        return (
            <div className="min-h-screen bg-black text-white pb-24 font-sans">
                <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-white/5 px-6 pt-8 pb-4 flex items-center gap-4">
                    <button
                        onClick={() => setSelectedMenu(null)}
                        className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-white hover:bg-[#bef264] hover:text-black transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-lg font-bold">Cek Status Voucher</h1>
                </header>

                <div className="px-6 py-12 text-center">
                    <ClipboardList className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
                    <p className="text-neutral-500">Fitur ini akan segera hadir</p>
                    <p className="text-xs text-neutral-600 mt-2">Cek riwayat transaksi voucher Anda</p>
                </div>
            </div>
        );
    }

    // View: Select Menu (Initial)
    if (!selectedMenu) {
        return (
            <div className="min-h-screen bg-black text-white pb-24 font-sans">
                <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-white/5 px-6 pt-8 pb-4 flex items-center gap-4">
                    <Link href="/" className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-white hover:bg-[#bef264] hover:text-black transition-colors">
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-lg font-bold">Voucher</h1>
                </header>

                <div className="px-6 py-6">
                    <div className="space-y-3">
                        {VOUCHER_MENUS.map((menu) => (
                            <motion.div
                                key={menu.id}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedMenu(menu)}
                                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 cursor-pointer hover:border-[#bef264] hover:bg-neutral-800 transition-all group flex items-center gap-4"
                            >
                                <div className="w-12 h-12 rounded-full bg-neutral-800 group-hover:bg-[#bef264] group-hover:text-black flex items-center justify-center text-[#bef264] transition-colors">
                                    {menu.icon}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-white group-hover:text-[#bef264]">{menu.label}</h3>
                                    <p className="text-xs text-neutral-500">{menu.description}</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-neutral-600 group-hover:text-[#bef264]" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // View: Select Brand
    if (!selectedBrand) {
        return (
            <div className="min-h-screen bg-black text-white pb-24 font-sans">
                <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-white/5 px-6 pt-8 pb-4 flex items-center gap-4">
                    <button
                        onClick={handleBack}
                        className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-white hover:bg-[#bef264] hover:text-black transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold">{selectedMenu.label}</h1>
                        <p className="text-xs text-neutral-500">{selectedMenu.description}</p>
                    </div>
                </header>

                <div className="px-6 py-6">
                    {availableBrands.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-neutral-500 text-sm">Tidak ada produk yang tersedia saat ini</p>
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
                                        <span className="font-semibold text-xs text-white group-hover:text-[#bef264] text-center line-clamp-2">{brand.name}</span>
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

    // View: Products
    return (
        <div className="min-h-screen bg-black text-white pb-24 font-sans">
            <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-white/5 px-6 pt-8 pb-4 flex items-center gap-4">
                <button
                    onClick={handleBack}
                    className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-white hover:bg-[#bef264] hover:text-black transition-colors"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-lg font-bold">{selectedMenu.label} - {selectedBrand.name}</h1>
                    <p className="text-xs text-neutral-500">{brandProducts.length} produk tersedia</p>
                </div>
            </header>

            <div className="px-6 py-6">
                {brandProducts.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-neutral-500 text-sm">Produk tidak tersedia</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {brandProducts.map((product) => (
                            <motion.div
                                key={product.buyer_sku_code}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedProduct(product)}
                                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 cursor-pointer hover:border-[#bef264] hover:bg-neutral-800 transition-all group"
                            >
                                <div className="flex flex-col items-center text-center">
                                    <div className={`w-10 h-10 rounded-full ${getBrandColor(selectedBrand.brand)} flex items-center justify-center mb-2`}>
                                        <Ticket className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="font-bold text-white text-sm mb-1 line-clamp-2 group-hover:text-[#bef264]">{product.product_name}</h3>
                                    <span className="text-[#bef264] font-bold text-lg">
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
                                <button
                                    onClick={() => !buying && setSelectedProduct(null)}
                                    className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="bg-neutral-800 rounded-2xl p-4">
                                    <p className="text-xs text-neutral-500 mb-1">Produk</p>
                                    <p className="font-semibold">{selectedProduct.product_name}</p>
                                    {selectedProduct.desc && (
                                        <p className="text-xs text-neutral-400 mt-2">{selectedProduct.desc}</p>
                                    )}
                                </div>
                                <div className="bg-neutral-800 rounded-2xl p-4">
                                    <p className="text-xs text-neutral-500 mb-1">Brand</p>
                                    <p className="font-semibold">{selectedBrand?.name}</p>
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
                                {buying ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
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
