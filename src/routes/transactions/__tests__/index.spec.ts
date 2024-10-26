import { Response, Request } from 'express';

import { createTaxPayment } from '../../../services/taxPayment';
import { createSale, getSaleByInvoiceId } from '../../../services/saleEvent';
import { logError, logWarn } from '../../../middleware/logger';
import { findNonUniqueItemIds } from '../helpers';
import { SaleEventType, transactions } from '..';

jest.mock('../../../services/taxPayment');
jest.mock('../../../services/saleEvent');
jest.mock('../helpers');
jest.mock('../../../middleware/logger');

/* eslint-disable  @typescript-eslint/no-explicit-any */
describe('transactions', () => {
    const mockStatus = jest.fn().mockReturnThis();
    const mockJson = jest.fn();
    const mockSend = jest.fn();
    const mockResponse = {
        status: mockStatus,
        json: mockJson,
        send: mockSend,
    } as any as Response;

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should respond with status 400 if sale already exists for SALES event type', async () => {
        const mockRequest = {
            body: {
                eventType: SaleEventType.SALES,
                invoiceId: 'invoice1',
                date: '2024-02-22T17:29:39Z',
                items: [],
            },
        } as any as Request;

        (getSaleByInvoiceId as jest.Mock).mockResolvedValue({ id: 'sale1' });

        await transactions(mockRequest, mockResponse);

        expect(getSaleByInvoiceId).toHaveBeenCalledWith('invoice1');
        expect(logWarn).toHaveBeenCalledWith(
            mockRequest,
            "Sale 'invoice1' already exists"
        );
        expect(mockStatus).toHaveBeenCalledWith(400);
        expect(mockJson).toHaveBeenCalledWith({
            message: "Sale 'invoice1' already exists",
        });
    });

    it('should respond with status 400 if sale items contain non-unique items', async () => {
        const mockRequest = {
            body: {
                eventType: SaleEventType.SALES,
                invoiceId: 'invoice2',
                date: '2024-02-22T17:29:39Z',
                items: [{ itemId: 'item1' }, { itemId: 'item1' }],
            },
        } as any as Request;

        (getSaleByInvoiceId as jest.Mock).mockResolvedValue(null);
        (findNonUniqueItemIds as jest.Mock).mockReturnValue(['item1']);

        await transactions(mockRequest, mockResponse);

        expect(findNonUniqueItemIds).toHaveBeenCalledWith(
            mockRequest.body.items
        );
        expect(logWarn).toHaveBeenCalledWith(
            mockRequest,
            'Sale items must have unique itemIds: item1'
        );
        expect(mockStatus).toHaveBeenCalledWith(400);
        expect(mockJson).toHaveBeenCalledWith({
            message: 'Sale items must have unique itemIds: item1',
        });
    });

    it('should create a new sale event and respond with status 202', async () => {
        const mockRequest = {
            body: {
                eventType: SaleEventType.SALES,
                invoiceId: 'invoice3',
                date: '2024-02-22T17:29:39Z',
                items: [{ itemId: 'item1', cost: 1000, taxRate: 0.2 }],
            },
        } as any as Request;

        (getSaleByInvoiceId as jest.Mock).mockResolvedValue(null);
        (findNonUniqueItemIds as jest.Mock).mockReturnValue([]);
        (createSale as jest.Mock).mockResolvedValue(null);

        await transactions(mockRequest, mockResponse);

        expect(getSaleByInvoiceId).toHaveBeenCalledWith('invoice3');
        expect(findNonUniqueItemIds).toHaveBeenCalledWith(
            mockRequest.body.items
        );
        expect(createSale).toHaveBeenCalledWith(
            { invoiceId: 'invoice3', date: '2024-02-22T17:29:39Z' },
            mockRequest.body.items
        );
        expect(mockStatus).toHaveBeenCalledWith(202);
        expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('should create a new tax payment event and respond with status 202', async () => {
        const mockRequest = {
            body: {
                eventType: SaleEventType.TAX_PAYMENT,
                amount: 5000, // £50.00
                date: '2024-02-22T17:29:39Z',
            },
        } as any as Request;

        (createTaxPayment as jest.Mock).mockResolvedValue(null);

        await transactions(mockRequest, mockResponse);

        expect(createTaxPayment).toHaveBeenCalledWith({
            amount: 5000,
            date: '2024-02-22T17:29:39Z',
        });
        expect(mockStatus).toHaveBeenCalledWith(202);
        expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('should respond with status 500 and log an error if an exception occurs', async () => {
        const mockRequest = {
            body: {
                eventType: SaleEventType.SALES,
                invoiceId: 'invoice4',
                date: '2024-02-22T17:29:39Z',
                items: [],
            },
        } as any as Request;

        const mockError = new Error('Unexpected error');
        (getSaleByInvoiceId as jest.Mock).mockRejectedValue(mockError);

        await transactions(mockRequest, mockResponse);

        expect(getSaleByInvoiceId).toHaveBeenCalledWith('invoice4');
        expect(logError).toHaveBeenCalledWith(
            mockRequest,
            'Error: Unexpected error',
            {
                invoiceId: 'invoice4',
                eventType: SaleEventType.SALES,
            }
        );
        expect(mockStatus).toHaveBeenCalledWith(500);
        expect(mockJson).toHaveBeenCalledWith({
            message: 'Unexpected error occurred',
        });
    });
});
