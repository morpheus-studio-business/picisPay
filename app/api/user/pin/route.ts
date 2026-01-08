import { NextResponse } from "next/server";
import { db, user } from "@/lib/db";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import crypto from "crypto";

// Helper to hash PIN
function hashPin(pin: string) {
    return crypto.createHash("sha256").update(pin).digest("hex");
}

export async function PUT(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { pin, oldPin } = body;

        // Validation
        if (!pin || pin.length !== 6 || !/^\d+$/.test(pin)) {
            return NextResponse.json({ success: false, error: "PIN harus 6 digit angka" }, { status: 400 });
        }

        // Get current user data
        const userData = await db.query.user.findFirst({
            where: eq(user.id, session.user.id)
        });

        if (!userData) {
            return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
        }

        // Check if PIN is already set
        const isPinSet = !!userData.pin;

        // Verify old PIN if set
        if (isPinSet) {
            if (!oldPin) {
                return NextResponse.json({ success: false, error: "Masukkan PIN lama" }, { status: 400 });
            }
            if (hashPin(oldPin) !== userData.pin) {
                return NextResponse.json({ success: false, error: "PIN lama salah" }, { status: 400 });
            }
        }

        // Update PIN
        const hashedPin = hashPin(pin);
        await db.update(user)
            .set({ pin: hashedPin, updatedAt: new Date() })
            .where(eq(user.id, session.user.id));

        return NextResponse.json({ success: true, message: "PIN berhasil diperbarui" });

    } catch (error) {
        console.error("PIN update error:", error);
        return NextResponse.json(
            { success: false, error: "Gagal memperbarui PIN" },
            { status: 500 }
        );
    }
}
