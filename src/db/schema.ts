import {
    integer,
    pgTable,
    serial,
    timestamp,
    uniqueIndex,
    uuid,
    numeric,
    index,
} from 'drizzle-orm/pg-core';

export const saleEvents = pgTable(
    'sale_events',
    {
        id: serial('id').primaryKey(),
        invoiceId: uuid('invoice_id').notNull().unique(),
        date: timestamp('date', { mode: 'string' }).notNull(),
        createdAt: timestamp('created_at').defaultNow().notNull(),
    },
    table => ({
        invoiceIdIdx: uniqueIndex('invoice_id_idx').on(table.invoiceId),
        dateIdx: index('sale_events_date_idx').on(table.date),
    })
);

export const saleItems = pgTable(
    'sale_items',
    {
        id: serial('id').primaryKey(),
        saleEventId: integer('sale_event_id')
            .references(() => saleEvents.id, { onDelete: 'cascade' })
            .notNull(),
        itemId: uuid('item_id').notNull(),
        cost: integer('cost').notNull(),
        taxRate: numeric('tax_rate').notNull(),
        createdAt: timestamp('created_at').defaultNow().notNull(),
    },
    table => ({
        salesIdAndItemIdIdx: uniqueIndex('sales_id_item_id_idx').on(
            table.saleEventId,
            table.itemId
        ),
    })
);

export const taxPayments = pgTable(
    'tax_payments',
    {
        id: serial('id').primaryKey(),
        date: timestamp('date', { mode: 'string' }).notNull(),
        amount: integer('amount').notNull(),
        createdAt: timestamp('created_at').defaultNow().notNull(),
    },
    table => ({
        dateIdx: index('tax_payments_date_idx').on(table.date),
    })
);

export const saleAmendments = pgTable(
    'sale_amendments',
    {
        id: serial('id').primaryKey(),
        invoiceId: uuid('invoice_id').notNull(),
        itemId: uuid('item_id').notNull(),
        cost: integer('cost').notNull(),
        taxRate: numeric('tax_rate').notNull(),
        date: timestamp('date', { mode: 'string' }).notNull(),
        createdAt: timestamp('created_at').defaultNow().notNull(),
    },
    table => ({
        dateIdx: index('sale_amendments_date_idx').on(table.date),
    })
);
