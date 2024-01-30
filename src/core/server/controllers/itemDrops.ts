import * as alt from 'alt-server';
import { ItemDrop } from '@AthenaShared/interfaces/item.js';
import * as Athena from '@AthenaServer/api/index.js';
import { ITEM_SYNCED_META, ITEM_SYNCED_META_TYPES } from '@AthenaShared/enums/syncedMeta.js';
import { deepCloneObject } from '@AthenaShared/utility/deepCopy.js';
import { ControllerFuncs } from './shared.js';
import { IPed } from '@AthenaShared/interfaces/iPed.js';
import { Config } from '@AthenaPlugins/gp-athena-overrides/shared/config.js';

const drops: { [uid: string]: alt.Object | alt.Ped} = {};

let defaultModel = 'prop_cs_cardbox_01';

/**
 * Append item drop information to the server.
 *
 * Do not use this for creating item drops the players can pickup.
 *
 * These are mostly visual. Refer to `Athena.systems.inventory.drops` to make actual item drops.
 *
 * Returns a uid or generates one if not specified.
 *
 * @param {ItemDrop} itemDrop
 * @return {string}
 */
export function append(itemDrop: ItemDrop): string {
    if (Overrides.append) {
        return Overrides.append(itemDrop);
    }

    //Corechange: added properties like frozen, collision, maxDistance
    if(itemDrop.pedModel && itemDrop.usePedModel) {

        const ped: IPed = {
            model: itemDrop.pedModel,
            pos: itemDrop.pos,
            rotation: itemDrop.rot ? itemDrop.rot : alt.Vector3.zero,
            maxDistance: itemDrop.maxDistance ? itemDrop.maxDistance : Config.DEFAULT_STREAMING_DISTANCE,
            frozen: itemDrop.frozen,
            collision: itemDrop.collision,
            dimension: itemDrop.dimension ? itemDrop.dimension : 0,
        };

        const pedID = Athena.controllers.staticPed.append(ped);
        const staticPed = Athena.controllers.staticPed.getPed(pedID);
        const pedEntity = staticPed.entity.ped;

        pedEntity.setStreamSyncedMeta(ITEM_SYNCED_META.ITEM_DROP_INFO, deepCloneObject(itemDrop));
        drops[String(itemDrop._id)] = pedEntity;
    } else {
    const object = new alt.Object(
        itemDrop.model ? itemDrop.model : defaultModel,
        itemDrop.pos,
        itemDrop.rot ? itemDrop.rot : alt.Vector3.zero,
    );

        object.streamingDistance = itemDrop.maxDistance ? itemDrop.maxDistance : Config.DEFAULT_STREAMING_DISTANCE;
    object.frozen = itemDrop.frozen;
    object.collision = itemDrop.collision;
        object.dimension = itemDrop.dimension ? itemDrop.dimension : 0;
        object.setStreamSyncedMeta(ITEM_SYNCED_META.TYPE, ITEM_SYNCED_META_TYPES.OBJECT);
    object.setStreamSyncedMeta(ITEM_SYNCED_META.ITEM_DROP_INFO, deepCloneObject(itemDrop));
    drops[String(itemDrop._id)] = object;
    }

    
    return String(itemDrop._id);
}

/**
 * Removes an item drop in-world.
 *
 * @param {string} uid A unique string
 * @return {boolean}
 */
export function remove(id: string): boolean {
    if (Overrides.remove) {
        return Overrides.remove(id);
    }

    if (!drops[id]) {
        return false;
    }

    try {
        drops[id].destroy();
    } catch (err) {}

    return true;
}

/**
 * Corechange
 * Updates an item drop in-world.
 */
export function update(itemDrop: ItemDrop): boolean {
    drops[String(itemDrop._id)].setStreamSyncedMeta(ITEM_SYNCED_META.ITEM_DROP_INFO, deepCloneObject(itemDrop));
    return true;
}

/**
 * Overrides the default model for item drops.
 * By default it is a cardboard box.
 *
 * @param {string} model
 */
export function setDefaultDropModel(model: string) {
    defaultModel = model;
}

type ItemDropFuncs = ControllerFuncs<typeof append, typeof remove>;

const Overrides: Partial<ItemDropFuncs> = {};

export function override(functionName: 'append', callback: typeof append);
export function override(functionName: 'remove', callback: typeof remove);
/**
 * Used to override any item drop streamer functionality.
 *
 *
 * @param {keyof ItemDropFuncs} functionName
 * @param {*} callback
 */
export function override(functionName: keyof ItemDropFuncs, callback: any): void {
    Overrides[functionName] = callback;
}
