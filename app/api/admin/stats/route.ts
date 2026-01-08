import { NextResponse } from "next/server";
import { db, user, topups, transactions } from "@/lib/db";
import { count, sum, eq, sql } from "drizzle-orm";

export async function GET() {
    try {
        // Get total users
        const [userCount] = await db.select({ count: count() }).from(user);

        // Get total topups and pending count
        const [topupStats] = await db.select({
            total: count(),
            pending: sql<number>`COUNT(CASE WHEN status = 'pending' THEN 1 END)`,
        }).from(topups);

        // Get total transactions and today's count
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [transactionStats] = await db.select({
            total: count(),
            today: sql<number>`COUNT(CASE WHEN created_at >= ${today.toISOString()} THEN 1 END)`,
        }).from(transactions);

        // Calculate total revenue (sum of completed topups)
        const [revenueResult] = await db.select({
            total: sql<number>`COALESCE(SUM(amount), 0)`,
        }).from(topups).where(eq(topups.status, "completed"));

        return NextResponse.json({
            success: true,
            data: {
                totalUsers: userCount?.count || 0,
                totalTopups: topupStats?.total || 0,
                pendingTopups: topupStats?.pending || 0,
                totalTransactions: transactionStats?.total || 0,
                todayTransactions: transactionStats?.today || 0,
                totalRevenue: revenueResult?.total || 0,
            },
        });
    } catch (error) {
        console.error("Admin stats error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch stats" },
            { status: 500 }
        );
    }
}
