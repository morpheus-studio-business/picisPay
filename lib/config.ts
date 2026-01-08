import { db } from "./db";
import { configuration } from "./db/schema";
import { eq } from "drizzle-orm";

export async function getConfig(key: string, defaultValue: string = ""): Promise<string> {
    try {
        const result = await db
            .select()
            .from(configuration)
            .where(eq(configuration.key, key))
            .limit(1);

        return result.length > 0 ? result[0].value : defaultValue;
    } catch (error) {
        console.error(`Error fetching config ${key}:`, error);
        return defaultValue;
    }
}

export async function getAllConfigs() {
    try {
        const result = await db.select().from(configuration);
        return result;
    } catch (error) {
        console.error("Error fetching all configs:", error);
        return [];
    }
}

export async function setConfig(key: string, value: string, userId?: string) {
    try {
        await db
            .insert(configuration)
            .values({
                key,
                value,
                updatedBy: userId || 'system',
                updatedAt: new Date()
            })
            .onConflictDoUpdate({
                target: configuration.key,
                set: {
                    value,
                    updatedBy: userId || 'system',
                    updatedAt: new Date()
                }
            });
        return true;
    } catch (error) {
        console.error(`Error setting config ${key}:`, error);
        return false;
    }
}
