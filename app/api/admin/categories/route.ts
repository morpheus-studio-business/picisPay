import { NextRequest, NextResponse } from "next/server";
import { db, categoryMappings } from "@/lib/db";
import { eq, and } from "drizzle-orm";

// GET - Fetch all category mappings
export async function GET() {
    try {
        const mappings = await db.query.categoryMappings.findMany({
            orderBy: (cm, { asc }) => [asc(cm.brand), asc(cm.priority)],
        });

        return NextResponse.json({ success: true, data: mappings });
    } catch (error) {
        console.error("Failed to fetch category mappings:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch category mappings" },
            { status: 500 }
        );
    }
}

// POST - Create or update category mapping
export async function POST(request: NextRequest) {
    try {
        const { originalType, brand, customName, isHidden, priority } = await request.json();

        if (!originalType || !brand || !customName) {
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Check if mapping already exists
        const existing = await db.query.categoryMappings.findFirst({
            where: and(
                eq(categoryMappings.originalType, originalType),
                eq(categoryMappings.brand, brand)
            ),
        });

        if (existing) {
            // Update existing
            await db.update(categoryMappings)
                .set({
                    customName,
                    isHidden: isHidden ?? false,
                    priority: priority ?? 0,
                    updatedAt: new Date(),
                })
                .where(eq(categoryMappings.id, existing.id));

            return NextResponse.json({ success: true, message: "Category updated" });
        } else {
            // Create new
            await db.insert(categoryMappings).values({
                originalType,
                brand,
                customName,
                isHidden: isHidden ?? false,
                priority: priority ?? 0,
            });

            return NextResponse.json({ success: true, message: "Category created" });
        }
    } catch (error) {
        console.error("Failed to save category mapping:", error);
        return NextResponse.json(
            { success: false, error: "Failed to save category mapping" },
            { status: 500 }
        );
    }
}

// DELETE - Delete category mapping
export async function DELETE(request: NextRequest) {
    try {
        const { id } = await request.json();

        if (!id) {
            return NextResponse.json(
                { success: false, error: "Missing id" },
                { status: 400 }
            );
        }

        await db.delete(categoryMappings).where(eq(categoryMappings.id, id));

        return NextResponse.json({ success: true, message: "Category deleted" });
    } catch (error) {
        console.error("Failed to delete category mapping:", error);
        return NextResponse.json(
            { success: false, error: "Failed to delete category mapping" },
            { status: 500 }
        );
    }
}
