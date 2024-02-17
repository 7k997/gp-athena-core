import * as alt from 'alt-server';
import * as document from '@AthenaServer/document/index.js';
import * as Athena from '@AthenaServer/api/index.js';

import { StoredItem } from '@AthenaShared/interfaces/item.js';
import { deepCloneArray, deepCloneObject } from '@AthenaShared/utility/deepCopy.js';

/**
 * Add a new stored item to a user, must specify a quantity of greater than zero.
 * Toolbar only.
 *
 * @param {alt.Player} player An alt:V Player Entity
 * @param {Omit<StoredItem, 'slot'>} item
 * @return {Promise<boolean>}
 */
export async function add(player: alt.Player, item: Omit<StoredItem, 'slot'>): Promise<boolean> {
    if (Overrides.add) {
        return Overrides.add(player, item);
    }

    const data = document.character.get(player);
    if (typeof data === 'undefined') {
        return false;
    }

    const baseItem = Athena.systems.inventory.factory.getBaseItem(item.dbName, item.version);
    if (typeof baseItem === 'undefined') {
        return false;
    }

    if (typeof data.toolbar === 'undefined') {
        data.toolbar = [];
    }

    const newToolbarData = Athena.systems.inventory.manager.add(item, data.toolbar, 'toolbar');
    if (typeof newToolbarData === 'undefined') {
        return false;
    }

    await document.character.set(player, 'toolbar', newToolbarData);
    return true;
}
/**
 * Subtract a quantity of an item from a player's toolbar.
 * Toolbar only.
 *
 * @param {alt.Player} player An alt:V Player Entity
 * @param {Omit<StoredItem, 'slot'>} item
 * @return {Promise<boolean>}
 */
export async function sub(player: alt.Player, item: Omit<StoredItem, 'slot'>): Promise<boolean> {
    if (Overrides.sub) {
        return Overrides.sub(player, item);
    }

    const data = document.character.get(player);
    if (typeof data === 'undefined') {
        return false;
    }

    if (typeof data.toolbar === 'undefined') {
        return false;
    }

    const newToolbarData = Athena.systems.inventory.manager.sub(item, data.toolbar);
    if (typeof newToolbarData === 'undefined') {
        return false;
    }

    await document.character.set(player, 'toolbar', newToolbarData);
    return true;
}

/**
 * Delete an item in a specific slot in an toolbar data set.
 *
 * @param {alt.Player} player An alt:V Player Entity
 * @param {number} slot
 * @return {Promise<boolean>}
 */
export async function remove(player: alt.Player, slot: number): Promise<boolean> {
    if (Overrides.remove) {
        return Overrides.remove(player, slot);
    }

    const data = document.character.get(player);
    if (typeof data === 'undefined') {
        return false;
    }

    if (typeof data.toolbar === 'undefined') {
        return false;
    }

    const newToolbarData = Athena.systems.inventory.slot.removeAt(slot, data.toolbar);
    if (typeof newToolbarData === 'undefined') {
        return false;
    }

    await document.character.set(player, 'toolbar', newToolbarData);
    return true;
}

/**
 * Verify that the player has at least 'x' of an item in their toolbar
 *
 *
 * @param {alt.Player} player An alt:V Player Entity
 * @param {string} baseItem
 * @return {void}
 */

//Corechange: Fixed the return type
export async function has(player: alt.Player, dbName: string, quantity: number, version = undefined): Promise<boolean> {
    if (Overrides.has) {
        return Overrides.has(player, dbName, quantity, version);
    }

    const data = document.character.get(player);
    if (typeof data === 'undefined') {
        return false;
    }

    if (typeof data.toolbar === 'undefined') {
        return false;
    }

    return Athena.systems.inventory.manager.hasItem(data.toolbar, dbName, quantity, version);
}

//Corechange: Added get by dbName
export function get<CustomData = {}>(
    player: alt.Player,
    dbName: string,
    version = undefined,
): StoredItem<CustomData> | null {
    const data = document.character.get(player);
    if (typeof data === 'undefined') {
        return null;
    }

    if (typeof data.toolbar === 'undefined') {
        return null;
    }

    const item = Athena.systems.inventory.manager.getItem(data.toolbar, dbName, version);
    if (!item) return null;
    
    return deepCloneObject<StoredItem<CustomData>>(item);
}

/**
 * Returns the custom item data assigned to a specific item.
 *
 * Will return undefined if the custom data is not available.
 *
 * Only checks the toolbar.
 *
 * #### Example
 * ```ts
 * const someData = Athena.player.toolbar.getItemData<{ myCustomStuff: string }>(somePlayer, someSlot);
 * ```
 *
 *
 * @template CustomData
 * @param {alt.Player} player An alt:V Player Entity
 * @param {number} slot
 * @return {CustomData}
 */
export function getItemData<CustomData = {}>(player: alt.Player, slot: number): CustomData | undefined {
    if (Overrides.getItemData) {
        return Overrides.getItemData(player, slot);
    }

    const data = document.character.get(player);
    if (typeof data === 'undefined') {
        return undefined;
    }

    if (typeof data.toolbar === 'undefined') {
        return undefined;
    }

    const index = data.toolbar.findIndex((x) => x.slot === slot);
    if (index <= -1) {
        return undefined;
    }

    return data.toolbar[index].data ? (data.toolbar[index].data as CustomData) : undefined;
}

/**
 * Find an item at a specific slot, and changes its entire custom data section.
 *
 * Think of this like an easy to use 'setter' for item data.
 *
 * Only checks the toolbar.
 *
 * #### Example
 * ```ts
 * const someData = Athena.player.toolbar.getItemData<{ myCustomStuff: string }>(somePlayer, someSlot);
 *
 * someData.myCustomStuff = 'Hello World!';
 *
 * await Athena.player.toolbar.modifyItemData<typeof someData>(player, someSlot, someData);
 * ```
 *
 *
 * @template CustomData
 * @param {alt.Player} player An alt:V Player Entity
 * @param {number} slot
 * @param {CustomData} data
 * @return {Promise<boolean>}
 */
export async function modifyItemData<CustomData = {}>(
    player: alt.Player,
    slot: number,
    customData: CustomData,
): Promise<boolean> {
    if (Overrides.modifyItemData) {
        return await Overrides.modifyItemData(player, slot, customData);
    }

    const data = document.character.get(player);
    if (typeof data === 'undefined') {
        return false;
    }

    if (typeof data.toolbar === 'undefined') {
        return false;
    }

    const toolbarRef = deepCloneArray<StoredItem>(data.toolbar);
    const index = toolbarRef.findIndex((x) => x.slot === slot);
    if (index <= -1) {
        return false;
    }

    toolbarRef[index].data = customData;
    await document.character.set(player, 'toolbar', toolbarRef);
    return true;
}

export async function updateItem<CustomData = {}>(
    player: alt.Player,
    slot: number,
    item: StoredItem<CustomData>,
): Promise<boolean> {
    const data = document.character.get(player);
    if (typeof data === 'undefined') {
        return false;
    }

    if (typeof data.toolbar === 'undefined') {
        return false;
    }

    const toolbarRef = deepCloneArray<StoredItem>(data.toolbar);
    const index = toolbarRef.findIndex((x) => x.slot === slot);
    if (index <= -1) {
        return false;
    }

    //Cleanup item
    delete item['_id'];
    delete item['pos'];
    delete item['expiration'];
    delete item['frozen'];
    delete item['collision'];
    delete item['maxDistance'];
    delete item['maxDistancePickup'];
    delete item['customEventsToCall'];
    delete item['behavior'];
    delete item.icon;
    delete item.description;

    toolbarRef[index] = item;
    await document.character.set(player, 'toolbar', toolbarRef);
    return true;
}

export async function updateItemPartial(player: alt.Player, slot: number, updatedItemData: Partial<StoredItem>): Promise<boolean> {
    const data = document.character.get(player);
    if (typeof data === 'undefined' || typeof data.toolbar === 'undefined') {
        return false;
    }

    const toolbarRef = deepCloneArray<StoredItem>(data.toolbar);
    const index = toolbarRef.findIndex((x) => x.slot === slot);

    if (index <= -1) {
        return false;
    }

    // Aktualisiere nur die übergebenen Eigenschaften des Items
    toolbarRef[index] = { ...toolbarRef[index], ...updatedItemData };

    await document.character.set(player, 'toolbar', toolbarRef);
    return true;
}

/**
 *
 * Returns an item from a specific slot.
 *
 * This item is cloned, and not attached to the toolbar.
 *
 * Never modify the item directly; this is only to get item information.
 *
 * #### Example
 * ```ts
 * const someData = Athena.player.toolbar.getAt<{ myCustomStuff: string }>(somePlayer, someSlot);
 * ```
 *
 *
 * @template CustomData
 * @param {alt.Player} player An alt:V Player Entity
 * @param {number} slot
 * @return {(StoredItem | undefined)}
 */
export function getAt<CustomData = {}>(player: alt.Player, slot: number): StoredItem<CustomData> | undefined {
    if (Overrides.getAt) {
        return Overrides.getAt<CustomData>(player, slot);
    }

    const data = document.character.get(player);
    if (typeof data === 'undefined') {
        return undefined;
    }

    if (typeof data.toolbar === 'undefined') {
        return undefined;
    }

    const item = Athena.systems.inventory.slot.getAt(slot, data.toolbar);
    if (typeof item === 'undefined') {
        return undefined;
    }

    return deepCloneObject<StoredItem<CustomData>>(item);
}

/**
 * Finds the index of the item in the toolbar array based on specific properties.
 *
 * @template CustomData - The type of data associated with the item.
 * @param {StoredItem<CustomData>[]} toolbar - The toolbar to search within.
 * @param {Partial<StoredItem<CustomData>>} searchCriteria - The criteria to search for.
 * @return {number} The index of the found item, or -1 if not found.
 */
export function findSlot<CustomData = {}>(
    player: alt.Player,
    searchCriteria: Partial<StoredItem<Partial<CustomData>>>,
): number {
    if (Overrides.findSlot) {
        return Overrides.findSlot<CustomData>(player, searchCriteria);
    }

    const data = document.character.get(player);
    if (typeof data === 'undefined' || typeof data.toolbar === 'undefined') {
        return -1;
    }

    for (let i = 0; i < data.toolbar.length; i++) {
        const item = deepCloneObject<StoredItem<CustomData>>(data.toolbar[i]);

        let isMatch = false; // Set isMatch to false by default

        // Check properties in data
        if (searchCriteria.data) {
            for (const dataProp in searchCriteria.data) {
                if (searchCriteria.data[dataProp] !== item.data[dataProp]) {
                    alt.logWarning(`1 Failed on ${dataProp}`);
                    isMatch = false;
                    break;
                } else {
                    alt.logWarning(
                        `1 Passed on ${dataProp}: ${searchCriteria.data[dataProp]} === ${item.data[dataProp]}`,
                    );
                    isMatch = true; // Set isMatch to true if a match is found
                }
            }
        }

        // Check other properties
        for (const prop in searchCriteria) {
            if (prop !== 'data') {
                if (searchCriteria[prop] !== item[prop]) {
                    alt.logWarning(`2 Failed on ${prop}`);
                    isMatch = false;
                    break;
                } else {
                    alt.logWarning(`2 Passed on ${prop}`);
                    isMatch = true; // Set isMatch to true if a match is found
                }
            }
        }

        if (isMatch) {
            return item.slot;
        }
    }

    return -1;
}

/**
 * Finds the indices of the items in the toolbar array based on specific properties.
 *
 * @template CustomData - The type of data associated with the item.
 * @param {alt.Player} player - The player whose toolbar to search within.
 * @param {Partial<StoredItem<Partial<CustomData>>>} searchCriteria - The criteria to search for.
 * @return {number[]} Array of indices of the found items, or an empty array if not found.
 */
export function findSlots<CustomData = {}>(
    player: alt.Player,
    searchCriteria: Partial<StoredItem<Partial<CustomData>>>,
): number[] {
    if (Overrides.findSlots) {
        return Overrides.findSlots<CustomData>(player, searchCriteria);
    }

    const data = document.character.get(player);
    if (typeof data === 'undefined' || typeof data.toolbar === 'undefined') {
        return [];
    }

    const matchingSlots: number[] = [];

    for (let i = 0; i < data.toolbar.length; i++) {
        const item = deepCloneObject<StoredItem<CustomData>>(data.toolbar[i]);

        let isMatch = false; // Set isMatch to false by default

        // Check properties in data
        if (searchCriteria.data) {
            for (const dataProp in searchCriteria.data) {
                if (searchCriteria.data[dataProp] !== item.data[dataProp]) {
                    isMatch = false;
                    break;
                } else {
                    isMatch = true; // Set isMatch to true if a match is found
                }
            }
        }

        // Check other properties
        for (const prop in searchCriteria) {
            if (prop !== 'data') {
                if (searchCriteria[prop] !== item[prop]) {
                    isMatch = false;
                    break;
                } else {
                    isMatch = true; // Set isMatch to true if a match is found
                }
            }
        }

        if (isMatch) {
            matchingSlots.push(item.slot);
        }
    }

    return matchingSlots;
}

interface ToolbarFunctions {
    add: typeof add;
    has: typeof has;
    get: typeof get;
    getAt: typeof getAt;
    sub: typeof sub;
    remove: typeof remove;
    modifyItemData: typeof modifyItemData;
    getItemData: typeof getItemData;
    findSlot: typeof findSlot;
    findSlots: typeof findSlots;
}

const Overrides: Partial<ToolbarFunctions> = {};

export function override(functionName: 'add', callback: typeof add);
export function override(functionName: 'has', callback: typeof has);
export function override(functionName: 'getAt', callback: typeof getAt);
export function override(functionName: 'remove', callback: typeof remove);
export function override(functionName: 'sub', callback: typeof sub);
export function override(functionName: 'modifyItemData', callback: typeof modifyItemData);
export function override(functionName: 'getItemData', callback: typeof getItemData);
export function override(functionName: 'findSlot', callback: typeof findSlot);
export function override(functionName: 'findSlots', callback: typeof findSlots);

/**
 * Used to override any toolbar functions
 *
 *
 * @param {keyof ToolbarFunctions} functionName
 * @param {*} callback
 */
export function override(functionName: keyof ToolbarFunctions, callback: any): void {
    Overrides[functionName] = callback;
}
