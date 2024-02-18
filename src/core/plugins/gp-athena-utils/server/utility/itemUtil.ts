import * as alt from 'alt-server';
import * as Athena from '@AthenaServer/api/index.js';
import { ItemEx, StoredItemEx } from '@AthenaShared/interfaces/item.js';
import { Character } from '@AthenaShared/interfaces/character.js';
import { InventoryType } from '@AthenaPlugins/core-inventory/shared/interfaces.js';
import { InventoryView } from '@AthenaPlugins/core-inventory/server/src/view.js';

export class ItemUtil {
    static getItem<CustomData>(player: alt.Player, slot: number, type: InventoryType): ItemEx<CustomData> {
        if (type === 'toolbar') {
            const item = Athena.player.toolbar.getAt(player, slot);
            if (item) {
                return Athena.systems.inventory.convert.toItem<CustomData>(Athena.player.toolbar.getAt(player, slot));
            }
        } else if (type === 'inventory') {
            const item = Athena.player.inventory.getAt(player, slot);
            if (item) {
                return Athena.systems.inventory.convert.toItem<CustomData>(Athena.player.inventory.getAt(player, slot));
            }
        } else if (type === 'custom') {
            const item = InventoryView.storage.getAt<CustomData>(player, slot);
            if (item) {
                return Athena.systems.inventory.convert.toItem<CustomData>(item);
            }
        } else if (type === 'second') {
            const item = InventoryView.secondStorage.getAt<CustomData>(player, slot);
            if (item) {
                return Athena.systems.inventory.convert.toItem<CustomData>(item);
            }
        } else if (type === 'machine') {
            const item = InventoryView.machineStorage.getAt<CustomData>(player, slot);
            if (item) {
                return Athena.systems.inventory.convert.toItem<CustomData>(item);
            }
        }
        return null;
    }

    static getStoredItem<CustomData>(player: alt.Player, slot: number, type: InventoryType): StoredItemEx<CustomData> {
        if (type === 'toolbar') {
            return Athena.player.toolbar.getAt(player, slot);
        } else if (type === 'inventory') {
            return Athena.player.inventory.getAt(player, slot);
        } else if (type === 'custom') {
            return InventoryView.storage.getAt(player, slot);
        } else if (type === 'second') {
            return InventoryView.secondStorage.getAt(player, slot);
        } else if (type === 'machine') {
            return InventoryView.machineStorage.getAt(player, slot);
        }
        return null;
    }

    static getPlayerData(player: alt.Player): Character {
        let data = Athena.document.character.get(player);
        return data;
    }

    /**
     * Returns the first item that matches the given item.
     * 
     * Attention: Only copies attributes thate are not present (undefined) in the target item.
     * Example. If u use it to transfert Item Data from StoredItem to BaseItem: The slot is -1 for a BaseItem from DB.
     * So the slot will not be copied. Set it manually if needed after deepTransferObject.
     * 
     * @param {alt.Player} playerRef
     * @param {Partial<Item>} item
     * @param {InventoryType} type
     * @return {Item | null}
     * @memberof ItemUtil
     **/
    static deepTransferObject<T>(target: object, source: object): T {
        const target_json = JSON.parse(JSON.stringify(target));
        const source_json = JSON.parse(JSON.stringify(source));

        Object.keys(source_json).forEach((key) => {
            if (target_json[key] === undefined) {
                target_json[key] = source_json[key];
            }
        });

        //Copy Missing Data properties
        if (target_json.data === undefined) {
            target_json.data = source_json.data;
        } else {
            Object.keys(source_json.data).forEach((key) => {
                if (target_json.data[key] === undefined) {
                    target_json.data[key] = source_json.data[key];
                }
            });
        }

        return target_json;
    }
}
