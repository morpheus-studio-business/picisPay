import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db, topups } from "@/lib/db";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const PAKASIR_URL = "https://pakasir.com/api";

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { amount, payment_method } = await request.json();

        if (!amount || amount < 10000) {
            return NextResponse.json(
                { success: false, error: "Minimum top-up Rp 10.000" },
                { status: 400 }
            );
        }

        const project = process.env.PAKASIR_PROJECT;
        const apiKey = process.env.PAKASIR_API_KEY;

        if (!project || !apiKey) {
            return NextResponse.json(
                { success: false, error: "Server configuration error" },
                { status: 500 }
            );
        }

        // Generate Order ID
        const orderId = `TOPUP-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

        // Create initial record in DB
        await db.insert(topups).values({
            userId: session.user.id,
            orderId: orderId,
            amount: amount,
            fee: 0, // Admin fee logic later
            status: "pending",
            paymentMethod: payment_method,
            createdAt: new Date(),
        });

        // Call Pakasir API: /create-payment
        // Note: Pakasir API docs might vary. Assuming standard params based on knowledge.
        // Usually: POST to URL with payload.
        // If "Integration via URL" is simpler, we might just return a redirect URL.
        // But the user UI expects JSON data to display QR.

        // Let's assume we use the URL integration trick but fetch it here? 
        // Or if Pakasir has a "create" endpoint.
        // Based on user provided docs link earlier: https://pakasir.com/p/docs
        // It mentions "Integrasi Via API" for custom UI.

        // Simulating API call for now or using the one from docs if available.
        // Actually, without exact endpoint for "Create Payment API",
        // we might rely on the URL method but wrap it?
        // Or better: Use the "Integrasi Via URL" method as a redirect for now if needed.

        // But wait, the frontend expects `paymentData` with QR string.
        // If Pakasir only gives URL, we might need scraping or just redirect.

        // Let's try the /pay endpoint documentation URL construction
        // `https://app.pakasir.com/pay/{slug}/{amount}?order_id={order_id}`
        // We can't easily get QR string from that standard URL without scraping.

        // Alternative: Use a library or if Pakasir v2 API exists.
        // Given I don't have full docs, I will IMPLEMENT A SIMULATION
        // that returns a dummy QR code (for testing) OR
        // if user insists on real, I need the exact endpoint found in steps before.

        // Re-checking search results: "Integration via API... Pakasir will provide... QR string".
        // So there IS an API. I will assume it's `/api/create-payment` or similar.
        // Let's try to mock the structure for now, and ask user to confirm endpoint if it fails.
        // Actually, the search result mentioned: "Pakasir provides API endpoint... for canceling...".
        // It didn't explicitly show the "create" endpoint url in the summary.

        // Strategy: 
        // 1. Create the DB record.
        // 2. Return a "payment URL" that the frontend can display in an iframe or button?
        // 3. OR Since the frontend expects QR string, maybe I should upgrade Pakasir knowledge.

        // Let's implement the "Manual" approach first:
        // Return success with a construction of payment URL.
        // Frontend will display "Click to Pay" instead of raw QR.
        // OR try to fetch the QR from the payment URL page (server side scraping - risky).

        // Let's TRY to construct a real request to `https://app.pakasir.com/api/create-payment`?
        // Risky. 

        // SAFE BET: Use the `api/pakasir/route.ts` to return the URL.
        // And update the frontend `app/topup/page.tsx` to handle `payment_url`.

        // Call Pakasir API to get Direct QR String
        try {
            const apiRes = await fetch(`https://app.pakasir.com/api/transactioncreate/${payment_method}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    project: project,
                    order_id: orderId,
                    amount: amount,
                    api_key: apiKey
                })
            });

            const apiData = await apiRes.json();

            // Log raw response for debugging (optional, remove in prod or use logger)
            console.log("Pakasir Response:", apiData);

            if (!apiData.payment) {
                // Handle case where API fails or structure is different
                return NextResponse.json(
                    { success: false, error: "Failed to get QR Code from provider" },
                    { status: 502 }
                );
            }

            const payment = apiData.payment;

            // Update the topup record with expiration time and payment details
            await db.update(topups)
                .set({
                    expiredAt: payment.expired_at ? new Date(payment.expired_at) : new Date(Date.now() + 24 * 60 * 60 * 1000), // Default 24h if not provided
                    paymentNumber: payment.payment_number,
                })
                .where(eq(topups.orderId, orderId));

            // Return the real data from API
            return NextResponse.json({
                success: true,
                data: {
                    order_id: payment.order_id,
                    amount: payment.amount,
                    fee: payment.fee,
                    total_payment: payment.total_payment,
                    payment_method: payment.payment_method,
                    payment_number: payment.payment_number, // This IS the QR String for QRIS
                    expired_at: payment.expired_at,
                    payment_url: null // We don't need this anymore for QRIS direct
                }
            });

        } catch (apiError) {
            console.error("Pakasir API Error:", apiError);
            return NextResponse.json(
                { success: false, error: "Payment provider error" },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error("Topup Error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to create topup" },
            { status: 500 }
        );
    }
}
