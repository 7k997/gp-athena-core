import { BaseItemEx, Item, StoredItem } from '@AthenaShared/interfaces/item.js';
import * as alt from 'alt-server';
import * as Athena from '@AthenaServer/api/index.js';
import { InventoryType } from '@AthenaPlugins/core-inventory/shared/interfaces.js';
import { ItemUtil } from './itemUtil.js';
import { deepCloneObject } from '@AthenaShared/utility/deepCopy.js';
import { Config } from '@AthenaPlugins/gp-athena-overrides/shared/config.js';
import { ANIMATION_FLAGS } from '@AthenaShared/flags/animationFlags.js';
import { getForwardVector } from '@AthenaShared/utility/vector.js';

/**
 *
 */
export class InventoryUtil {
    public init() {}

    /**
     * Example Function to add item with custom data to inventory.
     * @param player E
     * @param item
     * @param amount
     * @returns
     */
    public async addCustomItemToInventory<CustomData>(
        player: alt.Player,
        item: BaseItemEx<CustomData>,
        amount: number = 1,
    ): Promise<boolean> {
        const storedItem = Athena.systems.inventory.convert.toStoredItem<CustomData>(item, amount);
        const isAdded = await Athena.player.inventory.add(player, storedItem);
        return isAdded;
    }

    public async createCustomItem<CustomData>(
        item: Partial<BaseItemEx<CustomData>>,
    ): Promise<BaseItemEx<CustomData> | null> {
        const itemFromDB = await Athena.systems.inventory.factory.getBaseItemAsync(item.dbName);

        if (!itemFromDB) {
            return null;
        }
        const newItem = ItemUtil.deepTransferObject<BaseItemEx<CustomData>>(itemFromDB, item);
        return newItem;
    }

    public getToolBarItem(player: alt.Player, item: Partial<Item>): Item | null {
        return this.getItemIn(player, item, 'toolbar');
    }

    public getInventoryItem(player: alt.Player, item: Partial<Item>): Item | null {
        return this.getItemIn(player, item, 'inventory');
    }

    /**
     * Checks if an item is in the toolbar data section.
     * Returns the index of the toolbar if it's present.
     * Returns null if the slot is empty.
     * @param {alt.Player} playerRef
     * @param {Partial<Item>} item
     * @return {{ index: number } | null}
     * @memberof InventoryPrototype
     */
    public isInToolbar(playerRef: alt.Player, item: Partial<Item>): { index: number } | null {
        return this.isItemIn(playerRef, item, 'toolbar');
    }

    /**
     * Checks if an item is in the inventory data section.
     * Returns the tab in the inventory where it is.
     * Returns the index in the array of where this item is.
     * @param {INVENTORY_TYPE} type
     * @param {string} uuid
     * @return { { index: number}  | null }
     * @memberof InventoryPrototype
     */
    public isInInventory(player: alt.Player, item: Partial<Item>): { index: number } | null {
        return this.isItemIn(player, item, 'inventory');
    }

    public getItemIn(player: alt.Player, item: Partial<Item>, type: InventoryType): Item | null {
        const data = Athena.document.character.get(player);

        for (let i = 0; i < data[type].length; i++) {
            const foundItem = data[type][i];
            if (!foundItem) {
                continue;
            }

            const objectKeys = Object.keys(item);
            const keyIndex = objectKeys.findIndex((key: string) => {
                if (item.hasOwnProperty(key) && item[key as keyof Item] === foundItem[key as keyof Item]) {
                    return true;
                }
                return false;
            });

            if (keyIndex <= -1) {
                continue;
            }

            return foundItem;
        }

        return null;
    }

    public isItemIn(player: alt.Player, item: Partial<Item>, type: InventoryType): { index: number } | null {
        const data = Athena.document.character.get(player);

        for (let i = 0; i < data[type].length; i++) {
            const foundItem = data[type][i];
            if (!foundItem) {
                continue;
            }

            const objectKeys = Object.keys(item);
            const keyIndex = objectKeys.findIndex((key: string) => {
                if (item.hasOwnProperty(key) && item[key as keyof Item] === foundItem[key as keyof Item]) {
                    return true;
                }
                return false;
            });

            if (keyIndex <= -1) {
                continue;
            }

            return { index: i };
        }

        return null;
    }

    public async getAllInventoryItems(player: alt.Player): Promise<Array<StoredItem>> {
        const data = Athena.document.character.get(player);
        return data.inventory;
    }

    public async getAllToolbarItems(player: alt.Player): Promise<Array<StoredItem>> {
        const data = Athena.document.character.get(player);
        return data.toolbar;
    }

    public async dropItem(player: alt.Player, type: InventoryType, slot: number) {
        if (type === 'custom') {
            return;
        }

        const data = Athena.document.character.get(player);
        if (typeof data === 'undefined' || typeof data[type] === 'undefined') {
            return;
        }

        const clonedItem = deepCloneObject<StoredItem>(Athena.systems.inventory.slot.getAt(slot, data[type]));
        const baseItem = Athena.systems.inventory.factory.getBaseItem(clonedItem.dbName, clonedItem.version);
        if (typeof baseItem === 'undefined') {
            return;
        }

        if (!baseItem.behavior.canDrop) {
            return;
        }

        if (baseItem.behavior.destroyOnDrop) {
            Athena.player.emit.notification(player, `${baseItem.name} was destroyed on drop.`);
            return;
        }

        //No Animation for server drop without player interaction!
        //Athena.player.emit.animation(player, 'random@mugging4', 'pickup_low', ANIMATION_FLAGS.NORMAL, 1200);

        const newDataSet = Athena.systems.inventory.slot.removeAt(slot, data[type]);
        if (typeof newDataSet === 'undefined') {
            return;
        }

        let expiration = null;
        if (Config.DISABLE_OBJECT_DROP_BYPLAYER_EXPIRATION) {
            expiration = 0;
        }

        await Athena.document.character.set(player, type, newDataSet);

        //Corechange: Drop item in front of player
        const forwardVector = getForwardVector(player.rot);
        let position = new alt.Vector3(
            player.pos.x + forwardVector.x * 1,
            player.pos.y + forwardVector.y * 1,
            player.pos.z - 1,
        );

        let rotation = alt.Vector3.zero;
        if (Config.DEBUG) alt.logWarning('DropItem: ' + JSON.stringify(baseItem));
        if (baseItem.zaxisadjustment) {
            if (Config.DEBUG) alt.logWarning(`zaxisadjustment: ${baseItem.zaxisadjustment}`);
            position = new alt.Vector3(player.pos.x, player.pos.y, player.pos.z - 1 + baseItem.zaxisadjustment);
        }

        if (baseItem.rotation) {
            if (Config.DEBUG) alt.logWarning(`rotation: ${JSON.stringify(baseItem.rotation)}`);
            rotation = new alt.Vector3(baseItem.rotation);
        }

        await Athena.systems.inventory.drops.add(
            clonedItem,
            position,
            rotation,
            player.dimension,
            player,
            (baseItem.noCollision !== undefined) ? !baseItem.noCollision : Config.DEFAULT_OBJECT_DROP_COLLISSION,
            (baseItem.noFreeze !== undefined) ? !baseItem.noFreeze : Config.DEFAULT_OBJECT_DROP_FROZEN,
            expiration,
        );

        Athena.systems.inventory.drop.invoke('item-drop', player, clonedItem, type);
    }
}
