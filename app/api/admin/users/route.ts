import { NextResponse } from "next/server";
import { db, user } from "@/lib/db";
import { desc } from "drizzle-orm";

export async function GET() {
    try {
        const allUsers = await db.select().from(user).orderBy(desc(user.createdAt));

        return NextResponse.json({
            success: true,
            data: allUsers,
        });
    } catch (error) {
        console.error("Admin users error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch users" },
            { status: 500 }
        );
    }
}
