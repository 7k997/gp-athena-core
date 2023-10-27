import * as alt from 'alt-server';
import Database from '@stuyk/ezmongodb';
import * as Athena from '@AthenaServer/api/index.js';
import { ItemDrop, StoredItem } from '@AthenaShared/interfaces/item.js';
import { deepCloneObject } from '@AthenaShared/utility/deepCopy.js';
import { Config } from '@AthenaPlugins/gp-athena-overrides/shared/config.js';

type UnpushedItemDrop = Omit<ItemDrop, '_id'>;

const DEFAULT_EXPIRATION = Config.DROP_DEFAULT_EXPIRATION;
const drops: Map<unknown, ItemDrop> = new Map();
const markAsTaken: { [key: string]: boolean } = {};

export type ItemDropInit = (itemDrop: ItemDrop) => Promise<ItemDrop>;
export type ItemDropAppendInjection = (itemDrop: StoredItem) => Promise<StoredItem>;
export type ItemDropRemoveInjection = (itemDrop: ItemDrop) => Promise<boolean>;
export type ItemDropUpdateInjection = (itemDrop: ItemDrop) => Promise<ItemDrop>;

const InitInjections: Array<ItemDropInit> = [];
const AppendInjections: Array<ItemDropAppendInjection> = [];
const RemoveInjections: Array<ItemDropRemoveInjection> = [];
const UpdateInjections: Array<ItemDropUpdateInjection> = [];

export function addInitInjection(callback: ItemDropInit) {
    InitInjections.push(callback);
}

export function addAppendInjection(callback: ItemDropAppendInjection) {
    AppendInjections.push(callback);
}

export function addRemoveInjection(callback: ItemDropRemoveInjection) {
    RemoveInjections.push(callback);
}

export function addUpdateInjection(callback: ItemDropUpdateInjection) {
    UpdateInjections.push(callback);
}

/**
 * Initialize all item drops stored in the database.
 *
 */
async function init() {
    await Database.createCollection(Athena.database.collections.Drops);

    const results = await Database.fetchAllData<ItemDrop>(Athena.database.collections.Drops);
    for (let i = 0; i < results.length; i++) {
        results[i]._id = String(results[i]._id);

        for (const callback of InitInjections) {
            try {
                results[i] = await callback(results[i]);
            } catch (err) {
                console.warn(`Got Itemdrop Init Injection Error: ${err}`);
                continue;
            }
        }

        drops.set(results[i]._id, results[i]);
        Athena.controllers.itemDrops.append(results[i]);
        markAsTaken[String(results[i]._id)] = false;
    }

    alt.setInterval(cleanUpExpiredDrops, Config.DROP_EXPIRATION_INTERVAL);
}

/**
 * Adds a new item drop to the database.
 *
 * @param {StoredItem} storedItem
 * @return {Promise<ItemDrop>}
 */
async function addToDatabase(storedItem: UnpushedItemDrop): Promise<ItemDrop> {
    storedItem = deepCloneObject<UnpushedItemDrop>(storedItem);
    const document = await Database.insertData<UnpushedItemDrop>(storedItem, Athena.database.collections.Drops, true);

    const convertedDoc = <ItemDrop>document;
    convertedDoc._id = String(convertedDoc._id);
    markAsTaken[String(convertedDoc._id)] = false;
    drops.set(convertedDoc._id, convertedDoc);
    return convertedDoc;
}

/**
 * Updates a item drop in the database.
 *
 * @param {StoredItem} storedItem
 * @return {Promise<ItemDrop>}
 */
async function updateToDatabase(itemDrop: ItemDrop, item: UnpushedItemDrop): Promise<boolean> {
    const updated = await Database.updatePartialData(
        itemDrop._id.toString(),
        { data: item.data },
        Athena.database.collections.Drops,
    );
    if (!updated) return false;

    const refeshedItemDrop = await Database.fetchData<ItemDrop>(
        '_id',
        itemDrop._id.toString(),
        Athena.database.collections.Drops,
    );
    if (!refeshedItemDrop) return false;

    markAsTaken[String(itemDrop._id)] = false;

    // Find the index of the item drop in the array
    const drop = drops.get(itemDrop._id);

    if (drop) {
        // Update the object in the array with the new item drop data
        drops.set(itemDrop._id, { ...drop, ...refeshedItemDrop });

        Athena.controllers.itemDrops.update(refeshedItemDrop);
        return true;
    } else {
        return false; // Item drop not found in the array
    }
}

/**
 * Simply tries to remove an entry from the database.
 *
 * @param {string} id
 */
async function removeFromDatabase(id: string) {
    await Database.deleteById(id, Athena.database.collections.Drops);
}

/**
 * Add a dropped item.
 *
 * @param {StoredItem} item
 * @param {alt.IVector3} pos A position in the world.
 * @return {Promise<string>}
 */
export async function add(
    item: StoredItem,
    pos: alt.IVector3,
    rot: alt.IVector3,
    dimension: number,
    player: alt.Player = undefined,
    collision: boolean = true,
    frozen: boolean = true,
    expiration?: number,
    maxDistance: number = Config.DEFAULT_STREAMING_DISTANCE,
    maxDistancePickup: number = Config.DEFAULT_PICKUP_DISTANCE,
): Promise<string> {
    if (Overrides.add) {
        return await Overrides.add(item, pos, rot, dimension, player);
    }

    const baseItem = Athena.systems.inventory.factory.getBaseItem(item.dbName);
    if (typeof baseItem === 'undefined') {
        return undefined;
    }

    if (baseItem.behavior && !baseItem.behavior.canDrop) {
        return undefined;
    }

    if (expiration !== 0) {
        expiration =
            typeof baseItem.msTimeout === 'number' ? Date.now() + baseItem.msTimeout : Date.now() + DEFAULT_EXPIRATION;
    }

    item.isEquipped = false;

    for (const callback of AppendInjections) {
        try {
            item = await callback(item);
        } catch (err) {
            console.warn(`Got Itemdrop Append Injection Error: ${err}`);
            continue;
        }
    }

    const document = await addToDatabase({
        ...item,
        name: baseItem.name,
        pos: pos,
        expiration: expiration,
        model: baseItem.model,
        dimension: dimension,
        collision: collision,
        frozen: frozen,
        maxDistance: maxDistance,
        maxDistancePickup: maxDistancePickup,
    });

    Athena.controllers.itemDrops.append(document);

    if (typeof player !== 'undefined') {
        Athena.player.events.trigger('drop-item', player, item);
        Athena.systems.inventory.events.invoke(player, 'onDrop', item.dbName, item.slot);
    }

    return document._id as string;
}

/**
 * Update a dropped item.
 *
 * @param {StoredItem} item
 * @param {alt.IVector3} pos A position in the world.
 * @return {Promise<string>}
 */
export async function update(itemDrop: ItemDrop, item: UnpushedItemDrop): Promise<boolean> {
    for (const callback of UpdateInjections) {
        try {
            itemDrop = await callback(itemDrop);
        } catch (err) {
            console.warn(`Got Itemdrop Append Injection Error: ${err}`);
            continue;
        }
    }
    return updateToDatabase(itemDrop, item);
}

/**
 * Get the current item drop.
 *
 * @param {string} id
 * @return {(ItemDrop | undefined)}
 */
export function get(id: string): ItemDrop | undefined {
    if (Overrides.get) {
        return Overrides.get(id);
    }

    return drops.get(id);
}

export async function cleanUpExpiredDrops() {
    if (Config.DISABLE_OBJECT_DROP_EXPIRATION) return;

    for (const drop of drops.values()) {
        if (drop.expiration !== 0 && Date.now() > drop.expiration) {
            await sub(drop._id as string);
        }
    }
}

/**
 * Remove the dropped item based on identifier.
 *
 * @param {string} id
 * @return {(Promise<StoredItem | undefined>)}
 */
export async function sub(id: string): Promise<StoredItem | undefined> {
    if (Overrides.sub) {
        return Overrides.sub(id);
    }

    alt.logWarning('Sub item drop!!!!: ' + id);
    let itemClone: StoredItem = undefined;

    let remove = true;
    for (const callback of RemoveInjections) {
        try {
            remove = await callback(drops.get(id));
        } catch (err) {
            console.warn(`Got Itemdrop Remove Injection Error: ${err}`);
            continue;
        }
    }
    if (!remove) return null;

    delete markAsTaken[id];

    Athena.controllers.itemDrops.remove(id);
    alt.logWarning('Sub item drop 1: ' + id);
    alt.logWarning('Sub item drop 2: ' + JSON.stringify(drops.get(id)));
    const newItem = deepCloneObject<ItemDrop>(drops.get(id));
    drops.delete(id);
    await removeFromDatabase(id);
    delete newItem._id;
    delete newItem.pos;
    delete newItem.expiration;
    delete newItem.pos;
    delete newItem.name;
    delete newItem.frozen;
    delete newItem.collision;
    delete newItem.maxDistance;
    delete newItem.maxDistancePickup;
    itemClone = newItem;

    return itemClone;
}

/**
 * Check if an item is available by database id
 *
 *
 * @param {string} _id
 * @return {void}
 */
export function isItemAvailable(_id: string) {
    if (Overrides.isItemAvailable) {
        return Overrides.isItemAvailable(_id);
    }

    return typeof markAsTaken[_id] !== 'undefined' && markAsTaken[_id] === false;
}

/**
 * Mark an item as being taken
 *
 *
 * @param {string} _id
 * @param {boolean} value
 */
export function markForTaken(_id: string, value: boolean) {
    markAsTaken[_id] = value;
}

interface DropFuncs {
    add: typeof add;
    get: typeof get;
    sub: typeof sub;
    isItemAvailable: typeof isItemAvailable;
    markForTaken: typeof markForTaken;
}

const Overrides: Partial<DropFuncs> = {};

export function override(functionName: 'add', callback: typeof add);
export function override(functionName: 'get', callback: typeof get);
export function override(functionName: 'sub', callback: typeof sub);
export function override(functionName: 'isItemAvailable', callback: typeof isItemAvailable);
export function override(functionName: 'markForTaken', callback: typeof markForTaken);
/**
 * Used to override inventory drop item functionality
 *
 *
 * @param {keyof DropFuncs} functionName
 * @param {*} callback
 */
export function override(functionName: keyof DropFuncs, callback: any): void {
    Overrides[functionName] = callback;
}

init();
