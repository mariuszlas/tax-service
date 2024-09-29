import { Response, Request } from 'express';

import {
    updateSaleItemAndSaleAmendment,
    createSaleItemAndSaleAmendment,
    getSaleItemByItemIdForSaleEvent,
} from '../../services/saleItem';
import { getSaleByInvoiceId } from '../../services/saleEvent';
import { createSaleAmendment } from '../../services/saleAmendment';

export async function sale(req: Request, res: Response) {
    try {
        const { itemId, date, invoiceId, cost, taxRate } = req.body;
        const sale = await getSaleByInvoiceId(invoiceId);

        if (sale) {
            // Find item within the invoice
            const item = await getSaleItemByItemIdForSaleEvent(itemId, sale.id);

            if (item) {
                // Update the existing sale item and create new sale amendment
                await updateSaleItemAndSaleAmendment(
                    sale.id,
                    item.itemId,
                    req.body
                );
            } else {
                // Create new sale item and a new sale amendment
                await createSaleItemAndSaleAmendment(sale.id, req.body);
            }
        } else {
            // Create a new amendment only
            await createSaleAmendment({
                invoiceId,
                itemId,
                amendmentDate: date,
                amendedCost: cost,
                amendedTaxRate: taxRate,
            });
        }

        res.status(202).send();
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Unexpected error occured' });
    }
}
