
import { db } from "./lib/db";
import { user } from "./lib/db/schema";

async function checkUsers() {
    try {
        const users = await db.select().from(user);
        console.log("Total users:", users.length);
        if (users.length > 0) {
            console.log("First user:", users[0]);
        }
    } catch (e) {
        console.error("Error reading users:", e);
    }
    process.exit(0);
}

checkUsers();
