import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const DIGIFLAZZ_URL = "https://api.digiflazz.com/v1/price-list";

// Simple in-memory cache - stores ONLY raw Digiflazz data
interface CacheEntry {
    data: unknown;
    timestamp: number;
}

const cache: Record<string, CacheEntry> = {};
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Helper to merge custom prices with products AND apply Reseller Discount
async function mergeCustomPrices(products: any[], userLevel: string = 'member') {
    const { db, customPrices } = await import("@/lib/db");
    const savedPrices = await db.query.customPrices.findMany();
    const priceMap = new Map(savedPrices.map(p => [p.skuCode, p]));

    return products.map((product: any) => {
        let finalPrice = product.price; // Start with provider price
        let _customPrice = false;

        // 1. Check for Admin Custom Price
        const custom = priceMap.get(product.buyer_sku_code);
        if (custom && custom.isActive) {
            finalPrice = custom.sellingPrice;
            _customPrice = true;
        } else {
            // Default Margin logic (fallback if no custom price set)
            // Ideally we should have a default margin conf, but for now lets assume price from Digiflazz is Modal, we need to add Margin
            // Since we don't have global margin logic here yet, we trust the `price` field from Digiflazz is actually the buying price.
            // But frontend usually adds margin if not set.
            // Let's keep existing logic: If no custom price, we usually rely on Frontend to add default margin OR we send the raw price.
            // But for Smart Pricing, we want to control it here.

            // For now, let's just modify the finalPrice if it was set by customPrice, OR if we want to apply discount to everything.
            // To be safe, let's only apply discount to the 'selling_price' if it exists, or the raw price.

            // Existing logic didn't modify price if no custom price. 
            // product.price from Digiflazz is the "Modal". 
            // If we don't return selling_price, frontend adds margin.
        }

        // 2. Apply Reseller Discount
        // Rule: If Reseller, get Rp 150 cheaper (or whatever amount)
        // For this Phase, let's say Reseller gets Rp 200 discount from the *Selling Price*
        // But if there is no selling price derived here, the frontend adds it.
        // We should send a `user_level` or `discount` field to frontend? 
        // Better: Calculate 'selling_price' here for everyone if possible.

        // Let's stick to the plan: "Apply discount/margin based on level"
        // We'll calculate a 'selling_price' for EVERY product here.

        // If Custom Price is set, use it.
        // If NOT, use Digiflazz Price + Default Margin (2000).
        if (!_customPrice) {
            finalPrice = product.price + 2000; // Default Global Margin
        }

        // If Reseller, subtract discount
        if (userLevel === 'reseller') {
            finalPrice -= 200; // Reseller cheaper by 200
        }

        // If VIP (Future proofing)
        if (userLevel === 'vip') {
            finalPrice -= 500;
        }

        return {
            ...product,
            selling_price: finalPrice, // Explicitly send selling_price
            _customPrice,
            _userLevel: userLevel
        };
    });
}

export async function POST(request: NextRequest) {
    try {
        // Fetch User Session for Smart Pricing
        const { auth } = await import("@/lib/auth");
        const { headers } = await import("next/headers");
        const session = await auth.api.getSession({
            headers: await headers()
        });

        // Default level is member if not logged in
        const userLevel = (session?.user as any)?.level || 'member';

        const { cmd = "prepaid", force = false } = await request.json();
        const cacheKey = `pricelist-${cmd}`;

        // Check cache first for RAW Digiflazz data (unless force is true)
        const cached = cache[cacheKey];
        if (!force && cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            console.log("Returning cached price list (with fresh custom prices)");
            // Always merge fresh custom prices
            const mergedData = await mergeCustomPrices(cached.data as any[], userLevel);
            return NextResponse.json({
                success: true,
                data: mergedData,
                cached: true,
                userLevel // Debug info
            });
        }

        const username = process.env.DIGIFLAZZ_USERNAME;
        const apiKey = process.env.DIGIFLAZZ_API_KEY;

        if (!username || !apiKey) {
            return NextResponse.json(
                { success: false, error: "Digiflazz credentials not configured" },
                { status: 500 }
            );
        }

        // Generate signature: md5(username + apiKey + "pricelist")
        const sign = crypto
            .createHash("md5")
            .update(username + apiKey + "pricelist")
            .digest("hex");

        const response = await fetch(DIGIFLAZZ_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                cmd,
                username,
                sign,
            }),
        });

        const data = await response.json();

        if (Array.isArray(data.data)) {
            // Cache ONLY raw Digiflazz data (without custom prices)
            cache[cacheKey] = {
                data: data.data,
                timestamp: Date.now(),
            };
            console.log(`Cached ${data.data.length} raw products for ${cmd}`);

            // Merge custom prices for response
            const mergedData = await mergeCustomPrices(data.data, userLevel);

            return NextResponse.json({
                success: true,
                data: mergedData,
                cached: false,
                userLevel
            });
        }

        return NextResponse.json({
            success: true,
            data: data.data || [],
        });
    } catch (error) {
        console.error("Digiflazz price-list error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch price list" },
            { status: 500 }
        );
    }
}

// GET endpoint to check cache status
export async function GET() {
    const cacheKeys = Object.keys(cache);
    const cacheStatus = cacheKeys.map((key) => ({
        key,
        age: Math.round((Date.now() - cache[key].timestamp) / 1000) + "s",
        itemCount: Array.isArray(cache[key].data) ? (cache[key].data as unknown[]).length : 0,
    }));

    return NextResponse.json({
        cacheStatus,
        cacheDuration: CACHE_DURATION / 1000 + "s",
    });
}
