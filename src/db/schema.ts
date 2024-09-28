import {
    integer,
    pgTable,
    serial,
    timestamp,
    uniqueIndex,
    uuid,
    numeric,
} from 'drizzle-orm/pg-core';

import { relations } from 'drizzle-orm';

export const saleEvents = pgTable(
    'sale_events',
    {
        id: serial('id').primaryKey(),
        invoiceId: uuid('invoice_id').notNull().unique(),
        eventDate: timestamp('event_date', { mode: 'string' }).notNull(),
        createdAt: timestamp('created_at').defaultNow().notNull(),
    },
    table => {
        return {
            invoiceIdIdx: uniqueIndex('invoice_id_idx').on(table.invoiceId),
        };
    }
);

export const saleEventsRelations = relations(saleEvents, ({ many }) => ({
    items: many(saleItems),
}));

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
    table => {
        return {
            salesIdAndItemIdIdx: uniqueIndex('sales_id_item_id_idx').on(
                table.saleEventId,
                table.itemId
            ),
        };
    }
);

export const saleItemsRelations = relations(saleItems, ({ one }) => ({
    saleEvent: one(saleEvents),
}));

export const taxPaymentEvents = pgTable('tax_payment_events', {
    id: serial('id').primaryKey(),
    eventDate: timestamp('event_date', { mode: 'string' }).notNull(),
    amount: integer('amount').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const saleAmendments = pgTable('sale_amendments', {
    id: serial('id').primaryKey(),
    invoiceId: uuid('invoice_id').notNull(),
    itemId: uuid('item_id').notNull(),
    amendedCost: integer('amended_cost').notNull(),
    amendedTaxRate: numeric('amended_tax_rate').notNull(),
    amendmentDate: timestamp('amendment_date', { mode: 'string' }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});
