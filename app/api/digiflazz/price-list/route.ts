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

// Helper to merge custom prices with products
async function mergeCustomPrices(products: any[]) {
    const { db, customPrices } = await import("@/lib/db");
    const savedPrices = await db.query.customPrices.findMany();
    const priceMap = new Map(savedPrices.map(p => [p.skuCode, p]));

    return products.map((product: any) => {
        const custom = priceMap.get(product.buyer_sku_code);
        if (custom && custom.isActive) {
            return {
                ...product,
                selling_price: custom.sellingPrice,
                _customPrice: true
            };
        }
        return product;
    });
}

export async function POST(request: NextRequest) {
    try {
        const { cmd = "prepaid", force = false } = await request.json();
        const cacheKey = `pricelist-${cmd}`;

        // Check cache first for RAW Digiflazz data (unless force is true)
        const cached = cache[cacheKey];
        if (!force && cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            console.log("Returning cached price list (with fresh custom prices)");
            // Always merge fresh custom prices
            const mergedData = await mergeCustomPrices(cached.data as any[]);
            return NextResponse.json({
                success: true,
                data: mergedData,
                cached: true,
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
            const mergedData = await mergeCustomPrices(data.data);

            return NextResponse.json({
                success: true,
                data: mergedData,
                cached: false,
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
