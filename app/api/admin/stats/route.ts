import { NextResponse } from "next/server";
import { db, user, topups, transactions } from "@/lib/db";
import { count, sum, eq, sql, desc, gte } from "drizzle-orm";

export async function GET() {
    try {
        // Get total users and total balance
        const [userStats] = await db.select({
            count: count(),
            totalBalance: sql<number>`COALESCE(SUM(balance), 0)`,
        }).from(user);

        // Get total topups and pending count
        const [topupStats] = await db.select({
            total: count(),
            pending: sql<number>`COUNT(CASE WHEN status = 'pending' THEN 1 END)`,
        }).from(topups);

        // Get today's date range
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayISO = today.toISOString();

        // Get total transactions and today's count
        const [transactionStats] = await db.select({
            total: count(),
            today: sql<number>`COUNT(CASE WHEN created_at >= ${todayISO} THEN 1 END)`,
        }).from(transactions);

        // Calculate total revenue (sum of completed topups) and today's revenue
        const [revenueResult] = await db.select({
            total: sql<number>`COALESCE(SUM(CASE WHEN status IN ('completed', 'success') THEN amount + COALESCE(fee, 0) END), 0)`,
            today: sql<number>`COALESCE(SUM(CASE WHEN status IN ('completed', 'success') AND created_at >= ${todayISO} THEN amount + COALESCE(fee, 0) END), 0)`,
        }).from(topups);

        // Get recent 5 topups
        const recentTopups = await db.select({
            id: topups.id,
            amount: topups.amount,
            fee: topups.fee,
            status: topups.status,
            paymentMethod: topups.paymentMethod,
            createdAt: topups.createdAt,
        })
            .from(topups)
            .orderBy(desc(topups.createdAt))
            .limit(5);

        // Get recent 5 transactions
        const recentTransactions = await db.select({
            id: transactions.id,
            productName: transactions.productName,
            customerNo: transactions.customerNo,
            price: transactions.price,
            status: transactions.status,
            createdAt: transactions.createdAt,
        })
            .from(transactions)
            .orderBy(desc(transactions.createdAt))
            .limit(5);

        // Get last 7 days transaction data for chart
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);

            last7Days.push({
                date: date.toISOString().split('T')[0],
                label: date.toLocaleDateString('id-ID', { weekday: 'short' }),
            });
        }

        // Query transaction counts per day
        const chartData = await Promise.all(
            last7Days.map(async (day) => {
                const dayStart = new Date(day.date);
                const dayEnd = new Date(day.date);
                dayEnd.setDate(dayEnd.getDate() + 1);

                const [result] = await db.select({
                    count: count(),
                    revenue: sql<number>`COALESCE(SUM(price), 0)`,
                }).from(transactions)
                    .where(sql`created_at >= ${dayStart.toISOString()} AND created_at < ${dayEnd.toISOString()}`);

                return {
                    date: day.date,
                    label: day.label,
                    transactions: result?.count || 0,
                    revenue: result?.revenue || 0,
                };
            })
        );

        return NextResponse.json({
            success: true,
            data: {
                totalUsers: userStats?.count || 0,
                totalUserBalance: userStats?.totalBalance || 0,
                totalTopups: topupStats?.total || 0,
                pendingTopups: topupStats?.pending || 0,
                totalTransactions: transactionStats?.total || 0,
                todayTransactions: transactionStats?.today || 0,
                totalRevenue: revenueResult?.total || 0,
                todayRevenue: revenueResult?.today || 0,
                recentTopups,
                recentTransactions,
                chartData,
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
