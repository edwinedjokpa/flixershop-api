import { pgTable } from 'drizzle-orm/pg-core';

export const customers = pgTable('customers', (t) => ({
  id: t.uuid('id').primaryKey(),
  email: t.varchar('email', { length: 255 }).notNull().unique(),
  firstName: t.varchar('first_name', { length: 100 }).notNull(),
  lastName: t.varchar('last_name', { length: 100 }).notNull(),
  phone: t.varchar('phone', { length: 20 }),
  preferencesCurrency: t
    .varchar('preferences_currency', { length: 3 })
    .notNull(),
  isActive: t.boolean('is_active').notNull().default(true),
  createdAt: t
    .timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: t
    .timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
}));

export type CustomerRow = typeof customers.$inferSelect;
