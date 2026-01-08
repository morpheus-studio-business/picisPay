import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

async function setFirstUserAsAdmin() {
    const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!url) {
        console.error('❌ DATABASE_URL or POSTGRES_URL not found in environment');
        process.exit(1);
    }

    try {
        const sql = neon(url);
        const db = drizzle(sql);

        console.log('Connecting to DB...');
        // Execute raw SQL update
        await db.execute("UPDATE \"user\" SET role = 'admin' WHERE id = (SELECT id FROM \"user\" ORDER BY created_at ASC LIMIT 1)");

        console.log('✅ First user set as admin!');
        process.exit(0);
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}

setFirstUserAsAdmin();
