import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { transactionLogs } from "@/lib/db/schema";
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { eq, desc } from "drizzle-orm";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params; // id here is the transaction Ref ID (e.g. TRX-...)

        const logs = await db
            .select()
            .from(transactionLogs)
            .where(eq(transactionLogs.referenceId, id))
            .orderBy(desc(transactionLogs.createdAt));

        return NextResponse.json({ success: true, data: logs });
    } catch (error) {
        console.error('Failed to fetch logs:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
