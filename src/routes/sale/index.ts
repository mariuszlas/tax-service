import { Response, Request } from 'express';

import {
    getSaleItemByItemIdForSaleEvent,
    createOrUpdateSaleItemAndCreateSaleAmendment,
} from '../../services/saleItem';
import { getSaleByInvoiceId } from '../../services/saleEvent';
import { createSaleAmendment } from '../../services/saleAmendment';
import { logError } from '../../middleware/logger';

export async function sale(req: Request, res: Response) {
    const { itemId, invoiceId } = req.body;

    try {
        const sale = await getSaleByInvoiceId(invoiceId);

        if (sale) {
            // Find item within the invoice
            const item = await getSaleItemByItemIdForSaleEvent(itemId, sale.id);

            if (item) {
                // Update the existing sale item and create new sale amendment
                await createOrUpdateSaleItemAndCreateSaleAmendment(
                    sale.id,
                    req.body,
                    item.itemId
                );
            } else {
                // Create new sale item and a new sale amendment
                await createOrUpdateSaleItemAndCreateSaleAmendment(
                    sale.id,
                    req.body
                );
            }
        } else {
            // Create a new amendment only
            await createSaleAmendment(req.body);
        }

        res.status(202).send();
    } catch (e) {
        logError(String(e), { invoiceId, itemId });
        res.status(500).json({ message: 'Unexpected error occurred' });
    }
}
