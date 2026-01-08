import { db } from "./db";
import { transactionLogs } from "./db/schema";

interface LogParams {
    provider: 'digiflazz' | 'pakasir';
    type: 'request' | 'response' | 'webhook';
    payload: any;
    transactionId?: string;
    statusCode?: number;
}

export async function logTransaction({ provider, type, payload, transactionId, statusCode }: LogParams) {
    try {
        await db.insert(transactionLogs).values({
            provider,
            type,
            payload: JSON.stringify(payload),
            referenceId: transactionId || null, // Map transactionId param to referenceId column
            statusCode: statusCode || 200,
        });
    } catch (error) {
        console.error('Failed to save transaction log:', error);
        // Don't throw error to avoid blocking the main flow
    }
}
