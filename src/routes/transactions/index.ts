import { Response, Request } from 'express';

import { createTaxPayment } from '../../services/taxPayment';
import { createSale, getSaleByInvoiceId } from '../../services/saleEvent';
import { logError, logWarn } from '../../middleware/logger';
import { findNonUniqueItemIds } from './helpers';

export enum SaleEventType {
    SALES = 'SALES',
    TAX_PAYMENT = 'TAX_PAYMENT',
}

export async function transactions(req: Request, res: Response) {
    const { eventType, date, invoiceId, items, amount } = req.body;

    try {
        if (eventType === SaleEventType.SALES) {
            // Find sale with a given id
            const sale = await getSaleByInvoiceId(invoiceId);

            // Return error if sale event with a given id already exists
            if (sale) {
                const message = `Sale '${invoiceId}' already exists`;
                logWarn(message);
                res.status(400).json({ message });
                return;
            }

            const nonUniqueItemIds = findNonUniqueItemIds(items);

            // Return error if sale event contains items with same itemId
            if (nonUniqueItemIds.length > 0) {
                const message = `Sale items must have unique itemIds: ${nonUniqueItemIds.toString()}`;
                logWarn(message);
                res.status(400).json({ message });
                return;
            }

            // Add a new sale event
            await createSale({ invoiceId, date }, items);
        }

        if (eventType === SaleEventType.TAX_PAYMENT) {
            // Add new tax payment event
            await createTaxPayment({ amount, date });
        }

        res.status(202).send();
    } catch (e) {
        logError(String(e), { invoiceId, eventType });
        res.status(500).json({ message: 'Unexpected error occurred' });
    }
}
