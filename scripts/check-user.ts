import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

async function checkUserCount() {
    const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!url) {
        console.error('❌ DATABASE_URL not found');
        process.exit(1);
    }

    try {
        const sql = neon(url);
        const db = drizzle(sql);

        console.log('Checking users...');
        const result = await db.execute('SELECT count(*) FROM "user"');
        console.log('Result:', JSON.stringify(result, null, 2));
        process.exit(0);
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}

checkUserCount();
