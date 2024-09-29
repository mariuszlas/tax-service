import { Response, Request } from 'express';

import { createTaxPayment } from '../../services/taxPayment';
import { createSale, getSaleByInvoiceId } from '../../services/saleEvent';

enum SaleEventType {
    SALES = 'SALES',
    TAX_PAYMENT = 'TAX_PAYMENT',
}

export async function transactions(req: Request, res: Response) {
    try {
        const { eventType, date, invoiceId, items, amount } = req.body;

        if (eventType === SaleEventType.SALES) {
            // Find sale with a given id
            const sale = await getSaleByInvoiceId(invoiceId);

            // Return error if sale event with a given id already exists
            if (sale) {
                res.status(400).json({
                    message: `Sale '${invoiceId}' already exists`,
                });
                return;
            }

            const itemIds = new Set(items.map(item => item?.itemId));

            // Return error if sale event contains items with same itemId
            if (itemIds.size !== items.length) {
                res.status(400).json({
                    message: 'Items within invoice must be unique',
                });
                return;
            }

            // Add a new sale event
            await createSale({ invoiceId, eventDate: date }, items);
        }

        if (eventType === SaleEventType.TAX_PAYMENT) {
            // Add new tax payment event
            await createTaxPayment({ amount, eventDate: date });
        }

        res.status(202).send();
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Unexpected error occured' });
    }
}
