import { NextRequest, NextResponse } from "next/server";
import { db, brands } from "@/lib/db";
import { eq, desc, and } from "drizzle-orm";

// Public API for fetching brands (no auth required)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get("category");
        const activeOnly = searchParams.get("active") !== "false"; // Default to active only

        const allBrands = await db.select()
            .from(brands)
            .where(activeOnly ? eq(brands.isActive, true) : undefined)
            .orderBy(desc(brands.priority));

        // Filter by category if provided
        const filteredBrands = category && category !== "all"
            ? allBrands.filter(b => b.category === category)
            : allBrands;

        return NextResponse.json({
            success: true,
            data: filteredBrands
        });
    } catch (error) {
        console.error("Brands fetch error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch brands" },
            { status: 500 }
        );
    }
}
