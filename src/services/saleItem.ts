import { eq, and, lte } from 'drizzle-orm';

import { saleAmendments, saleEvents, saleItems } from '../db/schema';

import { NewSaleAmendment } from '../db/types';
import { db } from '../db';

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
        .where(lte(saleEvents.date, date));
};

export const createOrUpdateSaleItemAndCreateSaleAmendment = async (
    saleEventId: number,
    { cost, taxRate, date, invoiceId, itemId }: NewSaleAmendment,
    existingItemId?: string
) =>
    await db.transaction(async tx => {
        if (existingItemId) {
            // Update sale item for a given sale with new cost and tax rate
            await tx
                .update(saleItems)
                .set({ cost, taxRate: taxRate.toString() })
                .where(
                    and(
                        eq(saleItems.saleEventId, saleEventId),
                        eq(saleItems.itemId, existingItemId)
                    )
                );
        } else {
            // Create new sale item for a given sale
            await tx.insert(saleItems).values({
                saleEventId,
                itemId,
                cost,
                taxRate: taxRate.toString(),
            });
        }

        // Add new sale amendment event
        await tx.insert(saleAmendments).values({
            invoiceId,
            itemId: existingItemId || itemId,
            date,
            cost,
            taxRate: taxRate.toString(),
        });
    });
