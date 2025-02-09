import * as alt from 'alt-server';
import Database from '@stuyk/ezmongodb';
import * as Athena from '@AthenaServer/api/index.js';

import { BaseItem, StoredItem, Item, DefaultItemBehavior, ItemDrop } from '@AthenaShared/interfaces/item.js';
import { deepCloneObject } from '@AthenaShared/utility/deepCopy.js';
import { sha256 } from '@AthenaServer/utility/hash.js';

let databaseItems: Array<BaseItem<DefaultItemBehavior, {}>> = [];
let isDoneLoading = false;

const InternalFunctions = {
    async init() {
        await Database.createCollection(Athena.database.collections.Items);
        databaseItems = await Database.fetchAllData<BaseItem>(Athena.database.collections.Items);

        // Convert all MongoDB _id entries to strings.
        for (let i = 0; i < databaseItems.length; i++) {
            databaseItems[i]._id = databaseItems[i]._id.toString();
        }

        isDoneLoading = true;
    },
};

//Corechange: shared-items plugin
export function getDataBaseItems(): BaseItem<DefaultItemBehavior, {}>[] {
    return databaseItems;
}

//Corechange: shared-items plugin
export async function getDataBaseItemsAsync(): Promise<BaseItem<DefaultItemBehavior, {}>[]> {
    await isDoneLoadingAsync();
    return databaseItems;
}

/**
 * Wait until the `isDoneLoading` variable is set to `true` before continuing.
 */
export async function isDoneLoadingAsync(): Promise<void> {
    return new Promise((resolve: Function) => {
        const interval = alt.setInterval(() => {
            if (!isDoneLoading) {
                return;
            }

            alt.clearInterval(interval);
            resolve();
        }, 0);
    });
}

/**
 * Get a base item based on dbName, and version if supplied.
 *
 * @template CustomData
 * @template CustomBehavior
 * @param {string} dbName
 * @param {number} [version=undefined]
 * @return {(BaseItem<DefaultItemBehavior & CustomBehavior, CustomData>)}
 */
export async function getBaseItemAsync<CustomData = {}, CustomBehavior = {}>(
    dbName: string,
    version: number = undefined,
): Promise<BaseItem<DefaultItemBehavior & CustomBehavior, CustomData>> {
    await isDoneLoadingAsync();

    if (Overrides.getBaseItemAsync) {
        return await Overrides.getBaseItemAsync<CustomData, CustomBehavior>(dbName, version);
    }

    let matchingItems = databaseItems.filter((item) => item.dbName === dbName);
    if(matchingItems.length > 0) {
        // Corechange: Get newest version if no version defined
        if (version === undefined) {
            matchingItems.sort((a, b) => b.version - a.version);
            version = matchingItems[0].version; 
        }

        const index = matchingItems.findIndex((item) => item.version === version);
        return deepCloneObject<BaseItem<DefaultItemBehavior & CustomBehavior, CustomData>>(matchingItems[index]);
    } else {
        alt.logWarning(`Could not find item with dbName: ${dbName} in getBaseItemAsync`);
        return undefined;
    }
}

/**
 * Updates or inserts a new database item into the database.
 *
 * If a verison is specified and it does not find a matching version it will add a new item.
 *
 * If a version is not specified; it will find a non-versioned item to replace.
 *
 * #### Example
 * ```ts
 * Athena.systems.inventory.factory.upsertAsync({
 *     dbName: 'burger',
 *     data: { health: 5 },
 *     icon: 'burger',
 *     name: 'Burger',
 *     maxStack: 8,
 *     weight: 25,
 *     behavior: {
 *         canDrop: true,
 *         canStack: true,
 *         canTrade: true,
 *         destroyOnDrop: false,
 *         isToolbar: true
 *     },
 *     consumableEventToCall: 'edible',
 *     customEventsToCall: [
 *          {
 *              name: 'Desconstruct',
 *              eventToCall: 'deconstruct-item-ingredients'
 *          }
 *    ]
 * });
 * ```
 *
 * @param {BaseItem} baseItem
 */
export async function upsertAsync(baseItem: BaseItem) {
    await isDoneLoadingAsync();

    if (Overrides.upsertAsync) {
        return await Overrides.upsertAsync(baseItem);
    }

    const index = databaseItems.findIndex((item) => {
        const hasMatchingName = item.dbName === baseItem.dbName;

        if (!hasMatchingName) {
            return false;
        }

        const hasMatchingVersion = item.version === baseItem.version;
        if (!hasMatchingVersion) {
            return false;
        }

        return true;
    });

    // Create New Item Entry
    if (index <= -1) {
        const document = await Database.insertData<BaseItem>(baseItem, Athena.database.collections.Items, true);

        document._id = document._id.toString();
        databaseItems.push(document);
        return;
    }

    const itemClone = deepCloneObject<BaseItem>(databaseItems[index]);
    delete itemClone._id;

    const hash1 = sha256(JSON.stringify(itemClone));
    const hash2 = sha256(JSON.stringify(baseItem));

    if (hash1 === hash2) {
        return;
    }

    // Update Existing Item
    await Database.updatePartialData(databaseItems[index]._id.toString(), baseItem, Athena.database.collections.Items);
    databaseItems[index] = deepCloneObject<BaseItem>({ ...databaseItems[index], ...baseItem });
}

/**
 * Converts an item from a player inventory, equipment, or toolbar to a full item set.
 *
 * Also performs weight calculations.
 *
 * @template CustomData
 * @template CustomBehavior
 * @param {StoredItem<CustomData>} item
 * @return {(Item<CustomBehavior & DefaultItemBehavior, CustomData> | undefined)}
 */
export async function fromStoredItemAsync<CustomData = {}, CustomBehavior = {}>(
    item: StoredItem<CustomData>,
): Promise<Item<CustomBehavior & DefaultItemBehavior, CustomData> | undefined> {
    await isDoneLoadingAsync();

    if (Overrides.fromStoredItemAsync) {
        return await Overrides.fromStoredItemAsync<CustomData, CustomBehavior>(item);
    }

    const baseItem = await getBaseItemAsync<CustomData, CustomBehavior>(item.dbName, item.version);
    if (typeof baseItem === 'undefined') {
        return undefined;
    }

    const combinedItem = Object.assign(baseItem, item) as Item<CustomBehavior & DefaultItemBehavior, CustomData>;

    if (typeof combinedItem.weight === 'number') {
        combinedItem.totalWeight = combinedItem.weight * combinedItem.quantity;
    }

    return combinedItem;
}

/**
 * Converts a full item, into a storeable version of the item.
 *
 * Only certain parts of the item will be stored.
 *
 * @template CustomData
 * @param {Item<DefaultItemBehavior, CustomData>} item
 * @return {StoredItem<CustomData>}
 */
export async function toStoredItemAsync<CustomData = {}>(
    item: Item<DefaultItemBehavior, CustomData>,
): Promise<StoredItem<CustomData>> {
    await isDoneLoadingAsync();

    if (Overrides.toStoredItem) {
        return await Overrides.toStoredItem<CustomData>(item);
    }

    const storedItem: StoredItem<CustomData> = {
        dbName: item.dbName,
        data: item.data,
        quantity: item.quantity,
        slot: item.slot,
    };

    if (typeof item.weight === 'number') {
        item.totalWeight = item.quantity * item.weight;
    }

    if (typeof item.version !== 'undefined') {
        storedItem.version = item.version;
    }

    return storedItem;
}

/**
 * Converts a base item to a stored item asynchronously.
 *
 *
 * @template CustomData
 * @param {BaseItem<DefaultItemBehavior, CustomData>} baseItem
 * @param {number} quantity
 * @return {Promise<StoredItem<CustomData>>}
 */
export async function fromBaseToStoredAsync<CustomData = {}>(
    baseItem: BaseItem<DefaultItemBehavior, CustomData>,
    quantity: number,
): Promise<StoredItem<CustomData>> {
    await isDoneLoadingAsync();

    if (Overrides.fromBaseToStoredAsync) {
        return await Overrides.fromBaseToStoredAsync<CustomData>(baseItem, quantity);
    }

    const storedItem: StoredItem<CustomData> = {
        dbName: baseItem.dbName,
        data: baseItem.data,
        quantity: quantity,
        slot: -1,
    };

    if (typeof baseItem.weight === 'number') {
        storedItem.totalWeight = quantity * baseItem.weight;
    }

    if (typeof baseItem.version !== 'undefined') {
        storedItem.version = baseItem.version;
    }

    return storedItem;
}

/**
 * Get a base item based on dbName, and version if supplied.
 *
 * Does not wait for database of items to load first.
 *
 * Use when usage is not at server-start.
 *
 * @template CustomData
 * @template CustomBehavior
 * @param {string} dbName
 * @param {number} [version=undefined]
 * @return {(BaseItem<DefaultItemBehavior & CustomBehavior, CustomData>)}
 */
export function getBaseItem<CustomData = {}, CustomBehavior = {}>(
    dbName: string,
    version: number = undefined,
): BaseItem<DefaultItemBehavior & CustomBehavior, CustomData> {
    if (Overrides.getBaseItem) {
        return Overrides.getBaseItem<CustomData, CustomBehavior>(dbName, version);
    }

    let matchingItems = databaseItems.filter((item) => item.dbName === dbName);
    if(matchingItems.length > 0) {
        // Corechange: Get newest version if no version defined
        if (version === undefined) {
            matchingItems.sort((a, b) => b.version - a.version);
            version = matchingItems[0].version; 
        }

        const index = matchingItems.findIndex((item) => item.version === version);
        return deepCloneObject<BaseItem<DefaultItemBehavior & CustomBehavior, CustomData>>(matchingItems[index]);
    } else {
        return undefined;
    }

}

// export function applyBeforeInjections(functionName: string, item: any): any {
//     const injections = BeforeInjections[functionName];
//     if (injections) {
//         injections.forEach((injectionFn) => {
//             item = injectionFn(item);
//         });
//     }
//     return item;
// }

// export function applyAfterInjections(functionName: string, item: any): any {
//     const injections = BeforeInjections[functionName];
//     if (injections) {
//         injections.forEach((injectionFn) => {
//             item = injectionFn(item);
//         });
//     }
//     return item;
// }

/**
 * Converts an item from a player inventory, or toolbar to a full item set.
 *
 * Also performs weight calculations.
 *
 * Use when usage is not at server-start.
 *
 * @template CustomData
 * @template CustomBehavior
 * @param {StoredItem<CustomData>} item
 * @return {(Item<CustomBehavior & DefaultItemBehavior, CustomData> | undefined)}
 */
export function fromStoredItem<CustomData = {}, CustomBehavior = DefaultItemBehavior>(
    item: StoredItem<CustomData>,
): Item<CustomBehavior & DefaultItemBehavior, CustomData> | undefined {
    if (Overrides.fromStoredItem) {
        return Overrides.fromStoredItem<CustomData, CustomBehavior>(item);
    }

    item = fromStoredItem_BeforeInjection<CustomData, CustomBehavior>('fromStoredItem_BeforeInjection', item);

    const baseItem = getBaseItem<CustomData, CustomBehavior>(item.dbName, item.version);
    if (typeof baseItem === 'undefined') {
        return undefined;
    }

    let combinedItem = Object.assign(baseItem, item) as Item<CustomBehavior & DefaultItemBehavior, CustomData>;

    if (typeof baseItem.weight === 'number') {
        combinedItem.totalWeight = baseItem.weight * combinedItem.quantity;
    }

    combinedItem = fromStoredItem_AfterInjection<CustomData, CustomBehavior>(
        'fromStoredItem_AfterInjection',
        combinedItem,
    );

    return combinedItem;
}

export function fromStoredItem_BeforeInjection<CustomData = {}, CustomBehavior = DefaultItemBehavior>(
    functionName: string,
    item: StoredItem<CustomData>,
): StoredItem<CustomData> {
    const injections = Injections[functionName];
    if (injections) {
        injections.forEach((injectionFn) => {
            item = injectionFn(functionName, item);
        });
    }
    return item;
}

export function fromStoredItem_AfterInjection<CustomData = {}, CustomBehavior = DefaultItemBehavior>(
    functionName: string,
    item: Item<CustomBehavior & DefaultItemBehavior, CustomData>,
): Item<CustomBehavior & DefaultItemBehavior, CustomData> {
    const injections = Injections[functionName];
    if (injections) {
        injections.forEach((injectionFn) => {
            item = injectionFn(functionName, item);
        });
    }
    return item;
}

/**
 * Converts a full item, into a storeable version of the item.
 *
 * Only certain parts of the item will be stored.
 *
 * Use when usage is not at server-start.
 *
 * @template CustomData
 * @param {Item<DefaultItemBehavior, CustomData>} item
 * @return {StoredItem<CustomData>}
 */
export function toStoredItem<CustomData = {}>(item: Item<DefaultItemBehavior, CustomData>): StoredItem<CustomData> {
    if (Overrides.toStoredItem) {
        return Overrides.toStoredItem<CustomData>(item);
    }

    // item = applyBeforeInjections('toStoredItem', item);

    let storedItem: StoredItem<CustomData> = {
        dbName: item.dbName,
        data: item.data,
        quantity: item.quantity,
        slot: item.slot,
    };

    if (typeof item.weight === 'number') {
        item.totalWeight = item.quantity * item.weight;
    }

    if (typeof item.version !== 'undefined') {
        storedItem.version = item.version;
    }

    // storedItem = applyAfterInjections('fromStoredItem', storedItem);

    return storedItem;
}

/**
 * Converts a base item into a stored item for reference.
 *
 *
 * @template CustomData
 * @param {BaseItem<DefaultItemBehavior, CustomData>} baseItem
 * @param {number} quantity
 * @return {void}
 */
export function fromBaseToStored<CustomData = {}>(
    baseItem: BaseItem<DefaultItemBehavior, CustomData>,
    quantity: number,
): StoredItem<CustomData> {
    if (Overrides.fromBaseToStored) {
        return Overrides.fromBaseToStored(baseItem, quantity);
    }

    const storedItem: StoredItem<CustomData> = {
        dbName: baseItem.dbName,
        data: baseItem.data,
        quantity: quantity,
        slot: -1,
    };

    if (typeof baseItem.weight === 'number') {
        storedItem.totalWeight = quantity * baseItem.weight;
    }

    if (typeof baseItem.version !== 'undefined') {
        storedItem.version = baseItem.version;
    }

    return storedItem;
}

/**
 * Converts a droped item into a stored item for reference.
 *
 *
 * @template CustomData
 * @param {ItemDrop} ItemDrop
 * @return {void}
 */
export function fromDropedToStored<CustomData = {}>(dropedItem: ItemDrop): StoredItem<CustomData> {
    return deepCloneObject<StoredItem<CustomData>>(dropedItem);
}

/**
 * Waits for the database items to finish loading before returning data.
 *
 * @export
 * @return {Promise<Array<BaseItem>>}
 */
export async function getBaseItemsAsync(): Promise<Array<BaseItem>> {
    if (Overrides.getBaseItemsAsync) {
        return getBaseItemsAsync();
    }

    await isDoneLoadingAsync();
    return databaseItems;
}

/**
 * Does not wait for items to load, returns what base items are in the array.
 *
 * Use this only during runtime; and not during startup.
 *
 * @export
 * @return {Array<BaseItem>}
 */
export function getBaseItems(): Array<BaseItem> {
    if (Overrides.getBaseItems) {
        return getBaseItems();
    }

    return databaseItems;
}

/**
 * Searches for a base item based on a fuzzy search.
 * Specify either 'myitem', 'My_Item', or 'My Item'.
 *
 * Will try to find a match in the following order:
 * - Exact dbname
 * - Exact name
 * - Partial name
 * - Partial dbname
 * @export
 * @template CustomData
 * @param {string} partialName
 * @return {(BaseItem<DefaultItemBehavior, CustomData> | undefined)}
 */
export function getBaseItemByFuzzySearch<CustomData = {}>(
    partialName: string,
): BaseItem<DefaultItemBehavior, CustomData> | undefined {
    const dbName = partialName;
    partialName = partialName.replaceAll('_', ' ');

    const index = databaseItems.findIndex((item) => {
        // 'myitem' -> 'myitem'
        if (item.dbName === dbName) {
            return true;
        }

        // 'My_Item' -> 'My Item'
        if (item.name === partialName) {
            return true;
        }

        // 'My_It' -> 'My Item'
        if (item.name.includes(partialName)) {
            return true;
        }

        // 'myi' -> 'myitem'
        if (item.dbName.includes(partialName)) {
            return true;
        }

        return false;
    });

    if (index <= -1) {
        return undefined;
    }

    return deepCloneObject<BaseItem<DefaultItemBehavior, CustomData>>(databaseItems[index]);
}

/**
 * Find all dynamic added items.
 * 
 * 
 **/

export async function findDynamicBaseItems<CustomData = {}, CustomBehavior = {}>(): Promise<Array<BaseItem<DefaultItemBehavior & CustomBehavior, CustomData>> | undefined> {

    await isDoneLoadingAsync();

    const items = databaseItems.filter((item) => item.dynamic === true);
    if (items.length <= 0) {
        return undefined;
    }

    return deepCloneObject<BaseItem<DefaultItemBehavior & CustomBehavior, CustomData>[]>(items);
}

interface FactoryFuncs {
    getBaseItemAsync: typeof getBaseItemAsync;
    upsertAsync: typeof upsertAsync;
    fromStoredItemAsync: typeof fromStoredItemAsync;
    fromBaseToStoredAsync: typeof fromBaseToStoredAsync;
    getBaseItem: typeof getBaseItem;
    fromStoredItem: typeof fromStoredItem;
    toStoredItem: typeof toStoredItem;
    fromBaseToStored: typeof fromBaseToStored;
    getBaseItemsAsync: typeof getBaseItemsAsync;
    getBaseItems: typeof getBaseItems;
    getBaseItemByFuzzySearch: typeof getBaseItemByFuzzySearch;
    findDynamicBaseItems: typeof findDynamicBaseItems;
}

interface FactoryInjections {
    fromStoredItem_BeforeInjection: typeof fromStoredItem_BeforeInjection;
    fromStoredItem_AfterInjection: typeof fromStoredItem_AfterInjection;
}

const Overrides: Partial<FactoryFuncs> = {};
const Injections: { [key: string]: Array<Function> } = {};

export function override(functionName: 'getBaseItemAsync', callback: typeof getBaseItemAsync);
export function override(functionName: 'upsertAsync', callback: typeof upsertAsync);
export function override(functionName: 'fromStoredItemAsync', callback: typeof fromStoredItemAsync);
export function override(functionName: 'fromBaseToStoredAsync', callback: typeof fromBaseToStoredAsync);
export function override(functionName: 'getBaseItem', callback: typeof getBaseItem);
export function override(functionName: 'fromStoredItem', callback: typeof fromStoredItem);
export function override(functionName: 'toStoredItem', callback: typeof toStoredItem);
export function override(functionName: 'fromBaseToStored', callback: typeof fromBaseToStored);
export function override(functionName: 'getBaseItems', callback: typeof getBaseItems);
export function override(functionName: 'getBaseItemsAsync', callback: typeof getBaseItemsAsync);
export function override(functionName: 'getBaseItemByFuzzySearch', callback: typeof getBaseItemByFuzzySearch);

/**
 * Used to override inventory item factory functionality
 *
 *
 * @param {keyof FactoryFuncs} functionName
 * @param {*} callback
 */
export function override(functionName: keyof FactoryFuncs, callback: any): void {
    Overrides[functionName] = callback;
}

export function addInjection(
    functionName: 'fromStoredItem_BeforeInjection',
    callback: typeof fromStoredItem_BeforeInjection,
);
export function addInjection(
    functionName: 'fromStoredItem_AfterInjection',
    callback: typeof fromStoredItem_AfterInjection,
);

/**
 * Used to inject functionality into inventory item factory
 *
 * @param {keyof FactoryFuncs} functionName
 * @param {*} callback
 */
export function addInjection(functionName: keyof FactoryInjections, callback: any): void {
    if (!Injections[functionName]) {
        Injections[functionName] = [];
    }
    Injections[functionName].push(callback);
}



InternalFunctions.init();
