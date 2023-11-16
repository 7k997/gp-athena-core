import * as alt from 'alt-server';
import * as Athena from '@AthenaServer/api/index.js';
import { ItemEx, StoredItemEx } from '@AthenaShared/interfaces/item.js';
import { Character } from '@AthenaShared/interfaces/character.js';
import { InventoryType } from '@AthenaPlugins/core-inventory/shared/interfaces.js';

export class ItemUtil {
    static getItem<CustomData>(player: alt.Player, slot: number, type: InventoryType): ItemEx<CustomData> {
        if (type === 'toolbar') {
            if (Athena.player.toolbar.getAt(player, slot)) {
                return Athena.systems.inventory.convert.toItem<CustomData>(Athena.player.toolbar.getAt(player, slot));
            }
        } else {
            if (Athena.player.inventory.getAt(player, slot)) {
                return Athena.systems.inventory.convert.toItem<CustomData>(Athena.player.inventory.getAt(player, slot));
            }
        }
        return null;
    }

    static getStoredItem<CustomData>(player: alt.Player, slot: number, type: InventoryType): StoredItemEx<CustomData> {
        if (type === 'toolbar') {
            return Athena.player.toolbar.getAt(player, slot);
        } else {
            return Athena.player.inventory.getAt(player, slot);
        }
    }

    static getPlayerData(player: alt.Player): Character {
        let data = Athena.document.character.get(player);
        return data;
    }

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
