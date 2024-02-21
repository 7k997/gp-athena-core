import { FactionFuncs } from '@AthenaPlugins/athena-plugin-factions/server/src/funcs.js';
import { FactionHandler } from '@AthenaPlugins/athena-plugin-factions/server/src/handler.js';
import { FactionPlayerFuncs } from '@AthenaPlugins/athena-plugin-factions/server/src/playerFuncs.js';
import { GP_FACTIONS_STORAGE_VIEW_EVENTS } from '@AthenaPlugins/gp-faction-storage/shared/events.js';
import Database from '@stuyk/ezmongodb';
import * as alt from 'alt-server';
import { Collections } from '@AthenaServer/database/collections.js';
import * as Athena from '@AthenaServer/api/index.js';
import { Faction } from '@AthenaPlugins/athena-plugin-factions/shared/interfaces.js';
import { LocaleController } from '@AthenaShared/locale/locale.js';
import { LOCALE_KEYS } from '@AthenaShared/locale/languages/keys.js';
import { InventoryView } from '@AthenaPlugins/core-inventory/server/src/view.js';
import { FactionStorageConfig } from '@AthenaPlugins/gp-faction-storage/shared/config.js';

const tempStorages: { [key: string]: string[] } = {};
export class GPFactionStorageSystem {
    static init() {
        alt.onClient(GP_FACTIONS_STORAGE_VIEW_EVENTS.PROTOCOL.INVOKE, GPFactionStorageSystem.invoke);
        FactionHandler.addUpdateSettingsInjection(GPFactionStorageSystem.updateSettings);
    }

    static updateSettings(faction: Faction) {
        const tempFactionStorages = tempStorages[faction._id as string];
        if (tempFactionStorages && tempFactionStorages.length > 0) {
            tempFactionStorages.forEach((storage) => {
                Athena.controllers.interaction.remove(storage);
                Athena.controllers.marker.remove(storage);
            });
        }

        if (faction.storages) {
            for (let i = 0; i < faction.storages.length; i++) {
                let storage = faction.storages[i];
                let storagePos = new alt.Vector3(storage.pos.x, storage.pos.y, storage.pos.z - 1);
                Athena.controllers.interaction.append({
                    description: `Access ${faction.name} Storage`,
                    uid: storage.name,
                    position: storagePos,
                    data: [storage.name, storage.id],
                    callback: GPFactionStorageSystem.openStorage,
                });

                Athena.controllers.marker.append({
                    uid: storage.name,
                    pos: storagePos,
                    type: 1,
                    color: new alt.RGBA(255, 255, 255, 100),
                });

                if (!tempStorages[faction._id as string]) tempStorages[faction._id as string] = [];
                tempStorages[faction._id as string].push(storage.name);
            }
        }
    }

    /**
     * External callable function for opening faction storages.
     * @static
     * @param {alt.Player} player
     * @param {FACTION_STORAGE} storageName
     * @memberof FactionSystem
     */
    static async openStorage(player: alt.Player, storageName: string, storageID: string): Promise<Boolean> {
        const playerData = Athena.document.character.get(player);
        if (!playerData.faction) {
            Athena.player.emit.message(player, LocaleController.get(LOCALE_KEYS.FACTION_STORAGE_NO_ACCESS));
            return false;
        }

        const faction = FactionHandler.get(playerData.faction);
        if (!faction) {
            Athena.player.emit.message(player, LocaleController.get(LOCALE_KEYS.FACTION_STORAGE_NO_ACCESS));
            return false;
        }

        let rank = FactionPlayerFuncs.getPlayerFactionRank(player);
        if (!rank || !rank.rankPermissions.canOpenStorages) {
            if (!FactionPlayerFuncs.isOwner(player)) {
                Athena.player.emit.notification(player, LocaleController.get(LOCALE_KEYS.FACTION_STORAGE_NO_ACCESS));
                return false;
            }
        }

        let storageIndex = faction.storages.findIndex((x) => x.name === storageName);
        if (storageIndex < 0) {
            Athena.player.emit.message(player, LocaleController.get(LOCALE_KEYS.FACTION_STORAGE_NO_ACCESS));
            return false;
        }

        //TODO Check storage rank permissions based on individual storage
        if (faction.storages[storageIndex].allowRanks.length > 0) {
        }

        const id = await Athena.systems.storage.create([]);
        const storedItems = await Athena.systems.storage.get(id);
        const maxSlots = faction.storages[storageIndex].maxSlots
            ? faction.storages[storageIndex].maxSlots
            : FactionStorageConfig.DEFAULT_MAX_SLOTS;
        const maxWeight = faction.storages[storageIndex].maxWeight
            ? faction.storages[storageIndex].maxWeight
            : FactionStorageConfig.DEFAULT_MAX_WEIGHT;
        InventoryView.storage.open(player, storageID, storedItems, maxSlots, true, maxWeight, false, faction.name);
        return true;
    }

    /**
     * Add a rank to access a storage facility.
     * Auto-saves
     * 
     * //TODO: Add Rank logic and test
     *
     * @static
     * @param {Faction} faction
     * @param {number} storageIndex
     * @param {string} rankUid
     * @return {*}
     * @memberof FactionFuncs
     */
    static async addRankToStorage(faction: Faction, storageIndex: number, rankUid: string) {
        const index = faction.ranks.findIndex((r) => r.uid === rankUid);
        if (index <= -1) {
            return false;
        }

        if (!faction.storages[storageIndex]) {
            return false;
        }

        const existingRankIndex = faction.storages[storageIndex].allowRanks.findIndex((ar) => ar === rankUid);
        if (existingRankIndex >= 0) {
            return false;
        }

        faction.storages[storageIndex].allowRanks.push(rankUid);
        const didUpdate = await FactionHandler.update(faction._id as string, { storages: faction.storages });
        if (didUpdate.status) {
            FactionFuncs.updateMembers(faction);
        }

        return didUpdate.status;
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

        if (!GPFactionStorageSystem[functionName]) {
            return false;
        }

        console.log('invoked');
        return GPFactionStorageSystem[functionName](player, ...args);
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

        faction.storages.push({
            id: storage.toString(),
            name: storageName,
            allowRanks: [],
            pos,
            maxSlots: FactionStorageConfig.DEFAULT_MAX_SLOTS,
            maxWeight: FactionStorageConfig.DEFAULT_MAX_WEIGHT,
        });
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
