import { NewSaleItem } from '../../../db/types';
import { findNonUniqueItemIds } from '../helpers';

/* eslint-disable  @typescript-eslint/no-explicit-any */
describe('findNonUniqueItemIds', () => {
    it('should return an empty array when there are no items', () => {
        const items: NewSaleItem[] = [];
        const result = findNonUniqueItemIds(items);
        expect(result).toEqual([]);
    });

    it('should return an empty array when all itemIds are unique', () => {
        const items = [
            { itemId: 'item1' },
            { itemId: 'item2' },
            { itemId: 'item3' },
        ] as any as NewSaleItem[];
        const result = findNonUniqueItemIds(items);
        expect(result).toEqual([]);
    });

    it('should return non-unique itemIds when there are duplicates', () => {
        const items = [
            { itemId: 'item1' },
            { itemId: 'item2' },
            { itemId: 'item1' },
            { itemId: 'item3' },
            { itemId: 'item2' },
        ] as any as NewSaleItem[];
        const result = findNonUniqueItemIds(items);
        expect(result).toEqual(['item1', 'item2']);
    });

    it('should return a single duplicate itemId when only one duplicate exists', () => {
        const items = [
            { itemId: 'item1' },
            { itemId: 'item2' },
            { itemId: 'item1' },
        ] as any as NewSaleItem[];
        const result = findNonUniqueItemIds(items);
        expect(result).toEqual(['item1']);
    });

    it('should return all itemIds when every item is duplicated', () => {
        const items = [
            { itemId: 'item1' },
            { itemId: 'item1' },
            { itemId: 'item2' },
            { itemId: 'item2' },
        ] as any as NewSaleItem[];
        const result = findNonUniqueItemIds(items);
        expect(result).toEqual(['item1', 'item2']);
    });
});
