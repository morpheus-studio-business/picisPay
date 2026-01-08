import { NextRequest, NextResponse } from "next/server";

const PAKASIR_BASE_URL = "https://app.pakasir.com/api";

// Check transaction status
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get("order_id");
        const amount = searchParams.get("amount");

        if (!orderId || !amount) {
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

        // Call Pakasir Transaction Detail API
        const response = await fetch(
            `${PAKASIR_BASE_URL}/transactiondetail?project=${project}&amount=${amount}&order_id=${orderId}&api_key=${apiKey}`
        );

        const data = await response.json();

        if (data.transaction) {
            return NextResponse.json({
                success: true,
                data: data.transaction,
            });
        }

        return NextResponse.json({
            success: false,
            error: "Transaction not found",
        });
    } catch (error) {
        console.error("Check status error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to check status" },
            { status: 500 }
        );
    }
}
