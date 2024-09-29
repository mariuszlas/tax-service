import { eq, and, lte } from 'drizzle-orm';

import { saleAmendments, saleEvents, saleItems } from '../db/schema';

import { db } from '../db';

interface TRequestBody {
    itemId: string;
    cost: number;
    taxRate: number;
    date: string;
    invoiceId: string;
}

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

export const getSaleItemsUpToDate = (date: string) => {
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

export const updateSaleItemAndSaleAmendment = async (
    saleEventId: number,
    itemId: string,
    { cost, taxRate, date, invoiceId }: TRequestBody
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
    { itemId, cost, taxRate, date, invoiceId }: TRequestBody
) =>
    await db.transaction(async tx => {
        // Create new sale item for a given sale
        await tx
            .insert(saleItems)
            .values({ saleEventId, itemId, cost, taxRate: taxRate.toString() });

        // Add new sale amendment event
        await tx.insert(saleAmendments).values({
            invoiceId,
            itemId,
            amendmentDate: date,
            amendedCost: cost,
            amendedTaxRate: taxRate.toString(),
        });
    });
