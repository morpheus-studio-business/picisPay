import { NextRequest, NextResponse } from "next/server";

const PAKASIR_BASE_URL = "https://app.pakasir.com/api";

// Simulate payment (sandbox only)
export async function POST(request: NextRequest) {
    try {
        const { order_id, amount } = await request.json();

        if (!order_id || !amount) {
            return NextResponse.json(
                { success: false, error: "order_id and amount are required" },
                { status: 400 }
            );
        }

        const project = process.env.PAKASIR_PROJECT;
        const apiKey = process.env.PAKASIR_API_KEY;

        if (!project || !apiKey) {
            return NextResponse.json(
                { success: false, error: "Pakasir credentials not configured" },
                { status: 500 }
            );
        }

        // Call Pakasir Payment Simulation API
        const response = await fetch(`${PAKASIR_BASE_URL}/paymentsimulation`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                project,
                order_id,
                amount,
                api_key: apiKey,
            }),
        });

        const data = await response.json();

        return NextResponse.json({
            success: true,
            data,
            message: "Payment simulation triggered. Webhook should be received soon.",
        });
    } catch (error) {
        console.error("Payment simulation error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to simulate payment" },
            { status: 500 }
        );
    }
}
