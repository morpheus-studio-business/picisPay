import { NextRequest, NextResponse } from "next/server";
import { db, customPrices } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

// GET all custom prices
export async function GET() {
    try {
        const prices = await db.query.customPrices.findMany({
            orderBy: (customPrices, { asc }) => [asc(customPrices.category), asc(customPrices.brand)]
        });

        return NextResponse.json({ success: true, data: prices });
    } catch (error) {
        console.error("Fetch prices error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch" }, { status: 500 });
    }
}

// POST create or update price
export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });

        // Check admin role
        if (!session?.user || (session.user as any).role !== 'admin') {
            return NextResponse.json({ success: false, error: "Unauthorized - Admin only" }, { status: 401 });
        }

        const { skuCode, productName, brand, category, basePrice, sellingPrice, isActive } = await request.json();

        if (!skuCode || !sellingPrice) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        // Check if exists
        const existing = await db.query.customPrices.findFirst({
            where: eq(customPrices.skuCode, skuCode)
        });

        if (existing) {
            // Update
            await db.update(customPrices).set({
                sellingPrice,
                isActive: isActive ?? true,
                updatedAt: new Date()
            }).where(eq(customPrices.skuCode, skuCode));
        } else {
            // Insert
            await db.insert(customPrices).values({
                skuCode,
                productName,
                brand,
                category,
                basePrice,
                sellingPrice,
                isActive: isActive ?? true
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Save price error:", error);
        return NextResponse.json({ success: false, error: "Failed to save" }, { status: 500 });
    }
}
