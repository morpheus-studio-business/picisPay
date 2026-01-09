import { NextRequest, NextResponse } from "next/server";
import { db, topups, user, balanceHistory, notifications } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
    try {
        // Pakasir Webhook Validation
        // Usually checks IP whitelisting or secret token if provided
        // For now trusting the payload structure, but in prod add security check

        const body = await request.json();

        // Payload structure based on typical webhook
        // { order_id, amount, status, ... }
        // Pakasir docs state: verify amount and order_id

        const { order_id, status, amount, transaction_id } = body;

        console.log("Pakasir Topup Webhook:", body);

        if (!order_id || !status) {
            return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });
        }

        // Find Topup Record
        const topupRecord = await db.query.topups.findFirst({
            where: eq(topups.orderId, order_id)
        });

        if (!topupRecord) {
            console.error("Topup Order Not Found:", order_id);
            return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
        }

        if (topupRecord.status === 'success') {
            return NextResponse.json({ success: true, message: "Already processed" });
        }

        // Check Status
        // Pakasir status: 'success' or 'completed' (need to verify exact string)
        // Assuming 'success' based on typical gateways
        if (status === 'success' || status === 'paid' || status === 'completed') {
            // Verify amount matches
            if (parseInt(amount) !== topupRecord.amount) {
                console.error("Amount mismatch:", amount, topupRecord.amount);
                return NextResponse.json({ success: false, error: "Amount mismatch" }, { status: 400 });
            }

            // UPDATE TOPUP STATUS
            await db.update(topups).set({
                status: 'success',
                completedAt: new Date(),
                // transactionId? if needed
            }).where(eq(topups.id, topupRecord.id));

            // ADD BALANCE TO USER
            const userRecord = await db.query.user.findFirst({
                where: eq(user.id, topupRecord.userId)
            });

            if (userRecord) {
                // Credit the TOTAL amount paid (amount + fee/unique code)
                const totalPaid = topupRecord.amount + (topupRecord.fee || 0);
                const newBalance = userRecord.balance + totalPaid;

                await db.update(user).set({
                    balance: newBalance,
                    updatedAt: new Date()
                }).where(eq(user.id, userRecord.id));

                // AUDIT LOG
                await db.insert(balanceHistory).values({
                    userId: userRecord.id,
                    type: "topup",
                    amount: totalPaid,
                    balanceBefore: userRecord.balance,
                    balanceAfter: newBalance,
                    referenceId: order_id,
                    description: `Topup via Pakasir (${topupRecord.paymentMethod})`
                });

                // Create notification
                await db.insert(notifications).values({
                    userId: userRecord.id,
                    type: "topup",
                    title: "Saldo Masuk! 💰",
                    message: `Topup Rp ${topupRecord.amount.toLocaleString('id-ID')} berhasil. Saldo baru: Rp ${newBalance.toLocaleString('id-ID')}`,
                    referenceId: order_id
                });

                console.log(`Topup Success: Added ${topupRecord.amount} to user ${userRecord.id}`);
            }
        } else if (status === 'failed' || status === 'expired') {
            await db.update(topups).set({
                status: 'failed',
                expiredAt: new Date()
            }).where(eq(topups.id, topupRecord.id));
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Pakasir Webhook Error:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
