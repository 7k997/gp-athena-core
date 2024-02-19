import * as alt from 'alt-server';
import { StoredItem, StoredItemEx } from '@AthenaShared/interfaces/item.js';
import { InventoryType } from './manager.js';
import { DualSlotInfo } from '@AthenaPlugins/core-inventory/shared/interfaces.js';
import { Config } from '@AthenaPlugins/gp-athena-overrides/shared/config.js';

const anyDbNamePlaceholder = 'any1sd2f3g4h5j6k7l8';

type StoredItemInjections = ((player: alt.Player, item: StoredItem, info: DualSlotInfo) => Promise<StoredItem>)[];

type StoredItemCallbacks = ((player: alt.Player, item: StoredItem, info: DualSlotInfo) => void)[];

const InjectionList: { [key: string]: { [dbName: string]: StoredItemInjections } } = {
    // Before Injections:
    // Use to modify the item before it has been swapped internally.
    // You can also modify the storages here. TODO: Issue on drag and drop slots maybe already in use.

    //Modify source item, but not the storages.
    'before-combine': {},
    'before-swap': {},
    'before-swap-to-inventory': {},
    'before-swap-from-toolbar-to-inventory': {},
    'before-equip': {}, //NOT IMPLEMENTED
    'before-unequip': {},

    //TODO unequip from toolbar.

    // After Injections:
    // Use to modify the item after it has been swapped internally. You can get the target slot from the item.
    // But you cannot modify any of the storages because it will overritten by the swap, finally.

    //Modify target item, but not the storages.
    'after-combine': {},
    'after-swap': {},
    'after-swap-to-inventory': {},
    'after-swap-from-toolbar-to-inventory': {},

    //You can modify storages after swap completed
    // 'after-combine': {},
    // 'after-swap': {},
    // 'after-swap-to-inventory': {},
    // 'after-swap-from-toolbar-to-inventory': {},
};

const CallbackList: { [key: string]: { [dbName: string]: StoredItemCallbacks } } = {
    //Callbacks, use to listen to a specific item being swapped.
    'item-swap': {},
    'item-combine': {},
    'item-swap-to-toolbar': {},
    'item-swap-to-inventory': {},
    'item-swap-to-custom': {},
    'item-swap-from-inventory-to-toolbar': {},
    'item-swap-from-toolbar-to-inventory': {},
    'item-swap-from-toolbar-to-custom': {},
    'item-swap-from-inventory-to-custom': {},
    'item-equip': {}, //NOT IMPLEMENTED
    'item-unequip': {},
};

type InjectionEvents = keyof typeof InjectionList;
type Events = keyof typeof CallbackList;

/**
 * Invoke a specific event for listening to a specific item type being equipped / unequipped
 *
 * @export
 * @param {Events} event
 * @param {alt.Player} player
 * @param {StoredItem} item
 * @return {*}
 */
export function invoke(event: Events, sourceID: string, player: alt.Player, item: StoredItem, info: DualSlotInfo) {
    // alt.logWarning(`Invoking ${event}|${sourceID} from ${info.startType} to ${info.endType}`);
    //Autoinvoke
    if (event === 'item-swap') {
        if (info.endType === 'toolbar') {
            invoke('item-swap-to-toolbar', sourceID, player, item, info);
            if (info.startType === 'inventory') {
                invoke('item-swap-from-inventory-to-toolbar', sourceID, player, item, info);
            }
        } else if (info.endType === 'inventory') {
            invoke('item-swap-to-inventory', sourceID, player, item, info);

            if (info.startType === 'toolbar') {
                invoke('item-swap-from-toolbar-to-inventory', sourceID, player, item, info);
            }
        } else if (info.endType === 'custom') {
            invoke('item-swap-to-custom', sourceID, player, item, info);

            if (info.startType === 'toolbar') {
                invoke('item-swap-from-toolbar-to-custom', sourceID, player, item, info);
            }
        }
    } 

    if (!CallbackList[event] || !item) {
        return;
    }

    if (CallbackList[event][anyDbNamePlaceholder]) {
        for (let cb of CallbackList[event][anyDbNamePlaceholder]) {
            try {
                alt.logWarning(`Invoking ${event} from ${info.startType} to ${info.endType}, item: ${item.dbName}`);
                cb(player, item, info);
            } catch (err) {
                console.warn(`Got swap Invoke Error: ${err}`);
                continue;
            }
        }
    }

    if (!CallbackList[event][item.dbName] || CallbackList[event][item.dbName].length <= 0) {
        return;
    }

    for (let cb of CallbackList[event][item.dbName]) {
        try {
            cb(player, item, info);
        } catch (err) {
            console.warn(`Got swap Invoke Error: ${err}`);
            continue;
        }
    }
}

export async function invokeInjection(
    event: InjectionEvents,
    sourceID: string,
    player: alt.Player,
    item: StoredItem,
    info: DualSlotInfo,
): Promise<StoredItem> {
    if (Config.DEBUG) alt.logWarning(`Invoking ${event}|${sourceID} from ${info.startType} to ${info.endType}`);
    //Autoinvoke

    if (event === 'before-swap') {
        if (info.endType === 'inventory') {
            item = await invokeInjection('before-swap-to-inventory', sourceID, player, item, info);
            if (info.startType === 'toolbar') {
                item = await invokeInjection('before-swap-from-toolbar-to-inventory', sourceID, player, item, info);
            }
        }
    } else if (event === 'after-swap') {
        if (info.endType === 'inventory') {
            item = await invokeInjection('after-swap-to-inventory', sourceID, player, item, info);
            if (info.startType === 'toolbar') {
                item = await invokeInjection('after-swap-from-toolbar-to-inventory', sourceID, player, item, info);
            }
        }
    }

    if (!InjectionList[event] || !item) {
        return item;
    }

    if (InjectionList[event][anyDbNamePlaceholder]) {
        for (let cb of InjectionList[event][anyDbNamePlaceholder]) {
            try {
                item = await cb(player, item, info);
                if (item === null) return null;
            } catch (err) {
                console.warn(`Got swap Injection Error: ${err}`);
                continue;
            }
        }
    }

    if (!InjectionList[event][item.dbName] || InjectionList[event][item.dbName].length <= 0) {
        return item;
    }

    for (let cb of InjectionList[event][item.dbName]) {
        try {
            item = await cb(player, item, info);
            if (item === null) return null;
        } catch (err) {
            console.warn(`Got swap Injection Error: ${err}`);
            continue;
        }
    }

    return item;
}

/**
 * Listen for a when a specific item is equipped or unequipped
 *
 * @export
 * @template T
 * @param {Events} event
 * @param {string} dbName
 * @param {(player: alt.Player, item: StoredItemEx<T>) => void} cb
 * @return {*}
 */
export function on<T = {}>(
    event: Events,
    dbName: string,
    cb: (player: alt.Player, item: StoredItemEx<T>, info: DualSlotInfo) => void,
) {
    if (!CallbackList[event]) {
        return;
    }

    if (!CallbackList[event][dbName]) {
        CallbackList[event][dbName] = [];
    }

    CallbackList[event][dbName].push(cb);
}

/**
 * Listen for a when a random item is equipped or unequipped
 *
 * @export
 * @template T
 * @param {Events} event
 * @param {string} dbName
 * @param {(player: alt.Player, item: StoredItemEx<T>) => void} cb
 * @return {*}
 */
export function onAny<T = {}>(
    event: Events,
    cb: (player: alt.Player, item: StoredItemEx<T>, info: DualSlotInfo) => void,
) {
    if (!CallbackList[event]) {
        return;
    }

    if (!CallbackList[event][anyDbNamePlaceholder]) {
        CallbackList[event][anyDbNamePlaceholder] = [];
    }

    CallbackList[event][anyDbNamePlaceholder].push(cb);
}

/**
 * Injection used to modify a defined item before or after it is swapped.
 *
 * @param event
 * @param dbName
 * @param cb
 * @returns
 */
export function addInjection<T = {}>(
    event: InjectionEvents,
    dbName: string,
    cb: (player: alt.Player, item: StoredItemEx<T>, info: DualSlotInfo) => Promise<StoredItem>,
) {
    if (!InjectionList[event]) {
        return;
    }

    if (!InjectionList[event][dbName]) {
        InjectionList[event][dbName] = [];
    }

    InjectionList[event][dbName].push(cb);
}

/**
 * InjectionAny used to modify any item before or after it is swapped.
 *
 * @param event
 * @param dbName
 * @param cb
 * @returns
 */
export function addInjectionAny<T = {}>(
    event: InjectionEvents,
    cb: (player: alt.Player, item: StoredItemEx<T>, info: DualSlotInfo) => Promise<StoredItem>,
) {
    if (!InjectionList[event]) {
        return;
    }

    if (!InjectionList[event][anyDbNamePlaceholder]) {
        InjectionList[event][anyDbNamePlaceholder] = [];
    }

    InjectionList[event][anyDbNamePlaceholder].push(cb);
}
