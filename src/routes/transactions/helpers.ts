import { NewSaleItem } from '../../db/types';

export const findNonUniqueItemIds = (items: NewSaleItem[]) => {
    const itemIdMap = new Map<string, number>();
    const nonUniqueIds: string[] = [];

    // Iterate through the items and count occurrences of each id
    items.forEach(item => {
        const count = itemIdMap.get(item.itemId) || 0;
        itemIdMap.set(item.itemId, count + 1);
    });

    // Check which ids have duplicates
    itemIdMap.forEach((count, itemId) => {
        if (count > 1) {
            nonUniqueIds.push(itemId);
        }
    });

    return nonUniqueIds;
};
