import { NextRequest, NextResponse } from "next/server";
import { db, notifications } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, desc } from "drizzle-orm";

// GET - Fetch user notifications
export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const userNotifications = await db.query.notifications.findMany({
            where: eq(notifications.userId, session.user.id),
            orderBy: [desc(notifications.createdAt)],
            limit: 20
        });

        // Format for frontend
        const formatted = userNotifications.map(n => ({
            id: n.id,
            type: n.type,
            title: n.title,
            message: n.message,
            read: n.read,
            date: formatTimeAgo(n.createdAt),
            createdAt: n.createdAt.toISOString()
        }));

        return NextResponse.json({ success: true, data: formatted });

    } catch (error) {
        console.error("Notifications fetch error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch" }, { status: 500 });
    }
}

// PUT - Mark notification as read
export async function PUT(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { id, markAllRead } = await request.json();

        if (markAllRead) {
            await db.update(notifications)
                .set({ read: true })
                .where(eq(notifications.userId, session.user.id));
        } else if (id) {
            await db.update(notifications)
                .set({ read: true })
                .where(eq(notifications.id, id));
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        return NextResponse.json({ success: false, error: "Failed to update" }, { status: 500 });
    }
}

// Helper: Format time ago
function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Baru Saja";
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return date.toLocaleDateString('id-ID');
}
