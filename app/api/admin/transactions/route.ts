import { NextResponse } from "next/server";
import { db, transactions } from "@/lib/db";
import { desc } from "drizzle-orm";

export async function GET() {
    try {
        const allTransactions = await db.select().from(transactions).orderBy(desc(transactions.createdAt));

        return NextResponse.json({
            success: true,
            data: allTransactions,
        });
    } catch (error) {
        console.error("Admin transactions error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch transactions" },
            { status: 500 }
        );
    }
}
