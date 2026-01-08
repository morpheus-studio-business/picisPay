'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Wifi, Phone, Loader2, X, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useMemo, Suspense } from 'react';
import InsufficientBalanceModal from '@/components/InsufficientBalanceModal';

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

interface CategoryMapping {
    originalType: string;
    brand: string;
    customName: string;
    isHidden: boolean;
    priority: number;
}

interface Provider {
    name: string;
    brand: string;
    image: string;
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
    if (name.includes('GAMES')) return 'Games';
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
    if (name.includes('ROAMING')) return 'Roaming';
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
    if (name.includes('KETENGAN')) return 'Ketengan';
    if (name.includes('DATA BULANAN') || name.includes('BULANAN') || name.includes('30 HARI') || name.includes('30HARI')) return 'Data Bulanan';
    if (name.includes('HARIAN UNLIMITED')) return 'Harian Unlimited';
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
    if (name.includes('UNLIMITED')) return 'Unlimited';
    if (name.includes('GAMES')) return 'Games';
    if (name.includes('MOVIIE')) return 'Movie';
    if (name.includes('KENDO')) return 'Kendo';
    if (name.includes('PAMAX')) return 'Pamax';
    if (name.includes('ADDON')) return 'AddOn';
    if (name.includes('MANCHESTER UNITED')) return 'MU';

    // === Smartfren Patterns ===
    if (name.includes('UNLIMITED NONSTOP')) return 'Unlimited Nonstop';
    if (name.includes('UNLIMITED HARIAN')) return 'Unlimited Harian';
    if (name.includes('UNLIMITED')) return 'Unlimited';
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

function DataPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [categoryMappings, setCategoryMappings] = useState<CategoryMapping[]>([]);
    const [loading, setLoading] = useState(false);
    const [buying, setBuying] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [showBalanceModal, setShowBalanceModal] = useState(false);
    const [balanceInfo, setBalanceInfo] = useState({ current: 0, required: 0 });
    const [selectedDayFilter, setSelectedDayFilter] = useState<string | null>(null);

    // Auto-select provider from URL query param
    useEffect(() => {
        const brandParam = searchParams.get('brand');
        if (brandParam && !selectedProvider) {
            const provider = providers.find(p => p.brand.toLowerCase() === brandParam.toLowerCase());
            if (provider) {
                setSelectedProvider(provider);
            }
        }
    }, [searchParams, selectedProvider]);

    // Custom filter configuration per category (brand_type as key)
    // type: 'days' for day-based filtering, 'keyword' for keyword-based filtering
    type FilterConfig = {
        type: 'days';
        filters: { id: string; label: string; min: number; max: number }[];
    } | {
        type: 'keyword';
        filters: { id: string; label: string; keywords: string[] }[];
    };

    const categoryFilterConfig: Record<string, FilterConfig> = {
        // Telkomsel OMG - keyword based
        'TELKOMSEL_OMG!': {
            type: 'keyword',
            filters: [
                { id: 'omg', label: 'OMG', keywords: ['ketengan'] },
                { id: 'bulanan', label: 'Bulanan', keywords: ['30 hari', '30hr', '30 hr', 'bulanan'] },
            ]
        },
        // Axis Aigo Mini - day based
        'AXIS_Mini': {
            type: 'days',
            filters: [
                { id: '1-3', label: '1-3 Hari', min: 1, max: 3 },
                { id: '5-7', label: '5-7 Hari', min: 5, max: 7 },
                { id: '15-30', label: '15-30 Hari', min: 15, max: 30 },
            ]
        },
        // Telkomsel Mini - keyword based
        'TELKOMSEL_Mini': {
            type: 'keyword',
            filters: [
                { id: 'mini', label: 'Mini', keywords: [] },
                { id: 'harian', label: 'Harian', keywords: [] },
                { id: 'mingguan', label: 'Mingguan', keywords: [] },
            ]
        }
    };

    // Extract days from product name or description
    const extractDays = (product: Product): number | null => {
        const text = (product.product_name + ' ' + product.desc).toLowerCase();

        // Pattern: "X hari" atau "Xhr" atau "X hr"
        const patterns = [
            /(\d+)\s*hari/i,
            /(\d+)\s*hr/i,
            /(\d+)hr/i,
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                return parseInt(match[1], 10);
            }
        }
        return null;
    };

    // Check if product matches keyword filter
    const matchesKeyword = (product: Product, keywords: string[]): boolean => {
        const text = (product.product_name + ' ' + product.desc).toLowerCase();
        return keywords.some(kw => text.includes(kw.toLowerCase()));
    };

    useEffect(() => {
        if (selectedProvider) {
            fetchProducts(selectedProvider.brand);
        }
    }, [selectedProvider]);

    const fetchProducts = async (brand: string) => {
        setLoading(true);
        try {
            // Fetch products and category mappings in parallel
            const [productsRes, mappingsRes] = await Promise.all([
                fetch('/api/digiflazz/price-list', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cmd: 'prepaid' }),
                }),
                fetch('/api/admin/categories')
            ]);

            const [productsData, mappingsData] = await Promise.all([productsRes.json(), mappingsRes.json()]);

            if (productsData.success && Array.isArray(productsData.data)) {
                const dataProducts = productsData.data.filter(
                    (p: Product) =>
                        p.category === 'Data' &&
                        p.brand.toUpperCase().includes(brand.toUpperCase()) &&
                        p.buyer_product_status &&
                        p.seller_product_status
                ).sort((a: Product, b: Product) => a.price - b.price);
                setProducts(dataProducts);
            }

            if (mappingsData.success && Array.isArray(mappingsData.data)) {
                setCategoryMappings(mappingsData.data);
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    // Apply category mappings: rename, hide, sort by priority
    const categories = useMemo(() => {
        if (products.length === 0 || !selectedProvider) return [];

        // Get unique types
        const typeSet = new Set<string>();
        products.forEach(p => { if (p.type) typeSet.add(p.type); });

        // Build category list with custom mappings applied
        const categoryList = Array.from(typeSet).map(type => {
            const mapping = categoryMappings.find(
                m => m.originalType === type && m.brand.toUpperCase() === selectedProvider.brand.toUpperCase()
            );

            let isHidden = mapping?.isHidden || false;

            // SPECIAL HIDDEN LOGIC: Hide 'Data Bulanan' for Telkomsel as it's merged into OMG
            if (selectedProvider.brand === 'TELKOMSEL') {
                if (['Data Bulanan', 'Bulanan', '30 Hari'].includes(type)) isHidden = true;
                if (['Harian', 'Data Harian'].includes(type)) isHidden = true;
                if (['Mingguan', 'Data Mingguan'].includes(type)) isHidden = true;
            }

            return {
                originalType: type,
                displayName: mapping?.customName || type,
                isHidden: isHidden,
                priority: mapping?.priority ?? 999,
            };
        });

        // Filter hidden and sort by priority
        return categoryList
            .filter(c => !c.isHidden)
            .sort((a, b) => a.priority - b.priority);
    }, [products, categoryMappings, selectedProvider]);

    // Get filter config for current category
    const getFilterConfig = (): FilterConfig | null => {
        if (!selectedProvider || !selectedCategory) return null;
        // Use mapped displayName/customName logic or direct mapping if clearer

        // Special case for Telkomsel OMG to include merged logic
        if (selectedProvider.brand === 'TELKOMSEL') {
            if (['OMG!', 'OMG'].includes(selectedCategory)) {
                return categoryFilterConfig['TELKOMSEL_OMG!'];
            }
            if (['Mini', 'Ketengan', 'Data Mini', 'Data Ketengan'].includes(selectedCategory)) {
                return categoryFilterConfig['TELKOMSEL_Mini'];
            }
        }

        const key = `${selectedProvider.brand}_${selectedCategory}`;
        return categoryFilterConfig[key] || categoryFilterConfig['_default'];
    };

    // Get available filters based on current category products
    const availableFilters = useMemo(() => {
        if (!selectedCategory) return [];

        let categoryProducts = products.filter(p => p.type === selectedCategory);

        // SPECIAL LOGIC: For Telkomsel OMG, include Data Bulanan products
        if (selectedProvider?.brand === 'TELKOMSEL') {
            if (['OMG!', 'OMG'].includes(selectedCategory)) {
                const bulananProducts = products.filter(p => ['Data Bulanan', 'Bulanan', '30 Hari'].includes(p.type));
                categoryProducts = [...categoryProducts, ...bulananProducts];
            }
            if (['Mini', 'Ketengan', 'Data Mini', 'Data Ketengan'].includes(selectedCategory)) {
                const mergedProducts = products.filter(p => ['Harian', 'Data Harian', 'Mingguan', 'Data Mingguan'].includes(p.type));
                categoryProducts = [...categoryProducts, ...mergedProducts];
            }
        }

        const config = getFilterConfig();

        if (!config) return [];

        if (config.type === 'days') {
            return config.filters.filter(filter => {
                return categoryProducts.some(product => {
                    const days = extractDays(product);
                    if (days === null) return false;
                    return days >= filter.min && days <= filter.max;
                });
            }).map(f => ({ id: f.id, label: f.label }));
        } else {
            // keyword type
            return config.filters.map(filter => {
                // Determine label dynamically based on admin custom name
                let label = filter.label;
                if (selectedProvider?.brand === 'TELKOMSEL') {
                    if (['OMG!', 'OMG'].includes(selectedCategory)) {
                        if (filter.id === 'omg') {
                            const mapping = categoryMappings.find(m => ['OMG!', 'OMG'].includes(m.originalType) && m.brand.toUpperCase() === selectedProvider.brand.toUpperCase());
                            if (mapping?.customName) label = mapping.customName;
                        }
                        if (filter.id === 'bulanan') {
                            const mapping = categoryMappings.find(m => ['Data Bulanan', 'Bulanan', '30 Hari'].includes(m.originalType) && m.brand.toUpperCase() === selectedProvider.brand.toUpperCase());
                            if (mapping?.customName) label = mapping.customName;
                        }
                    }
                    if (['Mini', 'Ketengan', 'Data Mini', 'Data Ketengan'].includes(selectedCategory)) {
                        if (filter.id === 'mini') {
                            const mapping = categoryMappings.find(m => ['Mini', 'Ketengan', 'Data Mini', 'Data Ketengan'].includes(m.originalType) && m.brand.toUpperCase() === selectedProvider.brand.toUpperCase());
                            if (mapping?.customName) label = mapping.customName;
                        }
                        if (filter.id === 'harian') {
                            const mapping = categoryMappings.find(m => ['Harian', 'Data Harian'].includes(m.originalType) && m.brand.toUpperCase() === selectedProvider.brand.toUpperCase());
                            if (mapping?.customName) label = mapping.customName;
                        }
                        if (filter.id === 'mingguan') {
                            const mapping = categoryMappings.find(m => ['Mingguan', 'Data Mingguan'].includes(m.originalType) && m.brand.toUpperCase() === selectedProvider.brand.toUpperCase());
                            if (mapping?.customName) label = mapping.customName;
                        }
                    }
                }
                return { ...filter, label };
            }).filter(filter => {
                // For Telkomsel OMG merging strategy:
                if (selectedProvider?.brand === 'TELKOMSEL') {
                    if (['OMG!', 'OMG'].includes(selectedCategory)) {
                        if (filter.id === 'omg') return categoryProducts.some(p => ['OMG!', 'OMG'].includes(p.type));
                        if (filter.id === 'bulanan') return categoryProducts.some(p => ['Data Bulanan', 'Bulanan', '30 Hari'].includes(p.type));
                    }
                    if (['Mini', 'Ketengan', 'Data Mini', 'Data Ketengan'].includes(selectedCategory)) {
                        // Force show tabs for debugging/UX regardless of strict type match
                        return true;
                    }
                }
                return categoryProducts.some(product => matchesKeyword(product, filter.keywords));
            }).map(f => ({ id: f.id, label: f.label }));
        }
    }, [products, selectedCategory, selectedProvider, categories, categoryMappings]);

    const filteredProducts = useMemo(() => {
        if (!selectedCategory) return [];

        let filtered = products.filter(p => p.type === selectedCategory);

        // SPECIAL LOGIC: For Telkomsel OMG, merge Data Bulanan
        if (selectedProvider?.brand === 'TELKOMSEL') {
            if (['OMG!', 'OMG'].includes(selectedCategory)) {
                const bulananProducts = products.filter(p => ['Data Bulanan', 'Bulanan', '30 Hari'].includes(p.type));
                filtered = [...filtered, ...bulananProducts];
            }
            if (['Mini', 'Ketengan', 'Data Mini', 'Data Ketengan'].includes(selectedCategory)) {
                const mergedProducts = products.filter(p => ['Harian', 'Data Harian', 'Mingguan', 'Data Mingguan'].includes(p.type));
                filtered = [...filtered, ...mergedProducts];
            }
        }

        const config = getFilterConfig();

        // Apply filter if selected
        if (selectedDayFilter && config) {
            if (config.type === 'days') {
                const dayFilter = config.filters.find(f => f.id === selectedDayFilter);
                if (dayFilter) {
                    filtered = filtered.filter(product => {
                        const days = extractDays(product);
                        if (days === null) return false;
                        return days >= dayFilter.min && days <= dayFilter.max;
                    });
                }
            } else if (config.type === 'keyword') {
                // Special Merge Handler for Telkomsel
                if (selectedProvider?.brand === 'TELKOMSEL') {
                    if (['OMG!', 'OMG'].includes(selectedCategory)) {
                        if (selectedDayFilter === 'omg') filtered = filtered.filter(p => ['OMG!', 'OMG'].includes(p.type));
                        else if (selectedDayFilter === 'bulanan') filtered = filtered.filter(p => ['Data Bulanan', 'Bulanan', '30 Hari'].includes(p.type));
                    }
                    else if (['Mini', 'Ketengan', 'Data Mini', 'Data Ketengan'].includes(selectedCategory)) {
                        if (selectedDayFilter === 'mini') filtered = filtered.filter(p => {
                            const t = p.type.toLowerCase();
                            return t.includes('mini') || t.includes('ketengan');
                        });
                        else if (selectedDayFilter === 'harian') filtered = filtered.filter(p => {
                            const t = p.type.toLowerCase();
                            return t.includes('harian');
                        });
                        else if (selectedDayFilter === 'mingguan') filtered = filtered.filter(p => {
                            const t = p.type.toLowerCase();
                            return t.includes('mingguan');
                        });
                    }
                    else {
                        const keywordFilter = config.filters.find(f => f.id === selectedDayFilter);
                        if (keywordFilter) filtered = filtered.filter(product => matchesKeyword(product, keywordFilter.keywords));
                    }
                } else {
                    // Standard keyword filter
                    const keywordFilter = config.filters.find(f => f.id === selectedDayFilter);
                    if (keywordFilter) {
                        filtered = filtered.filter(product => matchesKeyword(product, keywordFilter.keywords));
                    }
                }
            }
        }

        return filtered;
    }, [products, selectedCategory, selectedDayFilter, categories, selectedProvider]);

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
                // Check if it's a balance error
                if (data.error === 'Saldo tidak mencukupi') {
                    setBalanceInfo({
                        current: data.balance || 0,
                        required: selectedProduct.selling_price || selectedProduct.price
                    });
                    setShowBalanceModal(true);
                } else {
                    alert(`Gagal: ${data.error || 'Terjadi kesalahan'}`);
                }
            }
        } catch (error) {
            alert('Terjadi kesalahan saat memproses transaksi');
        } finally {
            setBuying(null);
        }
    };

    if (!selectedProvider) {
        return (
            <div className="min-h-screen bg-black text-white pb-24 font-sans">
                <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-white/5 px-6 pt-8 pb-4 flex items-center gap-4">
                    <Link href="/" className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-white hover:bg-[#bef264] hover:text-black transition-colors">
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-lg font-bold">Paket Data</h1>
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

    // Step 2: Category Selection
    if (!selectedCategory) {
        return (
            <div className="min-h-screen bg-black text-white pb-24 font-sans">
                <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-white/5 px-6 pt-8 pb-4 flex items-center gap-4">
                    <button
                        onClick={() => {
                            // If came via URL param, navigate to provider page
                            const brandParam = searchParams.get('brand');
                            if (brandParam) {
                                router.push(`/provider/${brandParam.toLowerCase()}`);
                            } else {
                                setSelectedProvider(null);
                                setProducts([]);
                            }
                        }}
                        className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-white hover:bg-[#bef264] hover:text-black transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold">Data {selectedProvider.name}</h1>
                        <p className="text-xs text-neutral-500">Pilih jenis paket</p>
                    </div>
                </header>

                <div className="px-6 py-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-[#bef264]" />
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-neutral-500 text-sm">Tidak ada paket tersedia</p>
                        </div>
                    ) : (
                        <>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4">Pilih Kategori</h3>
                            <div className="grid grid-cols-1 gap-3">
                                {categories.map((cat) => (
                                    <motion.div
                                        key={cat.originalType}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setSelectedCategory(cat.originalType)}
                                        className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 cursor-pointer hover:border-[#bef264] hover:bg-neutral-800 transition-all group flex items-center gap-4"
                                    >
                                        {/* Provider Logo */}
                                        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-[#bef264] p-1">
                                            <img src={selectedProvider.image} alt={selectedProvider.name} className="w-full h-full object-cover rounded-full" />
                                        </div>
                                        {/* Text */}
                                        <div className="flex-1">
                                            <span className="font-bold text-white group-hover:text-[#bef264] text-sm">{cat.displayName}</span>
                                            <p className="text-xs text-neutral-500">
                                                {products.filter(p => p.type === cat.originalType).length} produk
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }

    // Step 3: Products with input number
    return (
        <div className="min-h-screen bg-black text-white pb-24 font-sans">
            <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-white/5 px-6 pt-8 pb-4 flex items-center gap-4">
                <button
                    onClick={() => {
                        setSelectedCategory(null);
                        setPhoneNumber('');
                        setSelectedDayFilter(null);
                    }}
                    className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-white hover:bg-[#bef264] hover:text-black transition-colors"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-lg font-bold">
                        {categories.find(c => c.originalType === selectedCategory)?.displayName || selectedCategory}
                    </h1>
                    <p className="text-xs text-neutral-500">{selectedProvider.name} • Masukkan nomor</p>
                </div>
            </header>

            <div className="px-6 py-6">
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 mb-4">
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

                {/* Day Filter Tabs */}
                <div className="flex justify-center gap-2 mb-6 overflow-x-auto pb-1">
                    {availableFilters.map((filter) => (
                        <button
                            key={filter.id}
                            onClick={() => setSelectedDayFilter(
                                selectedDayFilter === filter.id ? null : filter.id
                            )}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedDayFilter === filter.id
                                ? 'bg-[#bef264] text-black'
                                : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:border-neutral-700'
                                }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>

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
                                        <Wifi className="w-5 h-5 text-white" />
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

            {/* Insufficient Balance Modal */}
            <InsufficientBalanceModal
                isOpen={showBalanceModal}
                onClose={() => setShowBalanceModal(false)}
                currentBalance={balanceInfo.current}
                requiredAmount={balanceInfo.required}
            />
        </div>
    );
}

export default function DataPage() {
    return (
        <Suspense fallback={<div className='min-h-screen bg-black flex items-center justify-center'><Loader2 className='w-8 h-8 animate-spin text-[#bef264]' /></div>}>
            <DataPageContent />
        </Suspense>
    );
}
