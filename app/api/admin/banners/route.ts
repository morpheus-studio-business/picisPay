import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { banners } from "@/lib/db/schema";
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { eq, desc, asc } from "drizzle-orm";

export async function GET() {
    try {
        // Fetch all active banners ordered by priority
        const result = await db
            .select()
            .from(banners)
            .orderBy(asc(banners.priority), desc(banners.createdAt));

        return NextResponse.json({ success: true, data: result });
    } catch (error) {
        console.error('Failed to fetch banners:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { imageUrl, title, linkUrl, isActive, priority } = body;

        if (!imageUrl) {
            return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
        }

        await db.insert(banners).values({
            imageUrl,
            title,
            linkUrl,
            isActive: isActive ?? true,
            priority: priority ?? 0,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to create banner:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        await db.delete(banners).where(eq(banners.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete banner:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
