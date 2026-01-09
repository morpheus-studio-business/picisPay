import { NextRequest, NextResponse } from "next/server";
import { db, user, balanceHistory } from "@/lib/db";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
    try {
        // Check admin auth
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user || (session.user as any).role !== 'admin') {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { userId, amount, type, reason } = await request.json();

        // Validate inputs
        if (!userId || !amount || !type || !reason) {
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 }
            );
        }

        if (type !== 'add' && type !== 'subtract') {
            return NextResponse.json(
                { success: false, error: "Invalid type (must be 'add' or 'subtract')" },
                { status: 400 }
            );
        }

        const adjustAmount = Math.abs(parseInt(amount));
        if (isNaN(adjustAmount) || adjustAmount <= 0) {
            return NextResponse.json(
                { success: false, error: "Invalid amount" },
                { status: 400 }
            );
        }

        // Get current user
        const targetUser = await db.query.user.findFirst({
            where: eq(user.id, userId)
        });

        if (!targetUser) {
            return NextResponse.json(
                { success: false, error: "User not found" },
                { status: 404 }
            );
        }

        // Calculate new balance
        const balanceBefore = targetUser.balance || 0;
        let balanceAfter: number;

        if (type === 'add') {
            balanceAfter = balanceBefore + adjustAmount;
        } else {
            balanceAfter = balanceBefore - adjustAmount;
            if (balanceAfter < 0) {
                return NextResponse.json(
                    { success: false, error: "Insufficient balance for subtraction" },
                    { status: 400 }
                );
            }
        }

        // Update user balance
        await db.update(user)
            .set({
                balance: balanceAfter,
                updatedAt: new Date()
            })
            .where(eq(user.id, userId));

        // Create audit log
        await db.insert(balanceHistory).values({
            userId: userId,
            type: type === 'add' ? 'manual_add' : 'manual_subtract',
            amount: type === 'add' ? adjustAmount : -adjustAmount,
            balanceBefore: balanceBefore,
            balanceAfter: balanceAfter,
            referenceId: `ADMIN-${Date.now()}`,
            description: `[Admin: ${session.user.name || session.user.email}] ${reason}`
        });

        return NextResponse.json({
            success: true,
            data: {
                userId,
                balanceBefore,
                balanceAfter,
                adjustment: type === 'add' ? adjustAmount : -adjustAmount
            }
        });

    } catch (error) {
        console.error("Balance adjustment error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to adjust balance" },
            { status: 500 }
        );
    }
}
