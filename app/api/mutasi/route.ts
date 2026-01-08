import { NextRequest, NextResponse } from "next/server";
import { db, balanceHistory } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const history = await db.query.balanceHistory.findMany({
            where: eq(balanceHistory.userId, session.user.id),
            orderBy: [desc(balanceHistory.createdAt)],
            limit: 50
        });

        return NextResponse.json({
            success: true,
            data: history.map(h => ({
                ...h,
                createdAt: h.createdAt.toISOString()
            }))
        });

    } catch (error) {
        console.error("Mutasi fetch error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch" }, { status: 500 });
    }
}
