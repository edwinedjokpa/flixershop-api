import { pgTable, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { customers } from './customer.schema.js';
import { products } from './product.schema.js';
import { ORDER_STATUSES } from '@/modules/order/domain/constants/order.constants.js';

export const orderStatusEnum = pgEnum('order_status', ORDER_STATUSES);

export const orders = pgTable('orders', (t) => ({
  id: t.uuid('id').primaryKey(),
  customerId: t
    .uuid('customer_id')
    .notNull()
    .references(() => customers.id),
  status: orderStatusEnum('status').notNull().default('pending'),
  totalAmountMinor: t
    .bigint('total_amount_minor', { mode: 'bigint' })
    .notNull(),
  totalCurrency: t.varchar('total_currency', { length: 3 }).notNull(),
  shippingStreet: t.varchar('shipping_street').notNull(),
  shippingCity: t.varchar('shipping_city').notNull(),
  shippingState: t.varchar('shipping_state').notNull(),
  shippingZipCode: t.varchar('shipping_zip_code').notNull(),
  shippingCountry: t.varchar('shipping_country').notNull(),
  trackingNumber: t.varchar('tracking_number').unique(),
  notes: t.text('notes'),
  createdAt: t
    .timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: t
    .timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
}));

export const orderItems = pgTable('order_items', (t) => ({
  id: t.uuid('id').primaryKey(),
  orderId: t
    .uuid('order_id')
    .notNull()
    .references(() => orders.id),
  productId: t
    .uuid('product_id')
    .notNull()
    .references(() => products.id),
  productName: t.varchar('product_name').notNull(),
  unitPriceAmount: t.bigint('unit_price_amount', { mode: 'bigint' }).notNull(),
  unitPriceCurrency: t.varchar('unit_price_currency', { length: 3 }).notNull(),
  quantity: t.integer('quantity').notNull(),
  discountAmount: t.bigint('discount_amount', { mode: 'bigint' }),
  discountCurrency: t.varchar('discount_currency', { length: 3 }),
  createdAt: t.timestamp('created_at').notNull().defaultNow(),
}));

export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
}));

export type OrderRow = typeof orders.$inferSelect;
export type OrderItemRow = typeof orderItems.$inferSelect;
