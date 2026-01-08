import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

async function seedConfig() {
    const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!url) {
        console.error('❌ DATABASE_URL not found');
        process.exit(1);
    }

    const sql = neon(url);
    const db = drizzle(sql);

    console.log('Seeding configuration...');

    const defaults = [
        { key: 'site_name', value: 'PicisPay', description: 'Nama Website yang muncul di header/title' },
        { key: 'wa_admin', value: '6281234567890', description: 'Nomor WhatsApp Admin (format 62...)' },
        { key: 'global_margin', value: '2000', description: 'Keuntungan default per transaksi (Rupiah)' },
        { key: 'maintenance_mode', value: 'false', description: 'Status website (true = tutup, false = buka)' },
        { key: 'announcement_text', value: 'Selamat datang di PicisPay! Nikmati transaksi cepat 24 jam.', description: 'Teks berjalan (Running Text)' },
    ];

    try {
        for (const config of defaults) {
            await db.execute(`
                INSERT INTO configuration (key, value, description) 
                VALUES ('${config.key}', '${config.value}', '${config.description}')
                ON CONFLICT (key) DO NOTHING;
            `);
            console.log(`Verified config: ${config.key}`);
        }
        console.log('✅ Configuration seeded!');
        process.exit(0);
    } catch (e) {
        console.error('Error seeding:', e);
        process.exit(1);
    }
}

seedConfig();
