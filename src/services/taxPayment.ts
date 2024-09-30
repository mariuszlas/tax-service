import { db } from '../db';
import { taxPayments } from '../db/schema';
import { NewTaxPaymentEvent } from '../db/types';
import { lte, sum } from 'drizzle-orm';

export const createTaxPayment = async (taxPayment: NewTaxPaymentEvent) =>
    await db.insert(taxPayments).values(taxPayment);

export const getTotalTaxPaymentsUpToDate = async (date: string) =>
    await db
        .select({ value: sum(taxPayments.amount) })
        .from(taxPayments)
        .where(lte(taxPayments.date, date));
