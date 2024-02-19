import * as Athena from '@AthenaServer/api/index.js';
import { InventoryType } from '@AthenaPlugins/core-inventory/shared/interfaces.js';
import { StoredItem } from '@AthenaShared/interfaces/item.js';
import { deepCloneArray } from '@AthenaShared/utility/deepCopy.js';
import * as config from './config.js';
import { Config } from '@AthenaPlugins/gp-athena-overrides/shared/config.js';

/**
 * Find an open slot that is available within a dataset.
 *
 *
 * @param {(InventoryType | number)} slotSize
 * @param {Array<StoredItem>} data
 * @param {number} [reservedSlot] A slot that is reserved for a specific item -> Do not use this slot.
 * @return {(number | undefined)}
 */
export function findOpen(slotSize: InventoryType | number, data: Array<StoredItem>, reservedSlot?: number ): number | undefined {
    if (Overrides.findOpen) {
        return Overrides.findOpen(slotSize, data);
    }

    if (typeof slotSize === 'string') {
        if (!config.get()[String(slotSize)]) {
            return undefined;
        }
    }

    const maxSlot = typeof slotSize === 'number' ? Number(slotSize) : config.get()[String(slotSize)].size;

    for (let i = 0; i < maxSlot; i++) {
        if(reservedSlot && reservedSlot === i) {
            continue;
        }
        const index = data.findIndex((x) => x.slot === i);
        if (index >= 0) {
            continue;
        }

        return i;
    }

    return undefined;
}

export function findStackable(item: StoredItem, data: Array<StoredItem>): number {
    if (item.id) return -1; //not stackable

    // Lookup the base item based on the dbName of the item.
    const baseItem = Athena.systems.inventory.factory.getBaseItem(item.dbName, item.version);
    if (typeof baseItem === 'undefined') {
        return undefined;
    }

    let actualMaxStack = baseItem.maxStack ? baseItem.maxStack : Config.ITEM_MAX_STACK;
    if (Config.ITEM_MAX_STACK_DISABLED) {
        actualMaxStack = Number.MAX_SAFE_INTEGER;
    }

    const index = data.findIndex((x) => x.dbName === item.dbName && !x.id && x.quantity < actualMaxStack);

    return index;
}

/**
 * Get an item at a specific slot.
 * Returns undefined if an item is unavailable in a slot.
 *
 * @param {number} slot
 * @param {Array<StoredItem>} data
 * @return {(StoredItem | undefined)}
 */
export function getAt<CustomData = {}>(slot: number, data: Array<StoredItem>): StoredItem<CustomData> | undefined {
    if (Overrides.getAt) {
        return Overrides.getAt<CustomData>(slot, data);
    }

    const index = data.findIndex((x) => x.slot === slot);
    if (index <= -1) {
        return undefined;
    }

    return data[index] as StoredItem<CustomData>;
}

/**
 * Remove a specific item from a specific slot.
 *
 * @param {number} slot
 * @param {Array<StoredItem>} data
 * @return {(Array<StoredItem> | undefined)} Returns undefined if the item was not found.
 */
export function removeAt(slot: number, data: Array<StoredItem>): Array<StoredItem> | undefined {
    if (Overrides.removeAt) {
        return Overrides.removeAt(slot, data);
    }

    const copyOfData = deepCloneArray<StoredItem>(data);
    const index = copyOfData.findIndex((x) => x.slot === slot);
    if (index <= -1) {
        return undefined;
    }

    copyOfData.splice(index, 1);
    return copyOfData;
}

interface SlotFuncs {
    findOpen: typeof findOpen;
    removeAt: typeof removeAt;
    getAt: typeof getAt;
}

const Overrides: Partial<SlotFuncs> = {};

export function override(functionName: 'findOpen', callback: typeof findOpen);
export function override(functionName: 'removeAt', callback: typeof removeAt);
export function override(functionName: 'getAt', callback: typeof getAt);
/**
 * Used to override inventory item slot functionality
 *
 *
 * @param {keyof SlotFuncs} functionName
 * @param {*} callback
 */
export function override(functionName: keyof SlotFuncs, callback: any): void {
    Overrides[functionName] = callback;
}
