import { NextRequest, NextResponse } from "next/server";
import { db, transactions, user, balanceHistory, notifications } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
    try {
        // Validate webhook secret
        const secret = request.headers.get("X-Hub-Signature") || request.headers.get("x-hub-signature");
        const expectedSecret = process.env.DIGIFLAZZ_WEBHOOK_SECRET;

        if (expectedSecret && secret !== expectedSecret) {
            console.warn("Invalid webhook secret");
            return NextResponse.json(
                { success: false, error: "Invalid secret" },
                { status: 401 }
            );
        }

        const body = await request.json();

        // Digiflazz webhook payload
        const { data } = body;

        if (!data) {
            return NextResponse.json(
                { success: false, error: "Invalid webhook payload" },
                { status: 400 }
            );
        }

        const { ref_id, status, sn, message } = data;

        console.log("Digiflazz Webhook received:", {
            ref_id,
            status,
            sn,
            message,
        });

        // Update transaction status in database
        const transaction = await db.query.transactions.findFirst({
            where: eq(transactions.refId, ref_id)
        });

        if (!transaction) {
            console.error("Transaction not found:", ref_id);
            return NextResponse.json({ success: false, error: "Transaction not found" }, { status: 404 });
        }

        // Avoid race condition: IF webhook comes faster than initial insert (rare but possible),
        // or concurrent updates. For now assuming separate insert is done.

        // Update transaction
        await db.update(transactions).set({
            status: status.toLowerCase(), // Digiflazz sends capitalized sometimes
            sn,
            message,
            updatedAt: new Date(),
        }).where(eq(transactions.refId, ref_id));

        // Handle SUCCESS - Create success notification
        if (status.toLowerCase() === "sukses") {
            await db.insert(notifications).values({
                userId: transaction.userId,
                type: "transaction_success",
                title: "Transaksi Berhasil! ✅",
                message: `${transaction.productName || 'Produk'} ke ${transaction.customerNo} berhasil.${sn ? ` SN: ${sn}` : ''}`,
                referenceId: ref_id
            });
        }

        // If transaction failed, refund the user
        // Status 'Gagal' logic
        if (status.toLowerCase() === "gagal" && transaction.status !== "gagal") {
            const userRecord = await db.query.user.findFirst({
                where: eq(user.id, transaction.userId)
            });

            if (userRecord) {
                const newBalance = userRecord.balance + transaction.price;

                await db.update(user).set({
                    balance: newBalance,
                    updatedAt: new Date(),
                }).where(eq(user.id, userRecord.id));

                await db.insert(balanceHistory).values({
                    userId: userRecord.id,
                    type: "refund",
                    amount: transaction.price,
                    balanceBefore: userRecord.balance,
                    balanceAfter: newBalance,
                    referenceId: ref_id,
                    description: `Refund (Webhook): ${message}`,
                });

                // Create failure notification
                await db.insert(notifications).values({
                    userId: userRecord.id,
                    type: "transaction_failed",
                    title: "Transaksi Gagal ❌",
                    message: `${transaction.productName || 'Produk'} ke ${transaction.customerNo} gagal. Saldo dikembalikan.`,
                    referenceId: ref_id
                });

                console.log(`Refunded ${transaction.price} to user ${userRecord.id} due to failed transaction ${ref_id}`);
            }
        }

        console.log("Digiflazz webhook processed - ref_id:", ref_id, "status:", status);

        return NextResponse.json({
            success: true,
            message: "Webhook processed",
            ref_id,
            status,
        });

    } catch (error) {
        console.error("Digiflazz webhook error:", error);
        return NextResponse.json(
            { success: false, error: "Webhook processing failed" },
            { status: 500 }
        );
    }
}
