import { Response, Request } from 'express';

import {
    getAmendmentsUpToDate,
    getSalesItemsUpToDate,
    getSumTaxPaymentsUpToDate,
} from '../../db/services';

import { applyAmendmentsToSales, calculateTotalTax } from './helpers';

export async function taxPosition(req: Request, res: Response) {
    try {
        const date = req.query?.date as string;

        const salesItemsUpToDate = await getSalesItemsUpToDate(date);
        const amendmentsUpToDate = await getAmendmentsUpToDate(date);
        const totalTaxPaymentsUpToDate = await getSumTaxPaymentsUpToDate(date);

        const updatedSales = applyAmendmentsToSales(
            salesItemsUpToDate,
            amendmentsUpToDate
        );

        const totalTaxFromSales = calculateTotalTax(updatedSales);
        const taxPosition = totalTaxFromSales - totalTaxPaymentsUpToDate;

        res.status(200).json({ date, taxPosition });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Unexpected error occurred' });
    }
}
