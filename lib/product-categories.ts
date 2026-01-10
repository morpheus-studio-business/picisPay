/**
 * Centralized Product Category Configuration
 * 
 * This file acts as a "translation layer" between Digiflazz's messy data
 * and our clean UI categories.
 */

// ============================================
// BRAND WHITELISTS
// ============================================

export const STREAMING_BRANDS = [
    'VIDIO',
    'WETV',
    'VIU',
    'NETFLIX',
    'SPOTIFY',
    'YOUTUBE',
    'DISNEY',
    'HBO',
    'PRIME VIDEO',
    'IQIYI',
    'GENFLIX',
    'VISION+'
];

// Streaming brands that are voucher-type (get codes, not direct top-up)
export const STREAMING_VOUCHER_BRANDS = [
    'SPOTIFY',
    'VIU',
    'NETFLIX',
    'YOUTUBE',
    'DISNEY',
    'HBO',
    'PRIME VIDEO',
    'IQIYI',
    'GENFLIX',
    'VISION+'
];

// Streaming brands that are direct top-up (input HP/ID)
export const STREAMING_DIRECT_BRANDS = ['VIDIO', 'WETV'];

export const TV_BRANDS = [
    'NEX PARABOLA',
    'K-VISION',
    'GOL',
    'TRANSVISION',
    'MATRIX',
    'KAWAN KVISION',
    'JAWARA VISION'
];

export const EWALLET_BRANDS = [
    'GOPAY',
    'OVO',
    'DANA',
    'SHOPEEPAY',
    'SHOPEE PAY',
    'LINKAJA',
    'LINK AJA',
    'ISAKU',
    'SAKUKU'
];

export const CELLULAR_BRANDS = [
    'TELKOMSEL',
    'INDOSAT',
    'XL',
    'AXIS',
    'TRI',
    'THREE',
    'SMARTFREN',
    'BY.U'
];

// ============================================
// CATEGORY CLASSIFICATION
// ============================================

export type ProductCategory =
    | 'Streaming'
    | 'TV Kabel'
    | 'E-Wallet'
    | 'Games'
    | 'PLN'
    | 'Pulsa'
    | 'Data'
    | 'Voucher Belanja'
    | 'Voucher Internet'
    | 'Lainnya';

export interface Product {
    product_name: string;
    buyer_sku_code: string;
    price: number;
    selling_price?: number;
    seller_name?: string;
    brand: string;
    category: string;
    type?: string;
    desc?: string;
    buyer_product_status?: boolean;
    seller_product_status?: boolean;
}

/**
 * Classify a Digiflazz product into our custom category
 */
export function getProductCategory(product: Product): ProductCategory {
    const brand = product.brand.toUpperCase();
    const rawCat = product.category.toUpperCase();

    // 1. PLN - Simple check
    if (rawCat.includes('PLN')) return 'PLN';

    // 2. Pulsa - Simple check
    if (rawCat.includes('PULSA')) return 'Pulsa';

    // 3. Data - Simple check
    if (rawCat.includes('DATA') && !rawCat.includes('VOUCHER')) return 'Data';

    // 4. E-Wallet - Brand whitelist
    if (EWALLET_BRANDS.some(b => brand.includes(b))) return 'E-Wallet';
    if (rawCat.includes('E-MONEY') || rawCat.includes('EMONEY')) return 'E-Wallet';

    // 5. TV Kabel - Brand whitelist
    if (TV_BRANDS.some(b => brand.includes(b))) return 'TV Kabel';

    // 6. Streaming - Brand whitelist BUT exclude Voucher category
    if (STREAMING_BRANDS.some(b => brand.includes(b))) {
        if (!rawCat.includes('VOUCHER') && !rawCat.includes('GAME')) {
            return 'Streaming';
        }
        // If it's Voucher category, fall through to Voucher Belanja
    }

    // 7. Games - Category check
    if (rawCat.includes('GAME')) return 'Games';

    // 8. Voucher - Split into Internet vs Belanja
    if (rawCat.includes('VOUCHER')) {
        const isCellular = CELLULAR_BRANDS.some(b => brand.includes(b));
        if (isCellular) return 'Voucher Internet';
        return 'Voucher Belanja';
    }

    // 9. Fallback
    return 'Lainnya';
}

/**
 * Filter products for Streaming page
 */
export function filterStreamingProducts(products: Product[]): Product[] {
    return products.filter(p => {
        const brand = p.brand.toUpperCase();
        const rawCat = p.category.toUpperCase();

        const isStreamingBrand = STREAMING_BRANDS.some(b => brand.includes(b));
        const isVoucher = rawCat.includes('VOUCHER');
        const isGame = rawCat.includes('GAME');

        return isStreamingBrand && !isVoucher && !isGame && p.buyer_product_status && p.seller_product_status;
    });
}

/**
 * Filter products for TV Kabel page
 */
export function filterTVProducts(products: Product[]): Product[] {
    return products.filter(p => {
        const brand = p.brand.toUpperCase();
        const rawCat = p.category.toUpperCase();

        const isTVBrand = TV_BRANDS.some(b => brand.includes(b));
        const isGame = rawCat.includes('GAME');

        return isTVBrand && !isGame && p.buyer_product_status && p.seller_product_status;
    });
}

/**
 * Filter products for Voucher Belanja page (ONLY retail vouchers: Alfamart, Indomaret, etc.)
 * Excludes: Cellular, Games, Streaming, Platform Vouchers
 */
export function filterVoucherBelanjaProducts(products: Product[]): Product[] {
    return products.filter(p => {
        const brand = p.brand.toUpperCase();
        const rawCat = p.category.toUpperCase();

        const isVoucher = rawCat.includes('VOUCHER');
        const isCellular = CELLULAR_BRANDS.some(b => brand.includes(b));
        const isGame = rawCat.includes('GAME') || brand.includes('GAME');
        const isStreaming = STREAMING_BRANDS.some(b => brand.includes(b));
        const isPlatformVoucher = PLATFORM_VOUCHER_BRANDS.some(b => brand.includes(b));

        return isVoucher && !isCellular && !isGame && !isStreaming && !isPlatformVoucher && p.buyer_product_status && p.seller_product_status;
    });
}

/**
 * Filter products for E-Wallet page
 */
export function filterEWalletProducts(products: Product[]): Product[] {
    return products.filter(p => {
        const brand = p.brand.toUpperCase();
        const rawCat = p.category.toUpperCase();

        const isEWallet = EWALLET_BRANDS.some(b => brand.includes(b)) ||
            rawCat.includes('E-MONEY') ||
            rawCat.includes('EMONEY');

        return isEWallet && p.buyer_product_status && p.seller_product_status;
    });
}

/**
 * Filter products for Streaming Voucher page (Spotify, Viu, Netflix vouchers, etc.)
 * These are voucher-type products (get codes, not direct top-up)
 */
export function filterStreamingVouchers(products: Product[]): Product[] {
    return products.filter(p => {
        const brand = p.brand.toUpperCase();
        const rawCat = p.category.toUpperCase();

        // Must be a streaming brand
        const isStreamingBrand = STREAMING_BRANDS.some(b => brand.includes(b));
        if (!isStreamingBrand) return false;

        // Exclude direct streaming brands (Vidio, WeTV direct go to /streaming/direct)
        // But include their VOUCHER versions
        const isVoucherCategory = rawCat.includes('VOUCHER');
        const isDirectBrand = STREAMING_DIRECT_BRANDS.some(b => brand.includes(b));

        // If it's a direct brand, only include if it's in Voucher category
        if (isDirectBrand && !isVoucherCategory) return false;

        return p.buyer_product_status && p.seller_product_status;
    });
}

/**
 * Filter products for Games page (ALL games - for legacy)
 */
export function filterGamesProducts(products: Product[]): Product[] {
    return products.filter(p => {
        const rawCat = p.category.toUpperCase();
        return rawCat.includes('GAME') && p.buyer_product_status && p.seller_product_status;
    });
}

// ============================================
// GAMES SUB-CATEGORIES
// ============================================

// Platform vouchers (NOT game-specific, but gaming platforms)
export const PLATFORM_VOUCHER_BRANDS = [
    'GOOGLE PLAY',
    'GOOGLE PLAY INDONESIA',
    'GOOGLE PLAY US',
    'XBOX',
    'PLAYSTATION',
    'PSN',
    'NINTENDO',
    'NINTENDO ESHOP',
    'STEAM WALLET',
    'STEAM',
    'ITUNES',
    'APPLE',
    'APP STORE'
];

/**
 * Filter products for Games Top Up (Direct - input User ID)
 * These are in "Games" category and typically require user ID input
 */
export function filterGamesTopUp(products: Product[]): Product[] {
    return products.filter(p => {
        const brand = p.brand.toUpperCase();
        const rawCat = p.category.toUpperCase();
        const name = p.product_name.toUpperCase();

        // Must be Games category
        if (!rawCat.includes('GAME')) return false;

        // Exclude platform vouchers (they go to Voucher Platform)
        const isPlatformVoucher = PLATFORM_VOUCHER_BRANDS.some(b => brand.includes(b));
        if (isPlatformVoucher) return false;

        // Check if product status is active
        return p.buyer_product_status && p.seller_product_status;
    }).map(p => {
        // Special Handling: Split Mobile Legends Global
        if (p.brand.toUpperCase() === 'MOBILE LEGENDS' && p.product_name.toUpperCase().includes('GLOBAL')) {
            return { ...p, brand: 'MOBILE LEGENDS GLOBAL' };
        }
        return p;
    });
}

/**
 * Filter products for Voucher Games (game-specific voucher codes)
 * These are in "Voucher" category but game-related brands
 */
export function filterVoucherGames(products: Product[]): Product[] {
    return products.filter(p => {
        const brand = p.brand.toUpperCase();
        const rawCat = p.category.toUpperCase();
        const name = p.product_name.toUpperCase();

        // Must be Voucher category (NOT Games category - those go to Top Up)
        if (!rawCat.includes('VOUCHER')) return false;

        // Exclude cellular providers
        const isCellular = CELLULAR_BRANDS.some(b => brand.includes(b));
        if (isCellular) return false;

        // Exclude platform vouchers (they go to Voucher Platform)
        const isPlatformVoucher = PLATFORM_VOUCHER_BRANDS.some(b => brand.includes(b));
        if (isPlatformVoucher) return false;

        // Exclude streaming brands
        const isStreaming = STREAMING_BRANDS.some(b => brand.includes(b));
        if (isStreaming) return false;

        // Exclude retail vouchers (Alfamart, Indomaret, MAP, Tokopedia, Traveloka)
        const retailBrands = ['ALFAMART', 'INDOMARET', 'MAP', 'TOKOPEDIA', 'TRAVELOKA', 'GRAB', 'GOJEK', 'SHOPEE'];
        const isRetail = retailBrands.some(b => brand.includes(b));
        if (isRetail) return false;

        // Check if product status is active
        return p.buyer_product_status && p.seller_product_status;
    });
}

/**
 * Filter products for Voucher Platform (Google Play, Xbox, PlayStation, Steam, etc.)
 */
export function filterVoucherPlatform(products: Product[]): Product[] {
    return products.filter(p => {
        const brand = p.brand.toUpperCase();

        // Must be a platform voucher brand
        const isPlatformVoucher = PLATFORM_VOUCHER_BRANDS.some(b => brand.includes(b));
        if (!isPlatformVoucher) return false;

        // Check if product status is active
        return p.buyer_product_status && p.seller_product_status;
    });
}

