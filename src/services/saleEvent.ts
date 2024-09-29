import { eq } from 'drizzle-orm';
import { db } from '../db';
import { saleEvents, saleItems } from '../db/schema';
import { NewSaleEvent, NewSaleItem } from '../db/types';

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

export const getSaleByInvoiceId = async (invoiceId: string) =>
    await db.query.saleEvents.findFirst({
        where: eq(saleEvents.invoiceId, invoiceId),
    });
