import { NextRequest, NextResponse } from "next/server";
import { db, brands } from "@/lib/db";
import { auth } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";
import { headers } from "next/headers";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get("category");

        let query = db.select().from(brands).orderBy(desc(brands.priority));

        const allBrands = await query;

        // Filter by category if provided
        const filteredBrands = category && category !== "all"
            ? allBrands.filter(b => b.category === category)
            : allBrands;

        return NextResponse.json({ success: true, data: filteredBrands });
    } catch (error) {
        console.error("Brands fetch error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch brands" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user || (session.user as any).role !== 'admin') {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { id, name, category, iconHome, iconDetail, color, isActive, priority } = body;

        if (!id || !name || !category) {
            return NextResponse.json(
                { success: false, error: "ID, name, and category are required" },
                { status: 400 }
            );
        }

        // Check if brand already exists
        const existing = await db.query.brands.findFirst({
            where: eq(brands.id, id)
        });

        if (existing) {
            // Update existing
            await db.update(brands)
                .set({
                    name,
                    category,
                    iconHome: iconHome || null,
                    iconDetail: iconDetail || null,
                    color: color || null,
                    isActive: isActive ?? true,
                    priority: priority ?? 0,
                    updatedAt: new Date()
                })
                .where(eq(brands.id, id));
        } else {
            // Create new
            await db.insert(brands).values({
                id,
                name,
                category,
                iconHome: iconHome || null,
                iconDetail: iconDetail || null,
                color: color || null,
                isActive: isActive ?? true,
                priority: priority ?? 0,
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Brand save error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to save brand" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user || (session.user as any).role !== 'admin') {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { success: false, error: "Brand ID required" },
                { status: 400 }
            );
        }

        await db.delete(brands).where(eq(brands.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Brand delete error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to delete brand" },
            { status: 500 }
        );
    }
}
