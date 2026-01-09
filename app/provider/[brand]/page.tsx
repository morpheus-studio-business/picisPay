'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Loader2, Smartphone, CreditCard, Signal, MessageSquare, Clock, Wifi, X, Ticket, ScanLine } from 'lucide-react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useState, useEffect, useMemo, useCallback } from 'react';
import ScannerModal from '@/components/ScannerModal';

interface Product {
    product_name: string;
    buyer_sku_code: string;
    price: number;
    selling_price?: number;
    seller_name: string;
    brand: string;
    category: string;
    type: string;
    desc: string;
    buyer_product_status: boolean;
    seller_product_status: boolean;
}

interface ServiceMenu {
    id: string;
    label: string;
    icon: React.ReactNode;
    description: string;
    categories: string[];
}

// Brand mapping
const BRAND_MAP: Record<string, string> = {
    'telkomsel': 'TELKOMSEL',
    'indosat': 'INDOSAT',
    'xl': 'XL',
    'axis': 'AXIS',
    'three': 'TRI',
    'smartfren': 'SMARTFREN',
    'byu': 'BY.U',
};

const BRAND_IMAGES: Record<string, string> = {
    'telkomsel': 'https://res.cloudinary.com/dbewzh9kl/image/upload/v1767791248/tsel_hgnvf3.png',
    'indosat': 'https://res.cloudinary.com/dbewzh9kl/image/upload/v1767791249/indosat_qn4gby.png',
    'xl': 'https://res.cloudinary.com/dbewzh9kl/image/upload/v1767790433/xl_bh5wiz.png',
    'axis': 'https://res.cloudinary.com/dbewzh9kl/image/upload/v1767789832/axis_gxofry.png',
    'three': 'https://res.cloudinary.com/dbewzh9kl/image/upload/v1767791248/tri_lfl1ff.png',
    'smartfren': 'https://res.cloudinary.com/dbewzh9kl/image/upload/v1767791248/smartfren_qdoanw.png',
    'byu': 'https://res.cloudinary.com/dbewzh9kl/image/upload/v1767790207/byu_v2xzi0.png',
};

// Extract sub-category from product name - based on previous logic
const extractSubCategory = (productName: string): string => {
    const name = productName.toUpperCase();

    // === XL Patterns ===
    if (name.includes('XTRA COMBO VIP GIFT')) return 'Xtra Combo VIP Gift';
    if (name.includes('XTRA COMBO VIP PLUS')) return 'Xtra Combo VIP Plus';
    if (name.includes('XTRA COMBO VIP')) return 'Xtra Combo VIP Plus';
    if (name.includes('XTRA COMBO WEEKEND')) return 'Xtra Combo Weekend';
    if (name.includes('XTRA COMBO FLEX')) return 'Xtra Combo Flex';
    if (name.includes('XTRA COMBO MINI')) return 'Xtra Combo Mini';
    if (name.includes('XTRA COMBO GIFT')) return 'Xtra Combo Gift';
    if (name.includes('XTRA COMBO PLUS')) return 'Xtra Combo Plus';
    if (name.includes('XTRA COMBO')) return 'Xtra Combo';
    if (name.includes('XTRA KUOTA VIDIO')) return 'Xtra Kuota Vidio';
    if (name.includes('XTRA KUOTA')) return 'Xtra Kuota';
    if (name.includes('XTRA ON')) return 'Xtra On';
    if (name.includes('COMBO LITE')) return 'Combo Lite';
    if (name.includes('COMBO UMROH HAJI')) return 'Combo Umroh Haji';
    if (name.includes('INTERNET UMROH HAJI')) return 'Internet Umroh Haji';
    if (name.includes('UMROH PLUS')) return 'Umroh Plus';
    if (name.includes('UMROH')) return 'Umroh';
    if (name.includes('HOTROD SPECIAL')) return 'Hotrod Special';
    if (name.includes('HOTROD')) return 'Hotrod';
    if (name.includes('CONFERENCE')) return 'Conference';
    if (name.includes('EDUKASI')) return 'Edukasi';
    if (name.includes('ROAMING')) return 'Roaming';
    if (name.includes('PAKET AKRAB')) return 'Paket Akrab';
    if (name.includes('BLUE')) return 'Blue';
    if (name.includes('GAMES')) return 'Games';
    if (name.includes('CENTRAL')) return 'Central';
    if (name.includes('BONUS HARIAN')) return 'Bonus Harian';
    if (name.includes('BEBAS PUAS')) return 'Bebas Puas';
    if (name.includes('GRAB GACOR')) return 'Grab Gacor';
    if (name.includes('APPS GAMES')) return 'Apps Games';
    if (name.includes('PASS')) return 'Pass';
    if (name.includes('FLEX')) return 'Flex';
    if (name.includes('FLEXMAX')) return 'FlexMax';
    if (name.includes('EAST KALSUL')) return 'East Kalsul';
    if (name.includes('EAST')) return 'East';
    if (name.includes('WEST')) return 'West';
    if (name.includes('ON')) return 'ON';
    if (name.includes('HARIAN') || name.includes('1 HARI')) return 'Harian';
    if (name.includes('MINI') && !name.includes('COMBO')) return 'Mini';

    // === Axis Patterns ===
    if (name.includes('BRONET VIDIO')) return 'Bronet Vidio';
    if (name.includes('BRONET')) return 'Bronet';
    if (name.includes('AIGO UNLIMITED')) return 'AIGO Unlimited';
    if (name.includes('AIGO SS')) return 'Aigo SS';
    if (name.includes('AIGO')) return 'Aigo SS';
    if (name.includes('OWSEM')) return 'Owsem';
    if (name.includes('CONFERENCE')) return 'Conference';
    if (name.includes('EDUKASI')) return 'Edukasi';
    if (name.includes('EKSTRA')) return 'Ekstra';
    if (name.includes('YOUTUBE')) return 'Youtube';
    if (name.includes('SOSMED')) return 'Sosmed';
    if (name.includes('SUKABUMI')) return 'Sukabumi';
    if (name.includes('KENDAL')) return 'Kendal';
    if (name.includes('SEMARANG') || name.includes('SALATIGA')) return 'Semarang-Salatiga';
    if (name.includes('BOY')) return 'BOY';
    if (name.includes('PAKET WARNET') || name.includes('WARNET')) return 'Paket Warnet';
    if (name.includes('SULUTRA')) return 'Sulutra';
    if (name.includes('NON JAWA BALI NUSRA')) return 'Non Jawa Bali Nusra';
    if (name.includes('NTT')) return 'NTT';
    if (name.includes('COMBO MABRUR')) return 'Combo Mabrur';
    if (name.includes('MABRUR')) return 'Mabrur';
    if (name.includes('JOOX')) return 'Joox';
    if (name.includes('DIGNET')) return 'Dignet';
    if (name.includes('BOOSTER')) return 'Booster';

    // === Indosat Patterns ===
    if (name.includes('FREEDOM COMBO')) return 'Freedom Combo';
    if (name.includes('FREEDOM INTERNET')) return 'Freedom Internet';
    if (name.includes('FREEDOM U')) return 'Freedom U';
    if (name.includes('FREEDOM KUOTA HARIAN')) return 'Freedom Kuota Harian';
    if (name.includes('FREEDOM APPS')) return 'Freedom Apps';
    if (name.includes('FREEDOM POSTPAID')) return 'Freedom Postpaid';
    if (name.includes('YELLOW')) return 'Yellow';
    if (name.includes('UNLIMITED')) return 'Unlimited';
    if (name.includes('EXTRA')) return 'Extra';
    if (name.includes('MINI')) return 'Mini';
    if (name.includes('PHONE')) return 'Phone';
    if (name.includes('SMS')) return 'SMS';
    if (name.includes('PINTAR')) return 'Pintar';
    if (name.includes('SIMPLE')) return 'Simple';
    if (name.includes('NEW')) return 'New';

    // === Telkomsel Patterns ===
    if (name.includes('OMG')) return 'OMG!';
    if (name.includes('COMBO SAKTI')) return 'Combo Sakti';
    if (name.includes('INTERNET SAKTI')) return 'Internet Sakti';
    if (name.includes('SAKTI')) return 'Sakti';
    if (name.includes('MAXSTREAM')) return 'MaxStream';
    if (name.includes('KETENGAN')) return 'Ketengan';
    if (name.includes('DATA BULANAN') || name.includes('BULANAN') || name.includes('30 HARI') || name.includes('30HARI')) return 'Data Bulanan';
    if (name.includes('HARIAN UNLIMITED')) return 'Harian Unlimited';
    if (name.includes('DISNEY')) return 'Disney+';
    if (name.includes('GAMESMAX')) return 'GamesMAX';
    if (name.includes('MUSICMAX')) return 'MusicMAX';
    if (name.includes('ZOOM')) return 'Zoom';
    if (name.includes('HALO')) return 'Halo';
    if (name.includes('ORBIT')) return 'Orbit';
    if (name.includes('BY.U')) return 'By.U';
    if (name.includes('ROAMAX')) return 'RoaMAX';
    if (name.includes('BELAJAR')) return 'Belajar';
    if (name.includes('VOUCHER')) return 'Voucher';

    // === Tri Patterns ===
    if (name.includes('HAPPY')) return 'Happy';
    if (name.includes('AON') || name.includes('ALWAYS ON')) return 'AlwaysOn';
    if (name.includes('HOME')) return 'Home';
    if (name.includes('MIX')) return 'Mix';
    if (name.includes('MOVIIE')) return 'Movie';
    if (name.includes('KENDO')) return 'Kendo';
    if (name.includes('PAMAX')) return 'Pamax';
    if (name.includes('ADDON')) return 'AddOn';
    if (name.includes('MANCHESTER UNITED')) return 'MU';

    // === Smartfren Patterns ===
    if (name.includes('UNLIMITED NONSTOP')) return 'Unlimited Nonstop';
    if (name.includes('UNLIMITED HARIAN')) return 'Unlimited Harian';
    if (name.includes('KUOTA NONSTOP')) return 'Kuota Nonstop';
    if (name.includes('1ON+')) return '1ON+';
    if (name.includes('GOKIL MAX')) return 'Gokil Max';
    if (name.includes('CONNEX')) return 'Connex';
    if (name.includes('DATA VOLUME')) return 'Volume';
    if (name.includes('ION')) return 'ION';
    if (name.includes('EVO')) return 'Evo';
    if (name.includes('SOCIAL')) return 'Social';
    if (name.includes('VIDEO')) return 'Video';
    if (name.includes('MUSIC')) return 'Music';
    if (name.includes('CHAT')) return 'Chat';
    if (name.includes('MALAM')) return 'Malam';

    return 'Reguler';
};

// Service menus for each provider
const PROVIDER_MENUS: ServiceMenu[] = [
    { id: 'data', label: 'Isi Ulang Data', icon: <Wifi className="w-5 h-5" />, description: 'Paket data internet', categories: ['Data'] },
    { id: 'pulsa', label: 'Isi Ulang Pulsa', icon: <Smartphone className="w-5 h-5" />, description: 'Pulsa reguler', categories: ['Pulsa'] },
    { id: 'voucher', label: 'Voucher Data', icon: <Ticket className="w-5 h-5" />, description: 'Voucher kode SN', categories: ['Voucher'] },
    { id: 'cetak-voucher', label: 'Cetak Voucher', icon: <CreditCard className="w-5 h-5" />, description: 'Aktivasi voucher kosong', categories: ['Aktivasi Voucher'] },
    { id: 'perdana', label: 'Cetak Perdana', icon: <Signal className="w-5 h-5" />, description: 'Aktivasi kartu SIM baru', categories: ['Perdana'] },
    { id: 'sms', label: 'Paket SMS', icon: <MessageSquare className="w-5 h-5" />, description: 'Paket SMS & Telepon', categories: ['Paket SMS', 'SMS & Telpon'] },
    { id: 'masa-aktif', label: 'Masa Aktif', icon: <Clock className="w-5 h-5" />, description: 'Perpanjang masa aktif', categories: ['Masa Aktif'] },
];

export default function ProviderPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const brandSlug = params.brand as string;
    const brandName = BRAND_MAP[brandSlug] || brandSlug.toUpperCase();

    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMenu, setSelectedMenu] = useState<ServiceMenu | null>(null);
    const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [buying, setBuying] = useState<string | null>(null);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [voucherCode, setVoucherCode] = useState('');
    const [showScanner, setShowScanner] = useState(false);

    // Sync state with URL params
    useEffect(() => {
        const menuParam = searchParams.get('menu');
        const subParam = searchParams.get('sub');
        const productParam = searchParams.get('product');
        const scanParam = searchParams.get('scan');

        // Sync Menu
        if (menuParam) {
            const menu = PROVIDER_MENUS.find(m => m.id === menuParam);
            setSelectedMenu(menu || null);
        } else {
            setSelectedMenu(null);
        }

        // Sync SubCategory
        if (subParam) {
            setSelectedSubCategory(subParam);
        } else {
            setSelectedSubCategory(null);
        }

        // Sync Scanner
        setShowScanner(scanParam === 'true');

        // Sync Product (only if loaded)
        if (productParam && allProducts.length > 0) {
            const product = allProducts.find(p => p.buyer_sku_code === productParam);
            if (product) setSelectedProduct(product);
        } else if (!productParam) {
            setSelectedProduct(null);
        }

    }, [searchParams, allProducts]);

    const updateParams = useCallback((updates: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null) params.delete(key);
            else params.set(key, value);
        });

        // Push to history
        router.push(`?${params.toString()}`);
    }, [searchParams, router]);

    useEffect(() => {
        fetchProducts();
    }, [brandName]);

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/digiflazz/price-list', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cmd: 'prepaid' }),
            });
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
                const brandProducts = data.data.filter(
                    (p: Product) =>
                        p.brand.toUpperCase().includes(brandName) &&
                        p.buyer_product_status &&
                        p.seller_product_status
                );
                setAllProducts(brandProducts);
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter available menus based on products
    const availableMenus = useMemo(() => {
        return PROVIDER_MENUS.filter(menu => {
            return allProducts.some(p => menu.categories.some(cat => p.category === cat));
        });
    }, [allProducts]);

    // Filter products by selected menu
    const menuProducts = useMemo(() => {
        if (!selectedMenu) return [];
        return allProducts
            .filter(p => selectedMenu.categories.some(cat => p.category === cat))
            .sort((a, b) => a.price - b.price);
    }, [allProducts, selectedMenu]);

    // Get unique sub-categories for menus that need them (data, voucher, cetak-voucher)
    const menusWithSubCategories = ['data', 'voucher', 'cetak-voucher'];

    const subCategories = useMemo(() => {
        if (!selectedMenu || !menusWithSubCategories.includes(selectedMenu.id)) return [];

        const cats = new Set<string>();
        menuProducts.forEach(p => {
            // Only data uses extractSubCategory
            // voucher and cetak-voucher use p.type from Digiflazz
            if (selectedMenu.id === 'data') {
                cats.add(extractSubCategory(p.product_name));
            } else {
                cats.add(p.type || 'Umum');
            }
        });

        return Array.from(cats).sort();
    }, [menuProducts, selectedMenu]);

    // Filter products by sub-category
    const filteredProducts = useMemo(() => {
        if (!selectedSubCategory || !menusWithSubCategories.includes(selectedMenu?.id || '')) {
            return menuProducts;
        }

        if (selectedMenu?.id === 'data') {
            return menuProducts.filter(p => extractSubCategory(p.product_name) === selectedSubCategory);
        }
        return menuProducts.filter(p => (p.type || 'Umum') === selectedSubCategory);
    }, [menuProducts, selectedSubCategory, selectedMenu]);

    const handleConfirmBuy = async () => {
        if (!selectedProduct) return;

        if (['data', 'pulsa', 'sms', 'masa-aktif'].includes(selectedMenu?.id || '')) {
            if (!phoneNumber || phoneNumber.length < 10) {
                alert('Masukkan nomor HP yang valid');
                return;
            }
        }

        if (['voucher', 'cetak-voucher'].includes(selectedMenu?.id || '')) {
            if (!voucherCode || voucherCode.length < 10) {
                alert('Masukkan kode voucher yang valid');
                return;
            }
        }

        setBuying(selectedProduct.buyer_sku_code);

        // Determine customer_no based on menu type
        const customerNo = ['voucher', 'cetak-voucher'].includes(selectedMenu?.id || '')
            ? voucherCode
            : (phoneNumber || 'VOUCHER');

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
                updateParams({ product: null, menu: null });
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
        router.back();
    };

    // View: Loading
    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#bef264]" />
            </div>
        );
    }

    // View: Select Menu (Initial)
    if (!selectedMenu) {
        return (
            <div className="min-h-screen bg-black text-white pb-24 font-sans">
                <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-white/5 px-6 pt-8 pb-4 flex items-center gap-4">
                    <button
                        onClick={() => router.push('/')}
                        className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-white hover:bg-[#bef264] hover:text-black transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-neutral-900 rounded-full flex items-center justify-center overflow-hidden p-1">
                            <img src={BRAND_IMAGES[brandSlug] || ''} alt={brandName} className="w-full h-full object-contain" />
                        </div>
                        <h1 className="text-lg font-bold capitalize">{brandSlug}</h1>
                    </div>
                </header>

                <div className="px-6 py-6">
                    {availableMenus.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-neutral-500 text-sm">Tidak ada layanan yang tersedia</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {availableMenus.map((menu) => (
                                <motion.div
                                    key={menu.id}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        updateParams({ menu: menu.id });
                                    }}
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
                    )}
                </div>
            </div>
        );
    }

    // View: Select Sub-Category (for data, voucher, cetak-voucher - if no subcategory selected)
    if (['data', 'voucher', 'cetak-voucher'].includes(selectedMenu.id) && !selectedSubCategory && subCategories.length > 1) {
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
                        <p className="text-xs text-neutral-500 capitalize">{brandSlug} • Pilih Paket</p>
                    </div>
                </header>

                <div className="px-6 py-6">
                    <div className="grid grid-cols-1 gap-3">
                        {subCategories.map((cat) => {
                            const count = selectedMenu.id === 'data'
                                ? menuProducts.filter(p => extractSubCategory(p.product_name) === cat).length
                                : menuProducts.filter(p => (p.type || 'Umum') === cat).length;
                            return (
                                <motion.div
                                    key={cat}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => updateParams({ sub: cat })}
                                    className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 cursor-pointer hover:border-[#bef264] hover:bg-neutral-800 transition-all group flex items-center gap-4"
                                >
                                    {/* Provider Logo */}
                                    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-[#bef264] p-1 flex items-center justify-center">
                                        {BRAND_IMAGES[brandSlug] ? (
                                            <img src={BRAND_IMAGES[brandSlug]} alt={brandName} className="w-full h-full object-contain rounded-full" />
                                        ) : (
                                            <span className="text-black font-bold text-sm">{brandName.charAt(0)}</span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white group-hover:text-[#bef264] mb-1">{cat}</h3>
                                        <p className="text-xs text-neutral-500">{count} produk</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    // View: Products with phone input
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
                    <h1 className="text-lg font-bold">{selectedSubCategory || selectedMenu.label}</h1>
                    <p className="text-xs text-neutral-500 capitalize">{brandSlug} • {filteredProducts.length} produk</p>
                </div>
            </header>

            {/* Phone Number Input for data/pulsa */}
            {['data', 'pulsa', 'sms', 'masa-aktif'].includes(selectedMenu.id) && (
                <div className="px-6 py-4">
                    <label className="text-xs text-neutral-500 mb-2 block">Nomor Telepon</label>
                    <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="08xxxxxxxxxx"
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl px-4 py-4 text-white placeholder-neutral-600 focus:outline-none focus:border-[#bef264]"
                    />
                </div>
            )}

            {/* Voucher Code Input for voucher/cetak-voucher */}
            {['voucher', 'cetak-voucher'].includes(selectedMenu.id) && (
                <div className="px-6 py-4">
                    <label className="text-xs text-neutral-500 mb-2 block">Kode/Nomor Voucher</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={voucherCode}
                            onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                            placeholder="Masukkan 16 digit kode voucher"
                            className="flex-1 bg-neutral-900 border border-neutral-800 rounded-2xl px-4 py-4 text-white placeholder-neutral-600 focus:outline-none focus:border-[#bef264] uppercase tracking-wider"
                        />
                        <button
                            onClick={() => updateParams({ scan: 'true' })}
                            className="w-14 h-14 bg-[#bef264] rounded-2xl flex items-center justify-center text-black hover:bg-[#bef264]/80 transition-colors"
                        >
                            <ScanLine className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            )}

            <div className="px-6 py-4">
                {filteredProducts.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-neutral-500 text-sm">Produk tidak tersedia</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {filteredProducts.map((product) => (
                            <motion.div
                                key={product.buyer_sku_code}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => updateParams({ product: product.buyer_sku_code })}
                                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 cursor-pointer hover:border-[#bef264] hover:bg-neutral-800 transition-all group"
                            >
                                <div className="flex flex-col">
                                    <h3 className="font-bold text-white text-sm mb-2 line-clamp-2 group-hover:text-[#bef264]">{product.product_name}</h3>
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
            {selectedProduct && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 bg-black/80 z-50 flex items-end justify-center"
                    onClick={() => !buying && router.back()}
                >
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="bg-neutral-900 rounded-t-3xl w-full max-w-lg p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold">Konfirmasi Pembelian</h2>
                            <button
                                onClick={() => !buying && router.back()}
                                className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="bg-neutral-800 rounded-2xl p-4">
                                <p className="text-xs text-neutral-500 mb-1">Produk</p>
                                <p className="font-semibold">{selectedProduct.product_name}</p>
                            </div>
                            {phoneNumber && (
                                <div className="bg-neutral-800 rounded-2xl p-4">
                                    <p className="text-xs text-neutral-500 mb-1">Nomor Tujuan</p>
                                    <p className="font-semibold">{phoneNumber}</p>
                                </div>
                            )}
                            <div className="bg-neutral-800 rounded-2xl p-4">
                                <p className="text-xs text-neutral-500 mb-1">Total Harga</p>
                                <p className="text-2xl font-bold text-[#bef264]">
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
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                'Konfirmasi & Bayar'
                            )}
                        </button>
                    </motion.div>
                </motion.div>
            )}

            {/* Scanner Modal */}
            <ScannerModal
                isOpen={showScanner}
                onClose={() => router.back()}
                onScanSuccess={(code) => {
                    // Cleaner function inside the callback for simplicity or define outside
                    // Extract numbers: 10-20 digits usually
                    let cleanCode = code;

                    // 1. Try to find sn=... params
                    const urlMatch = code.match(/[?&]sn=([^&]+)/i);
                    if (urlMatch && urlMatch[1]) {
                        cleanCode = urlMatch[1];
                    } else {
                        // 2. Or just extract the longest sequence of digits
                        const digitSequences = code.match(/\d{10,}/g);
                        if (digitSequences && digitSequences.length > 0) {
                            // Take the longest one that looks like an SN
                            cleanCode = digitSequences.reduce((a, b) => a.length > b.length ? a : b);
                        } else {
                            // Fallback: Remove non-alphanumeric if it looks like a direct code, or just keep as is
                            // But for vouchers, usually just numbers.
                            // Dealing with *123*...#
                            const ussdMatch = code.match(/\*.*?(\d+).*?#/);
                            if (ussdMatch) {
                                cleanCode = ussdMatch[1];
                            }
                        }
                    }

                    // Remove non-alphanumeric just in case, but usually SN is digits
                    cleanCode = cleanCode.replace(/[^a-zA-Z0-9]/g, '');

                    setVoucherCode(cleanCode);
                    router.back();
                }}
            />
        </div>
    );
}
