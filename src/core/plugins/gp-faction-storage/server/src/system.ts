import { FactionFuncs } from '@AthenaPlugins/athena-plugin-factions/server/src/funcs.js';
import { FactionHandler } from '@AthenaPlugins/athena-plugin-factions/server/src/handler.js';
import { FactionPlayerFuncs } from '@AthenaPlugins/athena-plugin-factions/server/src/playerFuncs.js';
import { GP_FACTIONS_STORAGE_VIEW_EVENTS } from '@AthenaPlugins/gp-faction-storage/shared/events.js';
import Database from '@stuyk/ezmongodb';
import * as alt from 'alt-server';
import { Collections } from '@AthenaServer/database/collections.js';
import * as Athena from '@AthenaServer/api/index.js';

export class GPFactionDefaultSystem {
    static init() {
        alt.onClient(GP_FACTIONS_STORAGE_VIEW_EVENTS.PROTOCOL.INVOKE, GPFactionDefaultSystem.invoke);
    }

    /**
     * Invoke an event by an event name.
     *
     * @static
     * @param {alt.Player} player
     * @param {string} functionName
     * @param {...any[]} args
     * @return {*}
     * @memberof FactionPlayerFuncs
     */
    static invoke(player: alt.Player, functionName: string, ...args: any[]): boolean {
        console.log(`invoking...`);
        console.log(functionName, JSON.stringify(args));

        if (!GPFactionDefaultSystem[functionName]) {
            return false;
        }

        console.log('invoked');
        return GPFactionDefaultSystem[functionName](player, ...args);
    }

    /**
     * Create a storage facility for the faction.
     * Auto-saves
     *
     * @static
     * @param {Faction} faction
     * @return {*}
     * @memberof FactionFuncs
     */
    static async addStorage(player: alt.Player, pos: alt.Vector3, rot: alt.Vector3) {
        const playerData = Athena.document.character.get(player);
        const faction = FactionHandler.get(playerData.faction);
        if (!faction) {
            return false;
        }

        if (!FactionPlayerFuncs.isOwner(player)) {
            return false;
        }

        if (!faction.storages) {
            faction.storages = [];
        }

        const storageName = `${faction.name}-storage-${faction.storages.length}`;
        const storage = await Athena.systems.storage.create([]);
        if (!storage) {
            return false;
        }

        faction.storages.push({ id: storage.toString(), name: storageName, allowRanks: [], pos });
        const didUpdate = await FactionHandler.update(faction._id as string, { storages: faction.storages });
        if (didUpdate.status) {
            FactionFuncs.updateMembers(faction);
            FactionHandler.updateSettings(faction);
        }

        return didUpdate.status;
    }

    static async removeStorage(player: alt.Player, index: number) {
        const playerData = Athena.document.character.get(player);
        const faction = FactionHandler.get(playerData.faction);
        if (!faction) {
            return false;
        }

        if (!FactionPlayerFuncs.isOwner(player)) {
            return false;
        }

        if (!faction.storages) {
            return false;
        }

        if (!faction.storages[index]) {
            return false;
        }

        faction.storages.splice(index, 1);

        const storage = await Athena.systems.storage.create([]);
        if (!storage) {
            return false;
        }

        await Database.deleteById(storage, Collections.Storage);

        const didUpdate = await FactionHandler.update(faction._id as string, { storages: faction.storages });
        if (didUpdate.status) {
            FactionFuncs.updateMembers(faction);
            FactionHandler.updateSettings(faction);
        }

        return didUpdate.status;
    }
}
