import { SaleAmendment } from '../../../db/types';
import {
    applyAmendmentsToSales,
    calculateTax,
    calculateTotalTax,
    getTotalTaxFromQuery,
    PartialSaleItem,
    SaleItems,
} from '../helpers';

/* eslint-disable  @typescript-eslint/no-explicit-any */
describe('taxPosition/helpers', () => {
    describe('getTotalTaxFromQuery', () => {
        it('should return the value as an integer when result contains a valid string', () => {
            const result = [{ value: '1234.56' }];
            const output = getTotalTaxFromQuery(result);
            expect(output).toBe(1235);
        });

        it('should return 0 when result is null', () => {
            const result = [{ value: null }];
            const output = getTotalTaxFromQuery(result);
            expect(output).toBe(0);
        });

        it('should return 0 when result is an empty array', () => {
            const result: { value: string | null }[] = [];
            const output = getTotalTaxFromQuery(result);
            expect(output).toBe(0);
        });

        it('should return 0 when result is undefined', () => {
            const result = [undefined as any];
            const output = getTotalTaxFromQuery(result);
            expect(output).toBe(0);
        });

        it('should handle large numbers correctly', () => {
            const result = [{ value: '9999999999.99' }];
            const output = getTotalTaxFromQuery(result);
            expect(output).toBe(10000000000);
        });
    });

    describe('calculateTax', () => {
        it('should correctly calculate tax for valid inputs', () => {
            const costInPennies = 1000; // £10.00
            const taxRate = '0.2'; // 20% tax
            const result = calculateTax(costInPennies, taxRate);
            expect(result).toBe(200); // £2.00 tax (in pennies)
        });

        it('should return 0 when cost is 0', () => {
            const costInPennies = 0;
            const taxRate = '0.2';
            const result = calculateTax(costInPennies, taxRate);
            expect(result).toBe(0); // No tax for £0.00 cost
        });

        it('should return 0 when tax rate is 0', () => {
            const costInPennies = 1000; // £10.00
            const taxRate = '0'; // 0% tax
            const result = calculateTax(costInPennies, taxRate);
            expect(result).toBe(0); // No tax when tax rate is 0
        });

        it('should correctly handle negative cost', () => {
            const costInPennies = -1000; // -£10.00
            const taxRate = '0.2'; // 20% tax
            const result = calculateTax(costInPennies, taxRate);
            expect(result).toBe(-200); // Negative tax for negative cost
        });

        it('should correctly calculate tax when tax rate is a very small decimal', () => {
            const costInPennies = 1000; // £10.00
            const taxRate = '0.001'; // 0.1% tax
            const result = calculateTax(costInPennies, taxRate);
            expect(result).toBe(1); // Rounds to £0.01
        });

        it('should handle large values correctly', () => {
            const costInPennies = 9999999999; // £99,999,999.99
            const taxRate = '0.25'; // 25% tax
            const result = calculateTax(costInPennies, taxRate);
            expect(result).toBe(2500000000); // £25,000,000.00 tax (in pennies)
        });
    });

    describe('calculateTotalTax', () => {
        it('should correctly sum up the tax for valid sales items', () => {
            const saleItems = [
                { cost: 1000, taxRate: '0.2' },
                { cost: 2000, taxRate: '0.1' },
            ];
            const totalTax = calculateTotalTax(saleItems as any as SaleItems);
            expect(totalTax).toBe(400);
        });

        it('should return 0 when there are no sales items', () => {
            const saleItems = [];
            const totalTax = calculateTotalTax(saleItems as any as SaleItems);
            expect(totalTax).toBe(0);
        });

        it('should correctly handle items with negative cost', () => {
            const saleItems = [
                { cost: -500, taxRate: '0.2' },
                { cost: 1000, taxRate: '0.2' },
            ];
            const totalTax = calculateTotalTax(saleItems as any as SaleItems);
            expect(totalTax).toBe(100);
        });
    });

    describe('applyAmendmentsToSales', () => {
        it('should return the original sales items when there are no amendments', () => {
            const salesItemsUpToDate = [
                { itemId: 'item1', cost: 1000, taxRate: '0.2' },
                { itemId: 'item2', cost: 2000, taxRate: '0.1' },
            ] as any as PartialSaleItem[];
            const amendmentsUpToDate: SaleAmendment[] = [];

            const result = applyAmendmentsToSales(
                salesItemsUpToDate,
                amendmentsUpToDate
            );
            expect(result.size).toBe(2);
            expect(result.get('item1')).toEqual({ cost: 1000, taxRate: '0.2' });
            expect(result.get('item2')).toEqual({ cost: 2000, taxRate: '0.1' });
        });

        it('should apply a single amendment to a sale item', () => {
            const salesItemsUpToDate = [
                { itemId: 'item1', cost: 1000, taxRate: '0.2' },
            ] as any as PartialSaleItem[];
            const amendmentsUpToDate = [
                { itemId: 'item1', cost: 1200, taxRate: '0.15' },
            ] as any as SaleAmendment[];

            const result = applyAmendmentsToSales(
                salesItemsUpToDate,
                amendmentsUpToDate
            );
            expect(result.size).toBe(1);
            expect(result.get('item1')).toEqual({
                cost: 1200,
                taxRate: '0.15',
            });
        });

        it('should apply multiple amendments correctly', () => {
            const salesItemsUpToDate = [
                { itemId: 'item1', cost: 1000, taxRate: '0.2' },
                { itemId: 'item2', cost: 2000, taxRate: '0.1' },
            ] as any as PartialSaleItem[];
            const amendmentsUpToDate = [
                { itemId: 'item1', cost: 1200, taxRate: '0.15' },
                { itemId: 'item2', cost: 1800, taxRate: '0.08' },
            ] as any as SaleAmendment[];

            const result = applyAmendmentsToSales(
                salesItemsUpToDate,
                amendmentsUpToDate
            );
            expect(result.size).toBe(2);
            expect(result.get('item1')).toEqual({
                cost: 1200,
                taxRate: '0.15',
            });
            expect(result.get('item2')).toEqual({
                cost: 1800,
                taxRate: '0.08',
            });
        });

        it('should ignore amendments for non-existent sale items', () => {
            const salesItemsUpToDate = [
                { itemId: 'item1', cost: 1000, taxRate: '0.2' },
            ] as any as PartialSaleItem[];
            const amendmentsUpToDate = [
                { itemId: 'item2', cost: 1800, taxRate: '0.08' },
            ] as any as SaleAmendment[];

            const result = applyAmendmentsToSales(
                salesItemsUpToDate,
                amendmentsUpToDate
            );
            expect(result.size).toBe(1);
            expect(result.get('item1')).toEqual({ cost: 1000, taxRate: '0.2' });
            expect(result.get('item2')).toBeUndefined();
        });

        it('should return an empty map if there are no sales items', () => {
            const salesItemsUpToDate = [];
            const amendmentsUpToDate = [
                { itemId: 'item1', cost: 1200, taxRate: '0.15' },
            ] as any as SaleAmendment[];

            const result = applyAmendmentsToSales(
                salesItemsUpToDate,
                amendmentsUpToDate
            );
            expect(result.size).toBe(0);
        });

        it('should completely replace original sale items with amendments if all sales items are amended', () => {
            const salesItemsUpToDate = [
                { itemId: 'item1', cost: 1000, taxRate: '0.2' },
                { itemId: 'item2', cost: 2000, taxRate: '0.1' },
            ] as any as PartialSaleItem[];
            const amendmentsUpToDate = [
                { itemId: 'item1', cost: 1200, taxRate: '0.15' },
                { itemId: 'item2', cost: 1800, taxRate: '0.08' },
            ] as any as SaleAmendment[];

            const result = applyAmendmentsToSales(
                salesItemsUpToDate,
                amendmentsUpToDate
            );
            expect(result.size).toBe(2);
            expect(result.get('item1')).toEqual({
                cost: 1200,
                taxRate: '0.15',
            });
            expect(result.get('item2')).toEqual({
                cost: 1800,
                taxRate: '0.08',
            });
        });
    });
});
