import { lte, desc } from 'drizzle-orm';
import { db } from '../db';
import { saleAmendments } from '../db/schema';
import { NewSaleAmendment } from '../db/types';

export const createSaleAmendment = async (amendment: NewSaleAmendment) =>
    await db.insert(saleAmendments).values(amendment);

export const getSaleAmendmentsUpToDate = async (date: string) =>
    await db
        .select()
        .from(saleAmendments)
        .where(lte(saleAmendments.amendmentDate, date))
        .orderBy(desc(saleAmendments.amendmentDate));
