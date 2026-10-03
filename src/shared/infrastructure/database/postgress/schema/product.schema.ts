import { pgTable } from 'drizzle-orm/pg-core';

export const products = pgTable('products', (t) => ({
  id: t.uuid('id').primaryKey(),
  name: t.varchar('name', { length: 255 }).notNull(),
  description: t.text('description').notNull(),
  sku: t.varchar('sku', { length: 100 }).notNull().unique(),
  basePriceAmountMinor: t
    .bigint('base_price_amount_minor', { mode: 'bigint' })
    .notNull(),
  basePriceCurrency: t.varchar('base_price_currency', { length: 3 }).notNull(),
  stock: t.integer('stock').notNull().default(0),
  isActive: t.boolean('is_active').notNull().default(true),
  lowStockThreshold: t.integer('low_stock_threshold').notNull().default(5),
  createdAt: t
    .timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: t
    .timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
}));

export type ProductRow = typeof products.$inferSelect;
