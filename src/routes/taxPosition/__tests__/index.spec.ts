import { Request, Response } from 'express';
import { getSaleItemsUpToDate } from '../../../services/saleItem';

import {
    applyAmendmentsToSales,
    calculateTotalTax,
    getTotalTaxFromQuery,
} from '../helpers';

import { getTotalTaxPaymentsUpToDate } from '../../../services/taxPayment';
import { getSaleAmendmentsUpToDate } from '../../../services/saleAmendment';
import { logError } from '../../../middleware/logger';
import { taxPosition } from '..';

jest.mock('../../../services/saleItem');
jest.mock('../helpers');
jest.mock('../../../services/taxPayment');
jest.mock('../../../services/saleAmendment');
jest.mock('../../../middleware/logger');

/* eslint-disable  @typescript-eslint/no-explicit-any */
describe('taxPosition', () => {
    const mockStatus = jest.fn().mockReturnThis();
    const mockJson = jest.fn();
    const mockResponse = {
        status: mockStatus,
        json: mockJson,
    } as any as Response;

    const mockRequest = {
        query: {
            date: '2024-02-22T17:29:39Z',
        },
    } as any as Request;

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should respond with the correct tax position and status 200', async () => {
        const mockSaleItems = [{ itemId: 'item1', cost: 1000, taxRate: '0.2' }];
        const mockSaleAmendments = [
            { itemId: 'item1', cost: 1100, taxRate: '0.25' },
        ];
        const mockTotalTaxPayments = [{ value: '5000' }];

        (getSaleItemsUpToDate as jest.Mock).mockResolvedValue(mockSaleItems);
        (getSaleAmendmentsUpToDate as jest.Mock).mockResolvedValue(
            mockSaleAmendments
        );
        (getTotalTaxPaymentsUpToDate as jest.Mock).mockResolvedValue(
            mockTotalTaxPayments
        );

        const mockUpdatedSales = new Map([
            ['item1', { cost: 1100, taxRate: '0.25' }],
        ]);
        (applyAmendmentsToSales as jest.Mock).mockReturnValue(mockUpdatedSales);
        (calculateTotalTax as jest.Mock).mockReturnValue(275);
        (getTotalTaxFromQuery as jest.Mock).mockReturnValue(5000);

        await taxPosition(mockRequest, mockResponse);

        expect(getSaleItemsUpToDate).toHaveBeenCalledWith(
            '2024-02-22T17:29:39Z'
        );
        expect(getSaleAmendmentsUpToDate).toHaveBeenCalledWith(
            '2024-02-22T17:29:39Z'
        );
        expect(getTotalTaxPaymentsUpToDate).toHaveBeenCalledWith(
            '2024-02-22T17:29:39Z'
        );

        expect(applyAmendmentsToSales).toHaveBeenCalledWith(
            mockSaleItems,
            mockSaleAmendments
        );
        expect(calculateTotalTax).toHaveBeenCalledWith(mockUpdatedSales);
        expect(getTotalTaxFromQuery).toHaveBeenCalledWith(mockTotalTaxPayments);

        expect(mockStatus).toHaveBeenCalledWith(200);
        expect(mockJson).toHaveBeenCalledWith({
            date: '2024-02-22T17:29:39Z',
            taxPosition: -4725,
        });
    });

    it('should respond with status 500 and log an error if an exception occurs', async () => {
        const mockError = new Error('Something went wrong');
        (getSaleItemsUpToDate as jest.Mock).mockRejectedValue(mockError);

        await taxPosition(mockRequest, mockResponse);

        expect(getSaleItemsUpToDate).toHaveBeenCalledWith(
            '2024-02-22T17:29:39Z'
        );
        expect(logError).toHaveBeenCalledWith('Error: Something went wrong');
        expect(mockStatus).toHaveBeenCalledWith(500);
        expect(mockJson).toHaveBeenCalledWith({
            message: 'Unexpected error occurred',
        });
    });
});
