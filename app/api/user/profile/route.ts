import { NextResponse } from "next/server";
import { db, user } from "@/lib/db";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function GET(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const userData = await db.query.user.findFirst({
            where: eq(user.id, session.user.id)
        });

        if (!userData) {
            return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                image: userData.image,
                balance: userData.balance || 0,
            }
        });

    } catch (error) {
        console.error("Profile fetch error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch profile" },
            { status: 500 }
        );
    }
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
        const { storeName, phone, storeAddress, defaultMargin } = body;

        // Validation - allow partial updates or specific ones
        // If updating profile info
        if ((storeName !== undefined || phone !== undefined) && (!storeName || !phone)) {
            // Only validate if these fields are being updated trying to set them to empty
            // But if just updating defaultMargin, ignore this check?
            // Let's make it flexible.
        }

        // Prepare update data
        const updateData: any = { updatedAt: new Date() };
        if (storeName) updateData.storeName = storeName;
        if (phone) updateData.phone = phone;
        if (storeAddress !== undefined) updateData.storeAddress = storeAddress;
        if (defaultMargin !== undefined) updateData.defaultMargin = parseInt(defaultMargin);

        // Update user
        await db.update(user)
            .set(updateData)
            .where(eq(user.id, session.user.id));

        return NextResponse.json({
            success: true,
            data: updateData
        });

    } catch (error) {
        console.error("Profile update error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to update profile" },
            { status: 500 }
        );
    }
}
