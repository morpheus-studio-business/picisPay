import { pgTable, text, integer, timestamp, uuid, boolean } from "drizzle-orm/pg-core";

// Better Auth - Users table
export const user = pgTable("user", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").notNull().default(false),
    image: text("image"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    // Custom fields
    phone: text("phone"),
    storeName: text("store_name"),
    storeAddress: text("store_address"),
    balance: integer("balance").default(0).notNull(),
    defaultMargin: integer("default_margin").default(2000).notNull(),
    role: text("role").default("user").notNull(),
    level: text("level").default("member").notNull(),
    pin: text("pin"), // Hashed PIN for transactions
});

// ... (existing code) ...

// Transaction Logs (Phase 3) - For debugging raw provider responses
export const transactionLogs = pgTable("transaction_logs", {
    id: uuid("id").primaryKey().defaultRandom(),
    referenceId: text("reference_id"), // Changed from uuid transactionId to text referenceId
    provider: text("provider").notNull(), // 'digiflazz', 'pakasir'
    type: text("type").notNull(), // 'request', 'response', 'webhook'
    payload: text("payload"), // JSON string
    statusCode: integer("status_code"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Better Auth - Sessions table
export const session = pgTable("session", {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id").notNull().references(() => user.id),
});

// Better Auth - Accounts table (for OAuth providers)
export const account = pgTable("account", {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id").notNull().references(() => user.id),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Better Auth - Verification tokens
export const verification = pgTable("verification", {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// Top-up transactions (Pakasir)
export const topups = pgTable("topups", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").references(() => user.id).notNull(),
    orderId: text("order_id").unique().notNull(),
    amount: integer("amount").notNull(),
    fee: integer("fee").default(0),
    status: text("status").default("pending").notNull(),
    paymentMethod: text("payment_method"),
    paymentNumber: text("payment_number"),
    expiredAt: timestamp("expired_at"),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// PPOB Transactions (Digiflazz)
export const transactions = pgTable("transactions", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").references(() => user.id).notNull(),
    refId: text("ref_id").unique().notNull(),
    buyerSkuCode: text("buyer_sku_code").notNull(),
    customerNo: text("customer_no").notNull(),
    productName: text("product_name"),
    price: integer("price").notNull(),
    status: text("status").default("pending").notNull(),
    sn: text("sn"),
    message: text("message"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Balance history for audit
export const balanceHistory = pgTable("balance_history", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").references(() => user.id).notNull(),
    type: text("type").notNull(),
    amount: integer("amount").notNull(),
    balanceBefore: integer("balance_before").notNull(),
    balanceAfter: integer("balance_after").notNull(),
    referenceId: text("reference_id"),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Notifications
export const notifications = pgTable("notifications", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").references(() => user.id).notNull(),
    type: text("type").notNull(), // 'transaction', 'topup', 'promo', 'info'
    title: text("title").notNull(),
    message: text("message").notNull(),
    read: boolean("read").default(false).notNull(),
    referenceId: text("reference_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Custom Prices (Admin set selling prices)
export const customPrices = pgTable("custom_prices", {
    id: uuid("id").primaryKey().defaultRandom(),
    skuCode: text("sku_code").notNull().unique(),
    productName: text("product_name").notNull(),
    brand: text("brand").notNull(),
    category: text("category").notNull(),
    basePrice: integer("base_price").notNull(),
    sellingPrice: integer("selling_price").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Category Mappings (Custom category for frontend)
export const categoryMappings = pgTable("category_mappings", {
    id: uuid("id").primaryKey().defaultRandom(),
    originalType: text("original_type").notNull(), // Original type from Digiflazz (e.g., "Mini", "Flash")
    brand: text("brand").notNull(), // Provider brand (e.g., "TELKOMSEL", "INDOSAT")
    customName: text("custom_name").notNull(), // Custom display name (e.g., "Paket Hemat")
    isHidden: boolean("is_hidden").default(false).notNull(), // Hide from frontend
    priority: integer("priority").default(0).notNull(), // Display order (lower = first)
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// System Configuration (Phase 1)
export const configuration = pgTable("configuration", {
    key: text("key").primaryKey(), // e.g. 'site_name', 'wa_admin', 'maintenance_mode'
    value: text("value").notNull(),
    description: text("description"), // For admin context
    updatedBy: text("updated_by"),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Banners (Phase 2)
export const banners = pgTable("banners", {
    id: uuid("id").primaryKey().defaultRandom(),
    imageUrl: text("image_url").notNull(),
    title: text("title"),
    linkUrl: text("link_url"),
    isActive: boolean("is_active").default(true).notNull(),
    priority: integer("priority").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
