'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Loader2, Gamepad2, X, User, Server } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { filterGamesTopUp, Product } from '@/lib/product-categories';

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

// Configuration for Game Inputs
const GAME_INPUT_CONFIG: Record<string, {
    labelUserId: string;
    hasServerId: boolean;
    serverIdLabel?: string;
    isServerIdDropdown?: boolean;
    serverOptions?: string[];
    placeholderUserId?: string;
    placeholderServerId?: string;
    serverIdType?: 'text' | 'number';
}> = {
    'MOBILE LEGENDS': {
        labelUserId: 'User ID',
        hasServerId: true,
        serverIdLabel: 'Zone ID',
        placeholderUserId: 'Contoh: 12345678',
        placeholderServerId: 'Contoh: 12345',
        serverIdType: 'number',
    },
    'MOBILE LEGENDS GLOBAL': {
        labelUserId: 'User ID',
        hasServerId: true,
        serverIdLabel: 'Zone ID',
        placeholderUserId: 'Contoh: 12345678',
        placeholderServerId: 'Contoh: 12345',
        serverIdType: 'number',
    },
    'GENSHIN IMPACT': {
        labelUserId: 'UID',
        hasServerId: true,
        serverIdLabel: 'Server',
        isServerIdDropdown: true,
        serverOptions: ['Asia', 'America', 'Europe', 'TW,HK,MO'],
        placeholderUserId: 'Contoh: 800000000',
    },
    'HONKAI: STAR RAIL': {
        labelUserId: 'UID',
        hasServerId: true,
        serverIdLabel: 'Server',
        isServerIdDropdown: true,
        serverOptions: ['Asia', 'America', 'Europe', 'TW,HK,MO'],
    },
    'FREE FIRE': {
        labelUserId: 'Player ID',
        hasServerId: false,
        placeholderUserId: 'Contoh: 12345678',
    },
    'PUBG MOBILE': {
        labelUserId: 'ID Pemain',
        hasServerId: false,
        placeholderUserId: 'Contoh: 5123456789',
    },
    'VALORANT': {
        labelUserId: 'Riot ID',
        hasServerId: false,
        placeholderUserId: 'Username#Tag',
    },
    'HIGGS DOMINO': {
        labelUserId: 'User ID',
        hasServerId: false,
        placeholderUserId: 'Masukkan ID Pengguna',
    },
    'CALL OF DUTY MOBILE': {
        labelUserId: 'OpenID',
        hasServerId: false,
        placeholderUserId: 'Contoh: 12345678901234567',
    },
    'ARENA OF VALOR': {
        labelUserId: 'User ID',
        hasServerId: false,
        placeholderUserId: 'Contoh: 1234567890123456',
    },
    'POINT BLANK': {
        labelUserId: 'User ID',
        hasServerId: false,
        placeholderUserId: 'Contoh: Zepetto ID',
    },
    'RAGNAROK M: ETERNAL LOVE': {
        labelUserId: 'User ID',
        hasServerId: true,
        serverIdLabel: 'Zone ID',
        placeholderUserId: 'ID Karakter',
        placeholderServerId: 'Zone ID',
        serverIdType: 'number',
    },
    'LIFEAFTER': {
        labelUserId: 'Account ID',
        hasServerId: true,
        serverIdLabel: 'Server ID',
        placeholderUserId: 'Account ID',
        placeholderServerId: 'Server ID',
    },
    'BRAWL STARS': {
        labelUserId: 'Player Tag',
        hasServerId: false,
        placeholderUserId: '#TAG123',
    },
    'CLASH OF CLANS': {
        labelUserId: 'Player Tag',
        hasServerId: false,
        placeholderUserId: '#TAG123',
    },
    'CLASH ROYALE': {
        labelUserId: 'Player Tag',
        hasServerId: false,
        placeholderUserId: '#TAG123',
    },
    'SAUSAGE MAN': {
        labelUserId: 'Character ID',
        hasServerId: false,
        placeholderUserId: 'Contoh: 12345',
    },
    'GROWTOPIA': {
        labelUserId: 'GrowID',
        hasServerId: true,
        serverIdLabel: 'World Name',
        placeholderUserId: 'Masukkan GrowID',
        placeholderServerId: 'Nama World',
        serverIdType: 'text',
    },
    'SUPER SUS': {
        labelUserId: 'Space ID',
        hasServerId: false,
        placeholderUserId: 'Contoh: 12345678',
    },
    'UNDAWN': {
        labelUserId: 'Player ID',
        hasServerId: true,
        serverIdLabel: 'Server',
        placeholderUserId: 'Contoh: 12345678',
        placeholderServerId: 'Contoh: Raven',
    },
    'LITA': {
        labelUserId: 'User ID',
        hasServerId: false,
        placeholderUserId: 'Contoh: 1234567',
    },
    'FIFA MOBILE': {
        labelUserId: 'UID',
        hasServerId: false,
        placeholderUserId: 'Contoh: 1234567890',
    },
    'ZENLESS ZONE ZERO': {
        labelUserId: 'UID',
        hasServerId: true,
        serverIdLabel: 'Server',
        isServerIdDropdown: true,
        serverOptions: ['Asia', 'America', 'Europe', 'TW,HK,MO'],
        placeholderUserId: 'Contoh: 12345678',
    },
    'WUTHERING WAVES': {
        labelUserId: 'User ID',
        hasServerId: true,
        serverIdLabel: 'Server',
        isServerIdDropdown: true,
        serverOptions: ['Asia', 'America', 'Europe', 'SEA', 'HMT'],
        placeholderUserId: 'Contoh: 12345678',
    },
    'TOWER OF FANTASY': {
        labelUserId: 'User ID',
        hasServerId: true,
        serverIdLabel: 'Server',
        isServerIdDropdown: true,
        serverOptions: ['Southeast Asia', 'North America', 'Europe', 'South America', 'Asia-Pacific'],
        placeholderUserId: 'Contoh: 12345678',
    },
    'IDENTITY V': {
        labelUserId: 'User ID',
        hasServerId: true,
        serverIdLabel: 'Server',
        isServerIdDropdown: true,
        serverOptions: ['Asia', 'NA-EU'],
        placeholderUserId: 'Contoh: 12345678',
    },
    'HONOR OF KINGS': {
        labelUserId: 'UID',
        hasServerId: false,
        placeholderUserId: 'Contoh: 12345678',
    },
    'HARRY POTTER: MAGIC AWAKENED': {
        labelUserId: 'User ID',
        hasServerId: true,
        serverIdLabel: 'Server',
        placeholderUserId: 'Contoh: 12345',
        placeholderServerId: 'Contoh: Server Name',
    },
    'BLOOD STRIKE': {
        labelUserId: 'User ID',
        hasServerId: false,
        placeholderUserId: 'Contoh: 12345678',
    },
    'PUNISHING GRAY RAVEN': {
        labelUserId: 'Role ID',
        hasServerId: true,
        serverIdLabel: 'Server',
        isServerIdDropdown: true,
        serverOptions: ['Asia-Pacific', 'North America', 'Europe'],
        placeholderUserId: 'Contoh: 12345678',
    },
    'METAL SLUG: AWAKENING': {
        labelUserId: 'Account ID',
        hasServerId: false,
        placeholderUserId: 'Contoh: 12345678',
    },
    'FOOTBALL MASTER 2': {
        labelUserId: 'User ID',
        hasServerId: true,
        serverIdLabel: 'Server',
        placeholderUserId: 'Contoh: 12345',
        placeholderServerId: 'Contoh: Server1',
    },
    'EGGY PARTY': {
        labelUserId: 'User ID',
        hasServerId: true,
        serverIdLabel: 'Server',
        isServerIdDropdown: true,
        serverOptions: ['Asia', 'North America', 'Europe'],
        placeholderUserId: 'Contoh: 12345678',
    },
};

export default function GamesTopUpPage() {
    const router = useRouter();
    const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [buying, setBuying] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [userId, setUserId] = useState('');
    const [serverId, setServerId] = useState('');
    const [brandIcons, setBrandIcons] = useState<Record<string, string>>({});

    const getConfig = (brandName: string) => {
        const key = brandName.toUpperCase();
        return GAME_INPUT_CONFIG[key] || {
            labelUserId: 'User ID',
            hasServerId: true,
            serverIdLabel: 'Server ID (Opsional)',
            placeholderUserId: 'Masukkan User ID...',
            placeholderServerId: 'Masukkan Server ID (jika ada)...'
        };
    };

    const config = selectedBrand ? getConfig(selectedBrand.brand) : null;

    useEffect(() => {
        fetchAllProducts();
        fetchBrandIcons();
    }, []);

    const fetchBrandIcons = async () => {
        try {
            const res = await fetch('/api/brands?category=games');
            const data = await res.json();
            if (data.success) {
                const icons: Record<string, string> = {};
                data.data.forEach((brand: any) => {
                    // Map brand ID to iconDetail (for detail pages) 
                    icons[brand.id.toUpperCase()] = brand.iconDetail || brand.iconHome || '';
                    icons[brand.name.toUpperCase()] = brand.iconDetail || brand.iconHome || '';
                });
                setBrandIcons(icons);
            }
        } catch (error) {
            console.error('Failed to fetch brand icons:', error);
        }
    };

    const fetchAllProducts = async () => {
        try {
            const res = await fetch('/api/digiflazz/price-list', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cmd: 'prepaid' }),
            });
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
                const products = filterGamesTopUp(data.data);
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
        if (!selectedProduct || !userId) return;

        setBuying(selectedProduct.buyer_sku_code);

        try {
            const customerNo = serverId ? `${userId}|${serverId}` : userId;

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
                    <Link href="/games" className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-white hover:bg-[#bef264] hover:text-black transition-colors">
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-lg font-bold">Top Up Games</h1>
                        <p className="text-xs text-neutral-500">Pilih game untuk top up langsung</p>
                    </div>
                </header>

                <div className="px-6 py-6">
                    {availableBrands.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-neutral-500 text-sm">Tidak ada game tersedia</p>
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
                                    <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center overflow-hidden">
                                        {brandIcons[brand.brand] || brandIcons[brand.name.toUpperCase()] ? (
                                            <img
                                                src={brandIcons[brand.brand] || brandIcons[brand.name.toUpperCase()]}
                                                alt={brand.name}
                                                className="w-full h-full object-contain"
                                            />
                                        ) : (
                                            <Gamepad2 className="w-5 h-5 text-white" />
                                        )}
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

    // Step 2: Input at Top + Products
    return (
        <div className="min-h-screen bg-black text-white pb-24 font-sans">
            <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-white/5 px-6 pt-8 pb-4 flex items-center gap-4">
                <button
                    onClick={() => {
                        setSelectedBrand(null);
                        setUserId('');
                        setServerId('');
                    }}
                    className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-white hover:bg-[#bef264] hover:text-black transition-colors"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-lg font-bold">{selectedBrand.name}</h1>
                    <p className="text-xs text-neutral-500">Masukkan User ID</p>
                </div>
            </header>

            <div className="px-6 py-6">
                {/* Input at Top - Dynamic based on Game */}
                <div className="space-y-3 mb-6">
                    {/* User ID Input */}
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
                        <label className="text-xs text-neutral-500 block mb-2">{config?.labelUserId || 'User ID'}</label>
                        <div className="flex items-center gap-3">
                            <User className="w-5 h-5 text-neutral-500" />
                            <input
                                type="text"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                placeholder={config?.placeholderUserId || 'Masukkan User ID...'}
                                className="w-full bg-transparent text-lg font-bold text-white placeholder:text-neutral-700 focus:outline-none"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Server ID Input (Conditional) */}
                    {config?.hasServerId && (
                        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
                            <label className="text-xs text-neutral-500 block mb-2">{config.serverIdLabel || 'Server ID'}</label>
                            <div className="flex items-center gap-3">
                                <Server className="w-5 h-5 text-neutral-500" />
                                {config.isServerIdDropdown ? (
                                    <select
                                        value={serverId}
                                        onChange={(e) => setServerId(e.target.value)}
                                        className="w-full bg-transparent text-lg font-bold text-white focus:outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="" disabled className="bg-neutral-900 text-neutral-500">Pilih Server</option>
                                        {config.serverOptions?.map(opt => (
                                            <option key={opt} value={opt} className="bg-neutral-900 text-white">{opt}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type={config.serverIdType || "text"}
                                        value={serverId}
                                        onChange={(e) => setServerId(e.target.value)}
                                        placeholder={config.placeholderServerId || 'Masukkan Server ID...'}
                                        className="w-full bg-transparent text-lg font-bold text-white placeholder:text-neutral-700 focus:outline-none"
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Products */}
                <div className="space-y-3">
                    {brandProducts.map((product) => (
                        <motion.div
                            key={product.buyer_sku_code}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => userId && setSelectedProduct(product)}
                            className={`bg-neutral-900 border rounded-2xl p-4 transition-all ${!userId
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

                {!userId && brandProducts.length > 0 && (
                    <p className="text-center text-neutral-600 text-xs mt-6">
                        Masukkan User ID untuk melanjutkan
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
                                <h2 className="text-lg font-bold">Top Up {selectedBrand.name}</h2>
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
                                    <p className="text-xs text-neutral-500 mb-1">User ID</p>
                                    <p className="font-semibold">{serverId ? `${userId} | Server: ${serverId}` : userId}</p>
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
