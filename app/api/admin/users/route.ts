import { NextResponse } from "next/server";
import { db, user } from "@/lib/db";
import { desc } from "drizzle-orm";

export async function GET() {
    try {
        const allUsers = await db.select().from(user).orderBy(desc(user.createdAt));

        return NextResponse.json({
            success: true,
            data: allUsers,
        });
    } catch (error) {
        console.error("Admin users error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch users" },
            { status: 500 }
        );
    }
}
// Update user role/level
export async function PATCH(req: Request) {
    try {
        const { auth } = await import("@/lib/auth");
        const { headers } = await import("next/headers");
        const session = await auth.api.getSession({
            headers: await headers()
        });

        // Ensure only admin can do this
        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { id, role, level } = body;

        if (!id) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        const { eq } = await import("drizzle-orm");

        // Prepare update data
        const updateData: any = {};
        if (role) updateData.role = role;
        if (level) {
            updateData.level = level;

            // Send Notification
            const { notifications } = await import("@/lib/db/schema");
            await db.insert(notifications).values({
                userId: id,
                title: "Status Akun Diperbarui 🎉",
                message: `Selamat! Status akun Anda telah diperbarui menjadi ${level.toUpperCase()}. Nikmati harga lebih murah sekarang!`,
                type: "info",
                read: false
            });
        }

        await db.update(user)
            .set(updateData)
            .where(eq(user.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Update user error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to update user" },
            { status: 500 }
        );
    }
}
