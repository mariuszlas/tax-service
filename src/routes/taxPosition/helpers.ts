import Decimal from 'decimal.js';
import { SaleAmendment, SaleItem } from '../../db/types';

type SaleItems = Map<string, Pick<SaleItem, 'cost' | 'taxRate'>>;

// Calculate tax for an item, returning tax in pennies (as integer)
export const calculateTax = (costInPennies: number, taxRate: string) => {
    const cost = new Decimal(costInPennies);

    // Multiply by the tax rate (string)
    const tax = cost.mul(taxRate);

    // Convert to integer pennies (rounding up to the nearest penny by default)
    return tax.toDP(0).toNumber();
};

export const getTotalTaxFromQuery = (result: { value: string | null }[]) => {
    const value = result[0]?.value;
    // Convert string into integer (amount in pennies)
    return value ? new Decimal(value).toDP(0).toNumber() : 0;
};

export const applyAmendmentsToSales = (
    salesItemsUpToDate: Omit<SaleItem, 'createdAt' | 'id'>[],
    amendmentsUpToDate: SaleAmendment[]
) => {
    const saleItems: SaleItems = new Map();

    // Create a map with sale items
    salesItemsUpToDate.forEach(saleItem =>
        saleItems.set(saleItem.itemId, {
            cost: saleItem.cost,
            taxRate: saleItem.taxRate,
        })
    );

    // Apply amendments (most recent amendments will overwrite earlier ones because amendments are sorted)
    amendmentsUpToDate.forEach(amendment => {
        if (saleItems.has(amendment.itemId)) {
            // if there is an amendment for a given sale item, overwrite the item's cost and tax rate with the amended ones
            saleItems.set(amendment.itemId, {
                cost: amendment.amendedCost,
                taxRate: amendment.amendedTaxRate,
            });
        }
    });

    return saleItems;
};

// Calculate tax for each sale item and sum it up
export const calculateTotalTax = (updatedSales: SaleItems) => {
    let totalTax = 0;

    updatedSales.forEach(({ cost, taxRate }) => {
        totalTax += calculateTax(cost, taxRate);
    });
    return totalTax;
};
