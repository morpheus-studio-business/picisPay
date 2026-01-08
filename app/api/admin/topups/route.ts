import { NextResponse } from "next/server";
import { db, topups } from "@/lib/db";
import { desc } from "drizzle-orm";

export async function GET() {
    try {
        const allTopups = await db.select().from(topups).orderBy(desc(topups.createdAt));

        return NextResponse.json({
            success: true,
            data: allTopups,
        });
    } catch (error) {
        console.error("Admin topups error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch topups" },
            { status: 500 }
        );
    }
}
