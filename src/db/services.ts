import { eq, and, lte, sum, desc } from 'drizzle-orm';
import Decimal from 'decimal.js';

import {
    saleAmendments,
    saleEvents,
    saleItems,
    taxPaymentEvents,
} from './schema';

import {
    NewSaleAmendment,
    NewSaleEvent,
    NewSaleItem,
    NewTaxPaymentEvent,
} from './types';

import { db } from '.';

export const createSale = async (sale: NewSaleEvent, items: NewSaleItem[]) =>
    await db.transaction(async tx => {
        const dbSaleEvent = await tx.insert(saleEvents).values(sale).returning({
            id: saleEvents.id,
        });

        await tx
            .insert(saleItems)
            .values(
                items.map(item => ({ ...item, saleEventId: dbSaleEvent[0].id }))
            );
    });

export const createTaxPayment = async (taxPayment: NewTaxPaymentEvent) =>
    await db.insert(taxPaymentEvents).values(taxPayment);

export const createAmendment = async (amendment: NewSaleAmendment) =>
    await db.insert(saleAmendments).values(amendment);

export const createNewSaleItem = async (item: NewSaleItem) =>
    await db.insert(saleItems).values(item);

export const getSaleByInvoiceId = async (invoiceId: string) =>
    await db.query.saleEvents.findFirst({
        where: eq(saleEvents.invoiceId, invoiceId),
    });

export const getSaleItemByItemIdForSaleEvent = async (
    itemId: string,
    saleEventId: number
) =>
    await db.query.saleItems.findFirst({
        where: and(
            eq(saleItems.saleEventId, saleEventId),
            eq(saleItems.itemId, itemId)
        ),
    });

export const getSalesItemsUpToDate = (date: string) => {
    return db
        .select({
            itemId: saleItems.itemId,
            saleEventId: saleItems.saleEventId,
            cost: saleItems.cost,
            taxRate: saleItems.taxRate,
        })
        .from(saleItems)
        .leftJoin(saleEvents, eq(saleItems.saleEventId, saleEvents.id))
        .where(lte(saleEvents.eventDate, date));
};

export const getAmendmentsUpToDate = async (date: string) =>
    await db
        .select()
        .from(saleAmendments)
        .where(lte(saleAmendments.amendmentDate, date))
        .orderBy(desc(saleAmendments.amendmentDate));

export const getSumTaxPaymentsUpToDate = async (date: string) => {
    const taxPaymentsUpToDate = await db
        .select({ value: sum(taxPaymentEvents.amount) })
        .from(taxPaymentEvents)
        .where(lte(taxPaymentEvents.eventDate, date));

    const value = taxPaymentsUpToDate[0]?.value;
    // Convert string into integer (amount in pennies)
    return value ? new Decimal(value).toDP(0).toNumber() : 0;
};

export const updateSaleItemForSaleEvent = async (
    itemId: string,
    saleEventId: number,
    cost: number,
    taxRate: number
) =>
    await db
        .update(saleItems)
        .set({ cost, taxRate: taxRate.toString() })
        .where(
            and(
                eq(saleItems.saleEventId, saleEventId),
                eq(saleItems.itemId, itemId)
            )
        );

interface BodyType {
    itemId: string;
    cost: number;
    taxRate: number;
    date: string;
    invoiceId: string;
}

export const amendSaleItem = async (
    saleEventId: number,
    itemId: string,
    { cost, taxRate, date, invoiceId }: BodyType
) =>
    await db.transaction(async tx => {
        // Update sale item for a given sale with new cost and tax rate
        await tx
            .update(saleItems)
            .set({ cost, taxRate: taxRate.toString() })
            .where(
                and(
                    eq(saleItems.saleEventId, saleEventId),
                    eq(saleItems.itemId, itemId)
                )
            );

        // Add new sale amendment event
        await tx.insert(saleAmendments).values({
            invoiceId,
            itemId,
            amendmentDate: date,
            amendedCost: cost,
            amendedTaxRate: taxRate.toString(),
        });
    });

export const createSaleItemAndSaleAmendment = async (
    saleEventId: number,
    { itemId, cost, taxRate, date, invoiceId }: BodyType
) =>
    await db.transaction(async tx => {
        console.log('transaction');
        // Create new sale item for a given sale
        const item = await tx
            .insert(saleItems)
            .values({ saleEventId, itemId, cost, taxRate: taxRate.toString() })
            .returning();

        console.log(item);

        console.log('after insert item');

        // Add new sale amendment event
        await tx.insert(saleAmendments).values({
            invoiceId,
            itemId,
            amendmentDate: date,
            amendedCost: cost,
            amendedTaxRate: taxRate.toString(),
        });
    });
