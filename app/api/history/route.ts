import { NextResponse } from "next/server";
import { db, topups, transactions } from "@/lib/db";
import { auth } from "@/lib/auth"; // We might need to handle auth differently if using client
import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function GET(req: Request) {
    try {
        // Simple header check for better-auth session access if needed, 
        // or just use the session passed from client if using client-side fetch.
        // For better-auth in API routes, we need to use `auth.api.getSession`.
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        // Fetch Topups
        const userTopups = await db.select().from(topups)
            .where(eq(topups.userId, session.user.id))
            .orderBy(desc(topups.createdAt));

        // Fetch Transactions
        const userTransactions = await db.select().from(transactions)
            .where(eq(transactions.userId, session.user.id))
            .orderBy(desc(transactions.createdAt));

        // Combine and normalize
        const history = [
            ...userTopups.map(t => ({
                id: t.id,
                type: 'topup',
                title: 'Top Up Saldo',
                description: t.paymentMethod ? `via ${t.paymentMethod.toUpperCase()}` : 'Top Up',
                amount: t.amount,
                status: t.status,
                date: t.createdAt,
                details: t
            })),
            ...userTransactions.map(t => ({
                id: t.id,
                type: 'purchase',
                title: t.productName || 'Pembelian Produk',
                description: t.customerNo,
                amount: t.price,
                status: t.status,
                date: t.createdAt,
                details: t
            }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return NextResponse.json({
            success: true,
            data: history
        });

    } catch (error) {
        console.error("History fetch error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch history" },
            { status: 500 }
        );
    }
}
