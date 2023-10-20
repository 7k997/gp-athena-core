import * as alt from 'alt-server';
import { StoredItem, StoredItemEx } from '@AthenaShared/interfaces/item.js';
import { InventoryType } from './manager.js';

const anyDbNamePlaceholder = 'any1sd2f3g4h5j6k7l8';

type StoredItemInjections = ((player: alt.Player, item: StoredItem, fromType: InventoryType) => StoredItem)[];

type StoredItemCallbacks = ((player: alt.Player, item: StoredItem, fromType: InventoryType) => void)[];

const InjectionList: { [key: string]: { [dbName: string]: StoredItemInjections } } = {
    'before-drop': {},
    'after-drop': {},
};

const CallbackList: { [key: string]: { [dbName: string]: StoredItemCallbacks } } = {
    'item-drop': {},
    'item-drop-from-inventory': {},
    'item-drop-from-toolbar': {},
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
export function invoke(event: Events, player: alt.Player, item: StoredItem, fromType: InventoryType) {
    //Autoinvoke
    if (fromType === 'inventory' && event === 'item-drop') {
        invoke('item-drop-from-inventory', player, item, fromType);
    }

    if (fromType === 'toolbar' && event === 'item-drop') {
        invoke('item-drop-from-toolbar', player, item, fromType);
    }

    if (!CallbackList[event] || !item) {
        return;
    }

    if (CallbackList[event][anyDbNamePlaceholder]) {
        for (let cb of CallbackList[event][anyDbNamePlaceholder]) {
            try {
                cb(player, item, fromType);
            } catch (err) {
                console.warn(`Got drop Invoke Error: ${err}`);
                continue;
            }
        }
    }

    if (!CallbackList[event][item.dbName] || CallbackList[event][item.dbName].length <= 0) {
        return;
    }

    for (let cb of CallbackList[event][item.dbName]) {
        try {
            cb(player, item, fromType);
        } catch (err) {
            console.warn(`Got drop Invoke Error: ${err}`);
            continue;
        }
    }
}

export function invokeInjection(
    event: InjectionEvents,
    player: alt.Player,
    item: StoredItem,
    fromType: InventoryType,
): StoredItem {
    if (!InjectionList[event] || !item) {
        return item;
    }

    for (let cb of InjectionList[event][anyDbNamePlaceholder]) {
        try {
            item = cb(player, item, fromType);
        } catch (err) {
            console.warn(`Got drop Injection Error: ${err}`);
            continue;
        }
    }

    if (!InjectionList[event][item.dbName] || InjectionList[event][item.dbName].length <= 0) {
        return item;
    }

    for (let cb of InjectionList[event][item.dbName]) {
        try {
            item = cb(player, item, fromType);
        } catch (err) {
            console.warn(`Got drop Injection Error: ${err}`);
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
    cb: (player: alt.Player, item: StoredItemEx<T>, fromType: InventoryType) => void,
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
    cb: (player: alt.Player, item: StoredItemEx<T>, fromType: InventoryType) => void,
) {
    if (!CallbackList[event]) {
        return;
    }

    if (!CallbackList[event][anyDbNamePlaceholder]) {
        CallbackList[event][anyDbNamePlaceholder] = [];
    }

    CallbackList[event][anyDbNamePlaceholder].push(cb);
}

export function addInjection<T = {}>(
    event: InjectionEvents,
    dbName: string,
    cb: (player: alt.Player, item: StoredItemEx<T>, fromType: InventoryType) => StoredItem,
) {
    if (!InjectionList[event]) {
        return;
    }

    if (!InjectionList[event][dbName]) {
        InjectionList[event][dbName] = [];
    }

    InjectionList[event][dbName].push(cb);
}

export function addInjectionAny<T = {}>(
    event: InjectionEvents,
    cb: (player: alt.Player, item: StoredItemEx<T>, fromType: InventoryType) => StoredItem,
) {
    if (!InjectionList[event]) {
        return;
    }

    if (!InjectionList[event][anyDbNamePlaceholder]) {
        InjectionList[event][anyDbNamePlaceholder] = [];
    }

    InjectionList[event][anyDbNamePlaceholder].push(cb);
}
