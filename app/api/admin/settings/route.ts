import { NextResponse } from 'next/server';
import { getAllConfigs, setConfig } from '@/lib/config';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET() {
    try {
        // Auth check - Admin only
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const configs = await getAllConfigs();
        return NextResponse.json({ success: true, data: configs });
    } catch (error) {
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
        const { key, value } = body;

        if (!key || value === undefined) {
            return NextResponse.json({ error: 'Key and Value are required' }, { status: 400 });
        }

        const result = await setConfig(key, value, session.user.id);

        if (result) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
        }
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
