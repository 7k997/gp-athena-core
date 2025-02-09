import * as alt from 'alt-server';
import { StoredItem, StoredItemEx } from '@AthenaShared/interfaces/item.js';

const anyDbName = 'any1sd2f3g4h5j6k7l8';

type StoredItemCallbacks = ((player: alt.Player, item: StoredItem) => void)[];

const CallbackList: { [key: string]: { [dbName: string]: StoredItemCallbacks } } = {
    'item-equipped': {},
    'item-unequipped': {},
};

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
export function invoke(event: Events, player: alt.Player, item: StoredItem) {
    if (!CallbackList[event] || !item) {
        return;
    }

    if (CallbackList[event][anyDbName]) {
        for (let cb of CallbackList[event][anyDbName]) {
            cb(player, item);
        }
    }

    if (!CallbackList[event][item.dbName] || CallbackList[event][item.dbName].length <= 0) {
        return;
    }

    for (let cb of CallbackList[event][item.dbName]) {
        cb(player, item);
    }
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
export function on<T = {}>(event: Events, dbName: string, cb: (player: alt.Player, item: StoredItemEx<T>) => void) {
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
export function onAny<T = {}>(event: Events, cb: (player: alt.Player, item: StoredItemEx<T>) => void) {
    if (!CallbackList[event]) {
        return;
    }

    if (!CallbackList[event][anyDbName]) {
        CallbackList[event][anyDbName] = [];
    }

    CallbackList[event][anyDbName].push(cb);
}
