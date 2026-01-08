import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db, transactions, user, balanceHistory, notifications } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { logTransaction } from "@/lib/logger";

const DIGIFLAZZ_URL = "https://api.digiflazz.com/v1/transaction";

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { buyer_sku_code, customer_no, ref_id, price, product_name } = await request.json();

        if (!buyer_sku_code || !customer_no || !price) {
            return NextResponse.json(
                { success: false, error: "Invalid request data" },
                { status: 400 }
            );
        }

        // 1. Check User Balance
        const userRecord = await db.query.user.findFirst({
            where: eq(user.id, session.user.id)
        });

        if (!userRecord || userRecord.balance < price) {
            return NextResponse.json(
                { success: false, error: "Saldo tidak mencukupi", balance: userRecord?.balance || 0 },
                { status: 400 }
            );
        }

        const username = process.env.DIGIFLAZZ_USERNAME;
        const apiKey = process.env.DIGIFLAZZ_API_KEY;

        if (!username || !apiKey) {
            return NextResponse.json(
                { success: false, error: "Server configuration error" },
                { status: 500 }
            );
        }

        // 2. Generate Ref ID
        const transactionRefId = ref_id || `TRX-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

        // 3. Deduct Balance (Optimistic Update)
        // Ideally use a transaction, but for now linear awaits
        const newBalance = userRecord.balance - price;
        await db.update(user).set({ balance: newBalance, updatedAt: new Date() }).where(eq(user.id, session.user.id));

        // 4. Create Balance History Audit
        await db.insert(balanceHistory).values({
            userId: session.user.id,
            type: "purchase",
            amount: price,
            balanceBefore: userRecord.balance,
            balanceAfter: newBalance,
            referenceId: transactionRefId,
            description: `Pembelian ${product_name || buyer_sku_code} ke ${customer_no}`
        });

        // 5. Call Digiflazz API
        const sign = crypto
            .createHash("md5")
            .update(username + apiKey + transactionRefId)
            .digest("hex");

        const payload = {
            username,
            buyer_sku_code,
            customer_no,
            ref_id: transactionRefId,
            sign,
        };

        // Log Request
        await logTransaction({
            provider: 'digiflazz',
            type: 'request',
            payload,
            transactionId: transactionRefId // We don't have UUID here yet, using RefID is fine for correlation or we update later
        });

        const response = await fetch(DIGIFLAZZ_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        // Log Response
        await logTransaction({
            provider: 'digiflazz',
            type: 'response',
            payload: data,
            transactionId: transactionRefId,
            statusCode: response.status
        });

        // 6. Save Transaction Record
        const status = data.data?.status || (data.data?.rc === '00' ? 'success' : 'pending'); // Digiflazz sometimes pending or success

        const insertedTx = await db.insert(transactions).values({
            userId: session.user.id,
            refId: transactionRefId,
            buyerSkuCode: buyer_sku_code,
            customerNo: customer_no,
            productName: data.data?.product_name || product_name || buyer_sku_code,
            price: price, // Selling price or modal price? Usually we store modal price here, but let's store selling for now
            status: status,
            sn: data.data?.sn || null,
            message: data.data?.message || data.data?.rc || null,
        }).returning({ id: transactions.id });

        // Update logs with real UUID if needed (optional optimization)

        // If Failed from Digiflazz, Refund!
        if (data.data?.status === 'Gagal' || data.data?.rc === '02') {
            // Refund
            await db.update(user).set({ balance: userRecord.balance, updatedAt: new Date() }).where(eq(user.id, session.user.id));
            await db.insert(balanceHistory).values({
                userId: session.user.id,
                type: "refund",
                amount: price,
                balanceBefore: newBalance,
                balanceAfter: userRecord.balance,
                referenceId: transactionRefId,
                description: `Refund Gagal: ${product_name || buyer_sku_code}`
            });
            // Update transaction status
            await db.update(transactions).set({ status: 'failed', message: 'Refunded due to provider failure' }).where(eq(transactions.refId, transactionRefId));

            // Notify user about refund
            await db.insert(notifications).values({
                userId: session.user.id,
                type: "transaction",
                title: "Transaksi Gagal ❌",
                message: `Pembelian ${product_name || buyer_sku_code} gagal. Saldo Rp ${price.toLocaleString('id-ID')} sudah dikembalikan.`,
                referenceId: transactionRefId
            });

            return NextResponse.json({ success: false, error: "Transaksi Gagal dari Provider (Saldo dikembalikan)" });
        }
        // 7. Create Notification for user
        await db.insert(notifications).values({
            userId: session.user.id,
            type: "transaction",
            title: "Transaksi Berhasil! ✅",
            message: `Pembelian ${product_name || buyer_sku_code} ke ${customer_no} berhasil diproses.`,
            referenceId: transactionRefId
        });

        return NextResponse.json({
            success: true,
            data: {
                ...data.data,
                ref_id: transactionRefId,
                new_balance: newBalance
            },
        });

    } catch (error) {
        console.error("Transaction Error:", error);

        await logTransaction({
            provider: 'digiflazz',
            type: 'request', // System error treated as request failure
            payload: { error: JSON.stringify(error) },
            statusCode: 500
        });

        // If generic error after deduction but before API call implies risk. 
        // For production, use DB Transactions (db.transaction)
        return NextResponse.json(
            { success: false, error: "Terjadi kesalahan sistem" },
            { status: 500 }
        );
    }
}
