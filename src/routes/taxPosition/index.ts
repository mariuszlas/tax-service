import { Response, Request } from 'express';

import { getSaleItemsUpToDate } from '../../services/saleItem';

import {
    applyAmendmentsToSales,
    calculateTotalTax,
    getTotalTaxFromQuery,
} from './helpers';

import { getTotalTaxPaymentsUpToDate } from '../../services/taxPayment';
import { getSaleAmendmentsUpToDate } from '../../services/saleAmendment';

export async function taxPosition(req: Request, res: Response) {
    try {
        const date = req.query?.date as string;

        const [saleItems, saleAmendments, totalTaxPaymentsResult] =
            await Promise.all([
                getSaleItemsUpToDate(date),
                getSaleAmendmentsUpToDate(date),
                getTotalTaxPaymentsUpToDate(date),
            ]);

        // Apply amendments to sales
        const updatedSales = applyAmendmentsToSales(saleItems, saleAmendments);
        //  Calculate total tax from amended sales (in pennies)
        const totalTaxFromSales = calculateTotalTax(updatedSales);
        // Get total tax value from the query result (in pennies)
        const totalTaxPayments = getTotalTaxFromQuery(totalTaxPaymentsResult);

        const taxPosition = totalTaxFromSales - totalTaxPayments;

        res.status(200).json({ date, taxPosition });
    } catch {
        res.status(500).json({ message: 'Unexpected error occurred' });
    }
}
