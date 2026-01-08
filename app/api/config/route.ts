import { NextResponse } from 'next/server';
import { getAllConfigs } from '@/lib/config';

export async function GET() {
    try {
        const configs = await getAllConfigs();

        // Filter only public configs if needed, but for now returned all is fine as they are general settings
        // If we had secret keys, we would filter them here
        const publicConfigs = configs.filter(c =>
            ['site_name', 'announcement_text', 'wa_admin', 'maintenance_mode'].includes(c.key)
        );

        return NextResponse.json({ success: true, data: publicConfigs });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
