import { Response, Request } from 'express';
import { sale } from '..';
import {
    getSaleItemByItemIdForSaleEvent,
    createOrUpdateSaleItemAndCreateSaleAmendment,
} from '../../../services/saleItem';
import { getSaleByInvoiceId } from '../../../services/saleEvent';
import { createSaleAmendment } from '../../../services/saleAmendment';
import { logError } from '../../../middleware/logger';

jest.mock('../../../services/saleEvent');
jest.mock('../../../services/saleItem');
jest.mock('../../../services/saleAmendment');
jest.mock('../../../middleware/logger');

/* eslint-disable  @typescript-eslint/no-explicit-any */
describe('sale', () => {
    const req = {
        body: {
            itemId: '123',
            invoiceId: 'invoice-123',
            cost: 1000,
            taxRate: '0.2',
            date: '2024-09-27T17:00:00Z',
        },
    } as any as Request;

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
    } as any as Response;

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should update the existing sale item and create a sale amendment if sale and item exist', async () => {
        (getSaleByInvoiceId as jest.Mock).mockResolvedValue({ id: 'sale-123' });
        (getSaleItemByItemIdForSaleEvent as jest.Mock).mockResolvedValue({
            itemId: '123',
        });

        await sale(req, res);

        expect(getSaleByInvoiceId).toHaveBeenCalledWith('invoice-123');
        expect(getSaleItemByItemIdForSaleEvent).toHaveBeenCalledWith(
            '123',
            'sale-123'
        );
        expect(
            createOrUpdateSaleItemAndCreateSaleAmendment
        ).toHaveBeenCalledWith('sale-123', req.body, '123');
        expect(res.status).toHaveBeenCalledWith(202);
        expect(res.send).toHaveBeenCalled();
    });

    it('should create a new sale item and sale amendment if sale exists but item does not', async () => {
        (getSaleByInvoiceId as jest.Mock).mockResolvedValue({ id: 'sale-123' });
        (getSaleItemByItemIdForSaleEvent as jest.Mock).mockResolvedValue(null);

        await sale(req, res);

        expect(getSaleByInvoiceId).toHaveBeenCalledWith('invoice-123');
        expect(getSaleItemByItemIdForSaleEvent).toHaveBeenCalledWith(
            '123',
            'sale-123'
        );
        expect(
            createOrUpdateSaleItemAndCreateSaleAmendment
        ).toHaveBeenCalledWith('sale-123', req.body);
        expect(res.status).toHaveBeenCalledWith(202);
        expect(res.send).toHaveBeenCalled();
    });

    it('should create only a sale amendment if sale does not exist', async () => {
        (getSaleByInvoiceId as jest.Mock).mockResolvedValue(null);

        await sale(req, res);

        expect(getSaleByInvoiceId).toHaveBeenCalledWith('invoice-123');
        expect(getSaleItemByItemIdForSaleEvent).not.toHaveBeenCalled();
        expect(
            createOrUpdateSaleItemAndCreateSaleAmendment
        ).not.toHaveBeenCalled();
        expect(createSaleAmendment).toHaveBeenCalledWith(req.body);
        expect(res.status).toHaveBeenCalledWith(202);
        expect(res.send).toHaveBeenCalled();
    });

    it('should respond with status 500 and log error on failure', async () => {
        const error = new Error('Unexpected error');
        (getSaleByInvoiceId as jest.Mock).mockRejectedValue(error);

        await sale(req, res);

        expect(logError).toHaveBeenCalledWith(req, 'Error: Unexpected error', {
            invoiceId: 'invoice-123',
            itemId: '123',
        });
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Unexpected error occurred',
        });
    });
});
