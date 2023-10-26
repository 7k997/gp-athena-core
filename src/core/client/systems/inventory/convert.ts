import * as AthenaClient from '@AthenaClient/api/index.js';
import { BaseItemEx, ItemDrop, ItemEx, StoredItem, StoredItemEx } from '@AthenaShared/interfaces/item.js';
import { deepCloneObject } from '@AthenaShared/utility/deepCopy.js';

/**
 * Convert a Droped Item to a stored item
 *
 * Does not perform any inventory changes.
 *
 * @export
 * @template CustomData
 * @param {BaseItemEx<CustomData>} baseItem
 * @param {number} quantity
 * @return {*}
 */
export function toStoredItemFromDroped<CustomData = {}>(dropedItem: ItemDrop): StoredItem<CustomData> {
    return deepCloneObject<StoredItem<CustomData>>(dropedItem);
}

export function toItemExFromDroped<CustomData = {}>(dropedItem: ItemDrop): ItemEx<CustomData> {
    return deepCloneObject<ItemEx<CustomData>>(dropedItem);
}
