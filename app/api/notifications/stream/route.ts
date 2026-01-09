import { NextRequest } from "next/server";
import { db, notifications } from "@/lib/db";
import { auth } from "@/lib/auth";
import { eq, and, desc } from "drizzle-orm";
import { headers } from "next/headers";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    // Check auth
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        return new Response("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;

    // Create SSE stream
    const encoder = new TextEncoder();
    let isActive = true;

    const stream = new ReadableStream({
        async start(controller) {
            // Send initial connection message
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected' })}\n\n`));

            // Poll for new notifications every 3 seconds
            const checkNotifications = async () => {
                if (!isActive) return;

                try {
                    const unreadNotifications = await db.select()
                        .from(notifications)
                        .where(
                            and(
                                eq(notifications.userId, userId),
                                eq(notifications.isRead, false)
                            )
                        )
                        .orderBy(desc(notifications.createdAt))
                        .limit(10);

                    if (unreadNotifications.length > 0) {
                        controller.enqueue(
                            encoder.encode(`data: ${JSON.stringify({
                                type: 'notifications',
                                count: unreadNotifications.length,
                                items: unreadNotifications
                            })}\n\n`)
                        );
                    }
                } catch (error) {
                    console.error('SSE notification check error:', error);
                }

                // Schedule next check
                if (isActive) {
                    setTimeout(checkNotifications, 3000);
                }
            };

            // Start checking
            checkNotifications();

            // Handle client disconnect
            request.signal.addEventListener('abort', () => {
                isActive = false;
                controller.close();
            });
        },
        cancel() {
            isActive = false;
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}
