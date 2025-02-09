import * as alt from 'alt-server';

import * as Athena from '@AthenaServer/api/index.js';
import { INVENTORY_EVENTS } from '@AthenaPlugins/core-inventory/shared/events.js';
import { DualSlotInfo, InventoryType, SlotInfo } from '@AthenaPlugins/core-inventory/shared/interfaces.js';
import { deepCloneArray, deepCloneObject } from '@AthenaShared/utility/deepCopy.js';
import { Item, ItemDrop, StoredItem } from '@AthenaShared/interfaces/item.js';
import { INVENTORY_CONFIG } from '@AthenaPlugins/core-inventory/shared/config.js';
import { ComplexSwapReturn } from '@AthenaServer/systems/inventory/manager.js';
import { Config } from '@AthenaPlugins/gp-athena-overrides/shared/config.js';
import { ANIMATION_FLAGS } from '@AthenaShared/flags/animationFlags.js';
import { getForwardVector } from '@AthenaShared/utility/vector.js';

type PlayerCallback = (player: alt.Player) => void;
type PlayerCloseCallback = (uid: string, items: Array<StoredItem>, player: alt.Player | undefined) => void;
type OfferInfo = {
    to: number | string;
    from: number | string;
    slot: number;
    quantity: number;
    dbName: string;
    creation?: number;
};

const EVENTS = {
    ACCEPT: 'inventory-accept-offer',
    DECLINE: 'inventory-decline-offer',
};

// Give Offers
const offers: { [hash: string]: OfferInfo } = {};

// Storages
const openStorages: { [player_id: string]: Array<StoredItem> } = {};
const openStorageSessions: { [player_id: string]: string } = {};
const openStoragesWeight: { [player_id: string]: number } = {};

// Second Storage
const openSecondStorages: { [player_id: string]: Array<StoredItem> } = {};
const openSecondStorageSessions: { [player_id: string]: string } = {};
const openSecondStoragesWeight: { [player_id: string]: number } = {};

// Third special Storage for machines
const openMachineStorages: { [player_id: string]: Array<StoredItem> } = {};
const openMachineStorageSessions: { [player_id: string]: string } = {};
const openMachineStoragesWeight: { [player_id: string]: number } = {};

// Callbacks
const openCallbacks: Array<PlayerCallback> = [];
const closeCallbacks: Array<PlayerCloseCallback> = [];
const openSecondCallbacks: Array<PlayerCallback> = [];
const closeSecondCallbacks: Array<PlayerCloseCallback> = [];
const openMachineCallbacks: Array<PlayerCallback> = [];
const closeMachineCallbacks: Array<PlayerCloseCallback> = [];

const Internal = {
    callbacks: {
        open(player: alt.Player) {
            if (!player || !player.valid) {
                return;
            }

            for (let cb of openCallbacks) {
                cb(player);
            }

            for (let cb of openMachineCallbacks) {
                cb(player);
            }
        },
        close(player: alt.Player | number) {
            let id = -1;
            let playerOrUndefined = undefined;
            if (typeof player !== 'number') {
                if (!player || !player.valid) {
                    return;
                }

                id = player.id;
                playerOrUndefined = player;
            } else {
                id = player;
            }

            if (!openStorageSessions[id] && !openMachineStorageSessions[id]) {
                return;
            }

            Internal.closeAllStorages(id, playerOrUndefined);

        },

    },
    closeAllStorages(id: number, player: alt.Player) {
        Internal.closeStorage(id, player);
        Internal.closeSecondStorage(id, player);
        Internal.closeMachineStorage(id, player);
    },
    closeStorage(id: number, player: alt.Player) {
            if(openStorageSessions[id]) {
                for (let cb of closeCallbacks) {
                cb(openStorageSessions[id], openStorages[id], player);
                }

                delete openStorageSessions[id];
                delete openStorages[id];
                delete openStoragesWeight[id];
            }
    },
    closeSecondStorage(id: number, player: alt.Player) {
        if (openSecondStorageSessions[id]) {
            for (let cb of closeSecondCallbacks) {
                cb(openSecondStorageSessions[id], openSecondStorages[id], player);
            }

            delete openSecondStorageSessions[id];
            delete openSecondStorages[id];
            delete openSecondStoragesWeight[id];
        }
    },
    closeMachineStorage(id: number, player: alt.Player) {
            if(openMachineStorageSessions[id]) {
                for (let cb of closeMachineCallbacks) {
                cb(openMachineStorageSessions[id], openMachineStorages[id], player);
                }

                delete openMachineStorageSessions[id];
                delete openMachineStorages[id];
                delete openMachineStoragesWeight[id];
            }
    },
    disconnect(player: alt.Player) {
        const id = player.id;
        if (typeof id === 'undefined') {
            return;
        }

        Internal.callbacks.close(id);
    },
    async use(player: alt.Player, type: InventoryType, slot: number, eventToCall: string | string[] = undefined) {
        if (!player || !player.valid) {
            return;
        }

        Athena.systems.inventory.manager.useItem(player, slot, type, eventToCall);
    },
    async drop(player: alt.Player, type: InventoryType, slot: number, _position?: alt.Vector3) {
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

        Athena.player.emit.animation(player, 'random@mugging4', 'pickup_low', ANIMATION_FLAGS.NORMAL, 1200);

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
        alt.logWarning('Position: ' + JSON.stringify(_position));
        let position = null
        if (_position) {
            position = _position;
        } else {
        const forwardVector = getForwardVector(player.rot);
            position = new alt.Vector3(
            player.pos.x + forwardVector.x * 1,
            player.pos.y + forwardVector.y * 1,
            player.pos.z - 1,
        );
        }
        let rotation = alt.Vector3.zero;
        if (Config.DEBUG) alt.logWarning('DropItem: ' + JSON.stringify(baseItem));
        if (baseItem.zaxisadjustment) {
            if (Config.DEBUG) alt.logWarning(`zaxisadjustment: ${baseItem.zaxisadjustment}`);
            position = new alt.Vector3(position.x, position.y, position.z + baseItem.zaxisadjustment);
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
    },
    async update<CustomData = {}>(player: alt.Player, type: InventoryType, slot: number, item: StoredItem<CustomData>) {
        //Attention: This function is called from the client side
        //Therefore, only not secured fields can be changed here
        //Example: price, itemname, etc. can be changed here
        //TODO: Allow list, for only special items and so on.

        if (!player || !player.valid) {
            return;
        }

        const data = Athena.document.character.get(player);
        if (typeof data === 'undefined') {
            return;
        }

        //Cleanup item
        delete item['_id'];
        delete item['pos'];
        delete item['expiration'];
        delete item['frozen'];
        delete item['collision'];
        delete item['maxDistance'];
        delete item['maxDistancePickup'];
        delete item['customEventsToCall'];
        delete item['behavior'];
        delete item.icon;
        delete item.description;

        if (type === 'custom') {
            const index = openStorages[player.id].findIndex((item) => item.slot === slot);
            openStorages[player.id][index] = item;
            await Athena.systems.storage.set(openStorageSessions[player.id], openStorages[player.id]);
            InventoryView.storage.resync(player);
        } else if (type === 'second') {
            const index = openSecondStorages[player.id].findIndex((item) => item.slot === slot);
            openSecondStorages[player.id][index] = item;
            await Athena.systems.storage.set(openSecondStorageSessions[player.id], openSecondStorages[player.id]);
            InventoryView.secondStorage.resync(player);
        } else if (type === 'machine') {
            const index = openMachineStorages[player.id].findIndex((item) => item.slot === slot);
            openMachineStorages[player.id][index] = item;
            await Athena.systems.storage.set(openMachineStorageSessions[player.id], openMachineStorages[player.id]);
            InventoryView.machineStorage.resync(player);
        } else if (type === 'inventory') {
            Athena.player.inventory.updateItem(player, slot, item);
        } else if (type === 'toolbar') {
            Athena.player.toolbar.updateItem(player, slot, item);
        }
    },
    async updatePrice(player: alt.Player, info: SlotInfo) {
        //TODO: Replace with update method
        if (info.location === 'custom') {
            openStorages[player.id].find((item) => item.slot === info.slot).price = info.price;
            await Athena.systems.storage.set(openStorageSessions[player.id], openStorages[player.id]);
            InventoryView.storage.resync(player);
        } else if (info.location === 'second') {
            openSecondStorages[player.id].find((item) => item.slot === info.slot).price = info.price;
            await Athena.systems.storage.set(openSecondStorageSessions[player.id], openSecondStorages[player.id]);
            InventoryView.secondStorage.resync(player);
        } else if (info.location === 'machine') {
            openMachineStorages[player.id].find((item) => item.slot === info.slot).price = info.price;
            await Athena.systems.storage.set(openMachineStorageSessions[player.id], openMachineStorages[player.id]);
            InventoryView.machineStorage.resync(player);
        } else if (info.location === 'inventory') {
            Athena.player.inventory.updateItemPartial(player, info.slot, { price: info.price });
        }
    },
    /**
     * Using the split interface; the result will try to push this.
     *
     * @param {alt.Player} player An alt:V Player Entity
     * @param {InventoryType} type
     * @param {number} slot
     * @param {number} amount
     * @return {void}
     */
    async split(player: alt.Player, type: InventoryType, slot: number, amount: number) {
        if (!player || !player.valid) {
            return;
        }

        const data = Athena.document.character.get(player);
        if (typeof data === 'undefined') {
            return;
        }

        if (type === 'custom') {
            const newInventory = await Athena.systems.inventory.manager.splitAt(slot, openStorages[player.id], amount, type);
            if (typeof newInventory === 'undefined') {
            return;
        }

            openStorages[player.id] = newInventory;
            await Athena.systems.storage.set(openStorageSessions[player.id], openStorages[player.id]);
            InventoryView.storage.resync(player);

        } else if (type === 'second') {
            const newInventory = await Athena.systems.inventory.manager.splitAt(slot, openSecondStorages[player.id], amount, type);
            if (typeof newInventory === 'undefined') {
            return;
        }

            openSecondStorages[player.id] = newInventory;
            await Athena.systems.storage.set(openSecondStorageSessions[player.id], openSecondStorages[player.id]);
            InventoryView.secondStorage.resync(player);

        } else if (type === 'machine') {
            const newInventory = await Athena.systems.inventory.manager.splitAt(slot, openMachineStorages[player.id], amount, type);
            if (typeof newInventory === 'undefined') {
            return;
        }

            openMachineStorages[player.id] = newInventory;
            await Athena.systems.storage.set(openMachineStorageSessions[player.id], openMachineStorages[player.id]);
            InventoryView.machineStorage.resync(player);

        } else if (type === 'inventory') {
        const newInventory = await Athena.systems.inventory.manager.splitAt(slot, data[type], amount, type);
        if (typeof newInventory === 'undefined') {
            return;
        }

        await Athena.document.character.set(player, type, newInventory);
        } else if (type === 'toolbar') {
            return;
        }
    },
    /**
     * Attempt to combine two items by left-clicking both of them in an inventory.
     *
     * @param {alt.Player} player An alt:V Player Entity
     * @param {DualSlotInfo} info
     * @return {void}
     */
    async combine(player: alt.Player, info: DualSlotInfo) {
        if (info.startType !== 'inventory' || info.endType !== 'inventory') {
            return;
        }

        if (info.startType !== info.endType) {
            return;
        }

        if (info.startIndex === info.endIndex) {
            return;
        }

        if (!player || !player.valid) {
            return;
        }

        const data = Athena.document.character.get(player);
        if (typeof data === 'undefined') {
            return;
        }

        const result = await Athena.systems.inventory.crafting.combineItems(
            data.inventory,
            info.startIndex,
            info.endIndex,
            'inventory',
        );

        if (typeof result === 'undefined') {
            return;
        }

        await Athena.document.character.set(player, 'inventory', result.dataSet);
        if (result.sound) {
            Athena.player.emit.sound2D(player, result.sound, 0.2);
        } else {
            Athena.player.emit.sound2D(
                player,
                `@plugins/sounds/${INVENTORY_CONFIG.PLUGIN_FOLDER_NAME}/inv_combine.ogg`,
                0.2,
            );
        }
    },
    /**
     * Swaps items between slots. Handles the 'dragging' action.
     *
     * @param {alt.Player} player An alt:V Player Entity
     * @param {DualSlotInfo} info
     * @return {void}
     */
    async swap(player: alt.Player, info: DualSlotInfo) {
        if (!player || !player.valid) {
            return;
        }

        let data = Athena.document.character.get(player);
        if (typeof data === 'undefined') {
            return;
        }

        let startData: Array<StoredItem> = data[info.startType];
        let endData: Array<StoredItem> = data[info.endType];

        if (info.startType === 'custom') {
            startData = openStorages[player.id];
        }

        if (info.endType === 'custom') {
            endData = openStorages[player.id];
        }

        if (info.startType === 'second') {
            startData = openSecondStorages[player.id];
        }

        if (info.endType === 'second') {
            endData = openSecondStorages[player.id];
        }

        if (info.startType === 'machine') {
            startData = openMachineStorages[player.id];
        }

        if (info.endType === 'machine') {
            endData = openMachineStorages[player.id];
        }

        if (typeof startData === 'undefined' || typeof endData === 'undefined') {
            return;
        }

        let startItem = Athena.systems.inventory.slot.getAt(info.startIndex, startData);
        startItem = await Athena.systems.inventory.swap.invokeInjection(
            'before-swap',
            'beforeSwap-1',
            player,
            startItem,
            info,
        );

        if (startItem === null) {
            //If Injection returns null, do not continue with swap.
            return;
        }


        //Reload stores in case they were modified by the injection.
        data = Athena.document.character.get(player);
        startData = data[info.startType];
        endData = data[info.endType];

        if (info.startType === 'custom') {
            startData = openStorages[player.id];
        }

        if (info.endType === 'custom') {
            endData = openStorages[player.id];
        }

        if (info.startType === 'second') {
            startData = openSecondStorages[player.id];
        }

        if (info.endType === 'second') {
            endData = openSecondStorages[player.id];
        }

        if (info.startType === 'machine') {
            startData = openMachineStorages[player.id];
        }

        if (info.endType === 'machine') {
            endData = openMachineStorages[player.id];
        }

        if (typeof startItem === 'undefined') {
            return;
        }

        let endItem = null;
        if (info.endIndex === -1) {

            //Swap to a slot with same type if possible
            info.endIndex = Athena.systems.inventory.slot.findStackable(startItem, endData);

            if (info.endIndex === -1) {
                //swap into free slot
                info.endIndex = Athena.systems.inventory.slot.findOpen(info.endType, endData);
                if (!info.endIndex) {
                    Athena.player.emit.notification(player, 'No free slot available');
                }
            }
        }

        endItem = Athena.systems.inventory.slot.getAt(info.endIndex, endData);

        // If its the same data set that we are modifying. Just does a simple combine for the same inventory type.
        // Stacking items in same data set.
        if (info.startType === info.endType && Athena.systems.inventory.manager.compare(startItem, endItem)) {
            const newInventory = Athena.systems.inventory.manager.combineAt(info.startIndex, info.endIndex, startData);
            if (typeof newInventory === 'undefined') {
                return;
            }

            if (info.startType === 'custom') {
                openStorages[player.id] = newInventory;
                await Athena.systems.storage.set(openStorageSessions[player.id], openStorages[player.id]); 
                InventoryView.storage.resync(player);
                Athena.systems.inventory.swap.invoke('item-combine', 'combineSameCustom1', player, endItem, info);
                return;
            }

            if (info.startType === 'second') {
                openStorages[player.id] = newInventory;
                await Athena.systems.storage.set(openSecondStorageSessions[player.id], openStorages[player.id]);
                InventoryView.secondStorage.resync(player);
                Athena.systems.inventory.swap.invoke('item-combine', 'combineSameSecond1', player, endItem, info);
                return;
            }

            if (info.startType === 'machine') {
                openMachineStorages[player.id] = newInventory;
                await Athena.systems.storage.set(openMachineStorageSessions[player.id], openStorages[player.id]); 
                InventoryView.machineStorage.resync(player);
                Athena.systems.inventory.swap.invoke('item-combine', 'combineSameMachine1', player, endItem, info);
                return;
            }

            await Athena.document.character.set(player, info.startType, newInventory);
            Athena.systems.inventory.swap.invoke('item-combine', 'combineSame1', player, endItem, info);
            return;
        }

        // Actually swapping different slots with same data set.
        // Same data set, different items.
        if (info.startType === info.endType && !Athena.systems.inventory.manager.compare(startItem, endItem)) {
            const newInventory = Athena.systems.inventory.manager.swap(info.startIndex, info.endIndex, startData);
            if (typeof newInventory === 'undefined') {
                return;
            }

            if (info.startType === 'custom') {
                openStorages[player.id] = newInventory;
                await Athena.systems.storage.set(openStorageSessions[player.id], openStorages[player.id]);       
                InventoryView.storage.resync(player);
                Athena.systems.inventory.swap.invoke('item-swap', 'swapDifferentCustomStart1', player, startItem, info);
                Athena.systems.inventory.swap.invoke('item-swap', 'swapDifferentCustomEnd1', player, endItem, info);
                return;
            }

            if (info.startType === 'second') {
                openStorages[player.id] = newInventory;
                await Athena.systems.storage.set(openSecondStorageSessions[player.id], openStorages[player.id]);
                InventoryView.secondStorage.resync(player);
                Athena.systems.inventory.swap.invoke('item-swap', 'swapDifferentSecondStart1', player, startItem, info);
                Athena.systems.inventory.swap.invoke('item-swap', 'swapDifferentSecondEnd1', player, endItem, info);
                return;
            }

            if (info.startType === 'machine') {
                openMachineStorages[player.id] = newInventory;
                await Athena.systems.storage.set(openMachineStorageSessions[player.id], openMachineStorages[player.id]);       
                InventoryView.machineStorage.resync(player);
                Athena.systems.inventory.swap.invoke('item-swap', 'swapDifferentMachineStart1', player, startItem, info);
                Athena.systems.inventory.swap.invoke('item-swap', 'swapDifferentMachineEnd1', player, endItem, info);
                return;
            }

            await Athena.document.character.set(player, info.startType, newInventory);
            Athena.systems.inventory.swap.invoke('item-swap', 'swapDifferentStart1', player, startItem, info);
            Athena.systems.inventory.swap.invoke('item-swap', 'swapDifferentEnd1', player, endItem, info);
            return;
        }

        //TODO: Use correct size and weight informations from specific storages
        const fromComplex = { slot: info.startIndex, data: startData, size: info.startType, type: info.startType, weight: info.endType };
        const toComplex = { slot: info.endIndex, data: endData, size: info.endType, type: info.endType, weight: info.endType };

        let complexSwap: ComplexSwapReturn;

        if (info.startType !== info.endType && !Athena.systems.inventory.manager.compare(startItem, endItem)) {
            // Swapping different slots with different data sets.
            complexSwap = await Athena.systems.inventory.manager.swapBetween(player, fromComplex, toComplex);
        } else {
            // Items match; but different data sets. Move stack sizes.
            complexSwap = await Athena.systems.inventory.manager.combineAtComplex(
                player,
                {
                    slot: info.startIndex, data: startData, size: info.startType, type: info.startType,
                    weight: info.endType
                },
                {
                    slot: info.endIndex, data: endData, size: info.endType, type: info.endType,
                    weight: info.endType
                },
            );
        }

        if (typeof complexSwap === 'undefined') {
            return;
        }

        if (info.startType !== 'custom' && info.endType !== 'custom' && info.startType !== 'machine' && info.endType !== 'machine'
            && info.startType !== 'second' && info.endType !== 'second') {
            await Athena.document.character.setBulk(player, {
                [info.startType]: complexSwap.from,
                [info.endType]: complexSwap.to,
            });
            Athena.systems.inventory.swap.invoke('item-swap', 'swapComplexEnd2', player, endItem, info);
            return;
        }

        // Check Storage Capacity
        const config = Athena.systems.inventory.config.get();

        if (config.weight.enabled) {
            let maxWeight = config.inventory.weight;

            if(info.endType === 'custom') {
                maxWeight = openStoragesWeight[player.id];
            }
         
            if (info.endType === 'second') {
                maxWeight = openSecondStoragesWeight[player.id];
            }

            if(info.endType === 'machine') {
                maxWeight = openMachineStoragesWeight[player.id];
            }

            if (Athena.systems.inventory.weight.isWeightExceeded([complexSwap.to], maxWeight)) {
                Athena.player.emit.notification(player, 'Weight Exceeded');
                InventoryView.storage.resync(player);
                InventoryView.secondStorage.resync(player);
                InventoryView.machineStorage.resync(player);
                return;
            }
        }

        // Assign Data
        if (info.startType === 'custom') {
            openStorages[player.id] = complexSwap.from;
            await Athena.systems.storage.set(openStorageSessions[player.id], openStorages[player.id]); 
        } else if (info.startType === 'second') {
            openSecondStorages[player.id] = complexSwap.from;
            await Athena.systems.storage.set(openSecondStorageSessions[player.id], openSecondStorages[player.id]); 
        } else if (info.startType === 'machine') {
            openMachineStorages[player.id] = complexSwap.from;  
            await Athena.systems.storage.set(openMachineStorageSessions[player.id], openMachineStorages[player.id]);
        } else {
            await Athena.document.character.set(player, info.startType, complexSwap.from);
        }

        if (info.endType === 'custom') {
            openStorages[player.id] = complexSwap.to;
            await Athena.systems.storage.set(openStorageSessions[player.id], openStorages[player.id]); 
        } else if (info.endType === 'second') {
            openSecondStorages[player.id] = complexSwap.to;
            await Athena.systems.storage.set(openSecondStorageSessions[player.id], openSecondStorages[player.id]); 
        } else if(info.endType === 'machine') {
            openMachineStorages[player.id] = complexSwap.to;        
            await Athena.systems.storage.set(openMachineStorageSessions[player.id], openMachineStorages[player.id]);       
        } else {
            await Athena.document.character.set(player, info.endType, complexSwap.to);
        }

        InventoryView.storage.resync(player);
        InventoryView.secondStorage.resync(player);
        InventoryView.machineStorage.resync(player);
    },
    /**
     * Unequip an item from a toolbar. Usually provoked by right-clicking in a toolbar.
     *
     * @param {alt.Player} player An alt:V Player Entity
     * @param {number} slot
     * @return {void}
     */
    async unequip(player: alt.Player, slot: number) {
        if (!player || !player.valid) {
            return;
        }

        const data = Athena.document.character.get(player);
        if (typeof data === 'undefined') {
            return;
        }

        if (typeof data.toolbar === 'undefined') {
            return;
        }

        const existingItem = Athena.systems.inventory.slot.getAt(slot, data.toolbar);
        if (typeof existingItem === 'undefined') {
            return;
        }

        let itemClone = deepCloneObject<StoredItem>(existingItem);
        const openSlot = Athena.systems.inventory.slot.findOpen('inventory', data.inventory);
        if (typeof openSlot === 'undefined') {
            return;
        }

        let inventoryClone = deepCloneArray<StoredItem>(data.inventory);
        itemClone.slot = openSlot;

        itemClone = await Athena.systems.inventory.swap.invokeInjection(
            'before-unequip',
            'before-unequip-1',
            player,
            itemClone,
            {
                startType: 'toolbar',
                startIndex: slot,
                endType: 'inventory',
                endIndex: openSlot,
                startMaxWeight: 0,
                startMaxSlots: 0,
                endMaxWeight: 0,
                endMaxSlots: 0
            },
        );

        inventoryClone.push(itemClone);

        let toolbarClone = deepCloneArray<StoredItem>(data.toolbar);
        toolbarClone = Athena.systems.inventory.slot.removeAt(slot, toolbarClone);
        if (typeof toolbarClone === 'undefined') {
            return;
        }

        await Athena.document.character.setBulk(player, {
            toolbar: toolbarClone,
            inventory: inventoryClone,
        });

        Athena.systems.inventory.swap.invoke('item-unequip', 'unequip', player, itemClone, null);
    },
    /**
     * Creates a 'give' request that the target player must accept to recieve an item.
     *
     * @param {alt.Player} player An alt:V Player Entity
     * @param {InventoryType} type
     * @param {number} slot
     * @param {number} idOfTarget
     * @return {void}
     */
    async give(player: alt.Player, type: InventoryType, slot: number, idOfTarget: number) {
        if (type !== 'inventory') {
            return;
        }

        if (typeof idOfTarget === 'undefined') {
            return;
        }

        const target = Athena.systems.identifier.getPlayer(idOfTarget);
        if (!target || !target.valid) {
            return;
        }

        if (target.id === player.id) {
            return;
        }

        const data = Athena.document.character.get(player);
        if (typeof data === 'undefined') {
            return;
        }

        if (typeof data.inventory === 'undefined' || data.inventory.length <= 0) {
            return;
        }

        const existingItem = Athena.systems.inventory.slot.getAt(slot, data.inventory);
        if (typeof existingItem === 'undefined') {
            return;
        }

        const baseItem = Athena.systems.inventory.factory.getBaseItem(existingItem.dbName, existingItem.version);
        if (typeof baseItem === 'undefined') {
            return;
        }

        const idOfOfferer = Athena.systems.identifier.getIdByStrategy(player);
        const newOffer: OfferInfo = {
            dbName: existingItem.dbName,
            quantity: existingItem.quantity,
            slot: existingItem.slot,
            from: idOfOfferer,
            to: idOfTarget,
        };

        const uid = Athena.utility.hash.sha256(JSON.stringify(newOffer));
        newOffer.creation = Date.now();
        offers[uid] = newOffer;

        const offerInfo = `Item Offer '${baseItem.name}' x${existingItem.quantity}`;
        Athena.player.emit.acceptDeclineEvent(target, {
            question: offerInfo,
            onClientEvents: {
                accept: EVENTS.ACCEPT,
                decline: EVENTS.DECLINE,
            },
            data: {
                uid,
            },
        });

        Athena.player.emit.notification(player, offerInfo.replace('Item Offer', 'Offered'));
    },
    async giveAccept(target: alt.Player, data: { uid: string }) {
        const offer = offers[data.uid];
        if (typeof offer === 'undefined') {
            Athena.player.emit.notification(target, `Item offer was not found.`);
            return;
        }

        const player = Athena.systems.identifier.getPlayer(offer.from);
        if (typeof player === 'undefined') {
            delete offers[data.uid];
            Athena.player.emit.notification(target, `Item offer was not found.`);
            return;
        }

        const playerData = Athena.document.character.get(player);
        if (typeof playerData === 'undefined' || typeof playerData.inventory === 'undefined') {
            return;
        }

        const existingItem = Athena.systems.inventory.slot.getAt(offer.slot, playerData.inventory);
        if (typeof existingItem === 'undefined') {
            delete offers[data.uid];
            Athena.player.emit.notification(target, `Item offer was not found.`);
            return;
        }

        if (existingItem.dbName !== offer.dbName || existingItem.quantity !== offer.quantity) {
            delete offers[data.uid];
            Athena.player.emit.notification(target, `Item offer is no longer valid.`);
            return;
        }

        const targetData = Athena.document.character.get(target);
        if (typeof targetData === 'undefined' || typeof targetData.inventory === 'undefined') {
            delete offers[data.uid];
            Athena.player.emit.notification(target, `Item offer is no longer valid.`);
            return;
        }

        const openSlot = Athena.systems.inventory.slot.findOpen('inventory', targetData.inventory);
        if (typeof openSlot === 'undefined') {
            delete offers[data.uid];
            Athena.player.emit.notification(target, `No space in inventory.`);
            return;
        }

        const itemClone = deepCloneObject<StoredItem>(existingItem);
        const playerInventory = Athena.systems.inventory.slot.removeAt(offer.slot, playerData.inventory);
        if (typeof playerInventory === 'undefined') {
            delete offers[data.uid];
            Athena.player.emit.notification(target, `Trade could not be completed.`);
            return;
        }

        const targetInventory = Athena.systems.inventory.manager.add(itemClone, targetData.inventory, 'inventory');
        if (typeof targetInventory === 'undefined') {
            delete offers[data.uid];
            Athena.player.emit.notification(target, `Trade could not be completed.`);
            return;
        }

        delete offers[data.uid];
        await Athena.document.character.set(player, 'inventory', playerInventory);
        await Athena.document.character.set(target, 'inventory', targetInventory);

        Athena.systems.inventory.drop.invoke('item-give', player, null, 'inventory');
        Athena.systems.inventory.drop.invoke('item-give', target, null, 'inventory');
    },
    giveDecline(target: alt.Player, data: { uid: string }) {
        const offer = offers[data.uid];
        if (typeof offer === 'undefined') {
            Athena.player.emit.notification(target, `Item offer was not found.`);
            return;
        }

        const player = Athena.systems.identifier.getPlayer(offer.from);
        if (typeof player === 'undefined') {
            delete offers[data.uid];
            return;
        }

        Athena.player.emit.notification(player, `Item offer was declined.`);
    },
    /**
     * Handles the item pickup event when an item is registered for pickup.
     *
     * @param {alt.Player} player An alt:V Player Entity
     * @param {string} _id
     */
    async pickupItem(player: alt.Player, _id: string) {
        if (!player || !player.valid) {
            return;
        }

        const data = Athena.document.character.get(player);
        if (typeof data === 'undefined') {
            return;
        }

        Athena.player.emit.animation(player, 'random@mugging4', 'pickup_low', ANIMATION_FLAGS.NORMAL, 1200);

        if (!Athena.systems.inventory.drops.isItemAvailable(_id)) {
            Athena.player.emit.notification(player, `[0x01] Item is unavailable. Try again in a moment. ID: ${_id}`);
            return;
        }

        Athena.systems.inventory.drops.markForTaken(_id, true);

        const originalItem = Athena.systems.inventory.drops.get(_id);
        alt.logWarning("Pickup dropped item: " + JSON.stringify(originalItem));
        if (typeof originalItem === 'undefined') {
            Athena.player.emit.notification(player, `[0x02] Item is unavailable. Try again in a moment. ID: ${_id}`);
            Athena.systems.inventory.drops.markForTaken(_id, false);
            return;
        }

        const item = deepCloneObject<ItemDrop>(originalItem);
        delete item._id;
        delete item.pos;
        delete item.expiration;
        delete item.frozen;
        delete item.collision;
        delete item.maxDistance;
        delete item.maxDistancePickup;

        const newInventory = Athena.systems.inventory.manager.add(item, data.inventory, 'inventory');
        if (typeof newInventory === 'undefined') {
            Athena.player.emit.notification(player, `No room in inventory, or too heavy.`);
            Athena.systems.inventory.drops.markForTaken(_id, false);
            return;
        }

        await Athena.document.character.set(player, 'inventory', newInventory);
        await Athena.systems.inventory.drops.sub(_id);
        Athena.player.emit.sound2D(
            player,
            `@plugins/sounds/${INVENTORY_CONFIG.PLUGIN_FOLDER_NAME}/inv_pickup.ogg`,
            0.2,
        );

        Athena.systems.inventory.drop.invoke('item-pickup', player, item, 'inventory');
    },
    isStorageOpen(uid: string) {
        if (Object.values(openStorageSessions).includes(uid)
            || Object.values(openSecondStorageSessions).includes(uid)
            || Object.values(openMachineStorageSessions).includes(uid)) {
            return true;
        }
        return false;
    },
};

function addCallback(type: 'close', callback: PlayerCloseCallback);
function addCallback(type: 'secondClose', callback: PlayerCloseCallback);
function addCallback(type: 'machineClose', callback: PlayerCloseCallback);
function addCallback(type: 'open', callback: PlayerCallback);
function addCallback(type: 'secondOpen', callback: PlayerCallback);
function addCallback(type: 'machineOpen', callback: PlayerCallback);
function addCallback(type: 'open' | 'close' | 'secondClose' | 'secondOpen' | 'machineClose' | 'machineOpen', callback: PlayerCallback | PlayerCloseCallback) {
    if (type === 'open') {
        openCallbacks.push(callback as PlayerCallback);
        return;
    }

    if (type === 'close') {
        closeCallbacks.push(callback as PlayerCloseCallback);
        return;
    }

    if (type === 'machineOpen') {
        openMachineCallbacks.push(callback as PlayerCallback);
        return;
    }

    if (type === 'machineClose') {
        closeMachineCallbacks.push(callback as PlayerCloseCallback);
        return;
    }

    if (type === 'secondOpen') {
        openSecondCallbacks.push(callback as PlayerCallback);
        return;
    }

    if (type === 'secondClose') {
        closeSecondCallbacks.push(callback as PlayerCloseCallback);
        return;
    }
}

export const InventoryView = {
    init() {
        alt.on('playerDisconnect', Internal.disconnect);
        alt.onClient(INVENTORY_EVENTS.TO_SERVER.USE, Internal.use);
        alt.onClient(INVENTORY_EVENTS.TO_SERVER.DROP, Internal.drop);
        alt.onClient(INVENTORY_EVENTS.TO_SERVER.SPLIT, Internal.split);
        alt.onClient(INVENTORY_EVENTS.TO_SERVER.UPDATE, Internal.update);
        alt.onClient(INVENTORY_EVENTS.TO_SERVER.UPDATE_PRICE, Internal.updatePrice);
        alt.onClient(INVENTORY_EVENTS.TO_SERVER.SWAP, Internal.swap);
        alt.onClient(INVENTORY_EVENTS.TO_SERVER.UNEQUIP, Internal.unequip);
        alt.onClient(INVENTORY_EVENTS.TO_SERVER.COMBINE, Internal.combine);
        alt.onClient(INVENTORY_EVENTS.TO_SERVER.GIVE, Internal.give);
        alt.onClient(INVENTORY_EVENTS.TO_SERVER.OPEN, Internal.callbacks.open);
        alt.onClient(INVENTORY_EVENTS.TO_SERVER.CLOSE, Internal.callbacks.close);
        alt.onClient(EVENTS.ACCEPT, Internal.giveAccept);
        alt.onClient(EVENTS.DECLINE, Internal.giveDecline);
        Athena.player.events.on('pickup-item', Internal.pickupItem);
    },
    update<CustomData = {}>(player: alt.Player, type: InventoryType, slot: number, item: StoredItem<CustomData>) {
        Internal.update(player, type, slot, item);
    },
    callbacks: {
        add: addCallback,
    },
    controls: {
        /**
         * Force open an inventory.
         *
         * @param {alt.Player} player An alt:V Player Entity
         */
        open(player: alt.Player) {
            player.emit(INVENTORY_EVENTS.TO_CLIENT.OPEN);
        },
        /**
         * Force close the inventory if it is open.
         *
         * @param {alt.Player} player An alt:V Player Entity
         */
        close(player: alt.Player) {
            player.emit(INVENTORY_EVENTS.TO_CLIENT.CLOSE);
        },
    },
    storage: {
        /**
         * Allows opening a side-panel with an array of items next to the inventory.
         * The array of items will be returned through a callback.
         * Utilize the callback system to obtain the modified storage data.
         *
         * @param {alt.Player} player An alt:V Player Entity
        * @param {
        string
    } storageName Displays the storage name like Wallet, Trash, Store, etc./ leave null for default
         * @param {string} uid A unique string
         * @param {Array<StoredItem>} items
         */
        async open(
            player: alt.Player,
            uid: string,
            items: Array<StoredItem>,
            storageSize: number,
            forceOpenInventory = false,
            maxWeight: number = Number.MAX_SAFE_INTEGER,
            showPrices: boolean = false,
            storageName: string = undefined,
        ) {
            // Before opening a storage make sure all other storages of same type are closed.
            Internal.closeStorage(player.id, player);

            if (forceOpenInventory) {

                player.emit(INVENTORY_EVENTS.TO_CLIENT.FORCEOPEN);

                await alt.Utils.wait(250);
            }

            // If the matching uid is already open; we do not open it for others.
            if (Internal.isStorageOpen(uid)) {
                return;
            }

            if (storageSize < items.length) {
                storageSize = items.length;
            }

            openStorages[player.id] = deepCloneArray<StoredItem>(items);
            openStorageSessions[player.id] = uid;
            openStoragesWeight[player.id] = maxWeight;

            openStorages[player.id] = Athena.systems.inventory.weight.update(openStorages[player.id]);
            const storageWeight = Athena.systems.inventory.weight.getDataWeight(openStorages[player.id]);

            const fullStorageList = Athena.systems.inventory.manager.convertFromStored(openStorages[player.id]);
            Athena.webview.emit(player, INVENTORY_EVENTS.TO_WEBVIEW.SET_CUSTOM, fullStorageList, storageName, storageSize, storageWeight, maxWeight, showPrices);
        },
        /**
         * Updates a storage session with new data.
         *
         * @param {alt.Player} player An alt:V Player Entity
         * @param {Array<StoredItem>} items
         */
        resync(player: alt.Player) {
            if (!openStorages[player.id]) {
                return;
            }

            openStorages[player.id] = Athena.systems.inventory.weight.update(openStorages[player.id]);
            const storageWeight = Athena.systems.inventory.weight.getDataWeight(openStorages[player.id]);

            const fullStorageList = Athena.systems.inventory.manager.convertFromStored(openStorages[player.id]);
            Athena.webview.emit(player, INVENTORY_EVENTS.TO_WEBVIEW.RESYNC_CUSTOM, fullStorageList, storageWeight);
        },
        /**
         * Returns true if a player is using the matching session uid.
         *
         * @param {alt.Player} player An alt:V Player Entity
         * @param {string} uid A unique string
         * @return {void}
         */
        isUsingSession(player: alt.Player, uid: string) {
            return openStorageSessions[player.id] === uid;
        },
        /**
         * Returns true if the session with a specific uid is in use.
         *
         * @param {string} uid A unique string
         * @return {void}
         */
        isSessionInUse(uid: string) {
            return Internal.isStorageOpen(uid);
        },

        /** Returns current open storage id */
        getOpenStorageId(player: alt.Player) {
            return openStorageSessions[player.id];
        },

        getAt<CustomData = {}>(player: alt.Player, slot: number): StoredItem<CustomData> | undefined {
            const openStorage = openStorages[player.id];
            if (!openStorage) {
                return undefined;
            }

            const index = openStorage.findIndex((x) => x.slot === slot);
            if (index <= -1) {
                return undefined;
            }

            return openStorage[index] as StoredItem<CustomData>;
        },
    },
    machineStorage: {
        /**
         * Allows opening a side-panel with an array of items next to the inventory.
         * The array of items will be returned through a callback.
         * Utilize the callback system to obtain the modified storage data.
         *
         * @param {alt.Player} player An alt:V Player Entity
         * @param {string} uid A unique string
         * @param {Array<StoredItem>} items
         */
        async open(
            player: alt.Player,
            machineUid: string,
            machineItems: Array<StoredItem>,
            machineStorageSize: number,
            machineMaxWeight: number = Number.MAX_SAFE_INTEGER,
            uid: string,
            items: Array<StoredItem>,
            storageSize: number,
            forceOpenInventory = false,
            maxWeight: number = Number.MAX_SAFE_INTEGER,
            machineName: string = undefined,
            storageName: string = undefined,
        ) {
            // Before opening a storage make sure all other storages of same type are closed.
            Internal.closeMachineStorage(player.id, player);

            if (forceOpenInventory) {
                player.emit(INVENTORY_EVENTS.TO_CLIENT.OPEN);
                await alt.Utils.wait(250);
            }

            // If the matching uid is already open; we do not open it for others.
            if (Object.values(openStorageSessions).includes(uid) || Object.values(openMachineStorageSessions).includes(machineUid)) {
                return;
            }

            if (storageSize < items.length) {
                storageSize = items.length;
            }

            if (machineStorageSize < machineItems.length) {
                machineStorageSize = machineItems.length;
            }

            openStorages[player.id] = deepCloneArray<StoredItem>(items);
            openMachineStorages[player.id] = deepCloneArray<StoredItem>(machineItems);

            openStorageSessions[player.id] = uid;
            openMachineStorageSessions[player.id] = machineUid;

            openStoragesWeight[player.id] = maxWeight;
            openMachineStoragesWeight[player.id] = machineMaxWeight;

            openStorages[player.id] = Athena.systems.inventory.weight.update(openStorages[player.id]);
            const storageWeight = Athena.systems.inventory.weight.getDataWeight(openStorages[player.id]);

            openMachineStorages[player.id] = Athena.systems.inventory.weight.update(openMachineStorages[player.id]);
            const machineStorageWeight = Athena.systems.inventory.weight.getDataWeight(openMachineStorages[player.id]);

            const fullStorageList = Athena.systems.inventory.manager.convertFromStored(openStorages[player.id]);
            const fullMachineStorageList = Athena.systems.inventory.manager.convertFromStored(openMachineStorages[player.id]);

            Athena.webview.emit(player, INVENTORY_EVENTS.TO_WEBVIEW.SET_CUSTOM, fullStorageList, storageName, storageSize, storageWeight, maxWeight, false, storageName);
            Athena.webview.emit(player, INVENTORY_EVENTS.TO_WEBVIEW.SET_MACHINE, fullMachineStorageList, machineName, machineStorageSize, machineStorageWeight, machineMaxWeight, machineName);
        },
        /**
         * Updates a storage session with new data.
         *
         * @param {alt.Player} player An alt:V Player Entity
         * @param {Array<StoredItem>} items
         */
        resync(player: alt.Player) {
            if (!openMachineStorages[player.id]) {
                return;
            }

            openMachineStorages[player.id] = Athena.systems.inventory.weight.update(openMachineStorages[player.id]);
            const storageWeight = Athena.systems.inventory.weight.getDataWeight(openMachineStorages[player.id]);

            const fullStorageList = Athena.systems.inventory.manager.convertFromStored(openMachineStorages[player.id]);
            Athena.webview.emit(player, INVENTORY_EVENTS.TO_WEBVIEW.RESYNC_MACHINE, fullStorageList, storageWeight);
        },
        /**
         * Returns true if a player is using the matching session uid.
         *
         * @param {alt.Player} player An alt:V Player Entity
         * @param {string} uid A unique string
         * @return {void}
         */
        isUsingSession(player: alt.Player, uid: string) {
            return openMachineStorageSessions[player.id] === uid;
        },
        /**
         * Returns true if the session with a specific uid is in use.
         *
         * @param {string} uid A unique string
         * @return {void}
         */
        isSessionInUse(uid: string) {
            return Internal.isStorageOpen(uid);
        },
        /** Returns current open machine storage id */
        getOpenMachineStorageId(player: alt.Player) {
            return openMachineStorageSessions[player.id];
        },
        getAt<CustomData = {}>(player: alt.Player, slot: number): StoredItem<CustomData> | undefined {
            const openStorage = openMachineStorages[player.id];
            if (!openStorage) {
                return undefined;
            }
            const index = openStorage.findIndex((x) => x.slot === slot);
            if (index <= -1) {
                return undefined;
            }

            return openStorage[index] as StoredItem<CustomData>;
        }

    },
    secondStorage: {
        /**
         * Allows opening a side-panel with an array of items next to the inventory.
         * The array of items will be returned through a callback.
         * Utilize the callback system to obtain the modified storage data.
         *
         * @param {alt.Player} player An alt:V Player Entity
         * @param {string} uid A unique string
         * @param {Array<StoredItem>} items
         */
        async open(
            player: alt.Player,
            secondStorageUid: string,
            secondStorageItems: Array<StoredItem>,
            secondStorageSize: number,
            secondStorageMaxWeight: number = Number.MAX_SAFE_INTEGER,
            forceOpenInventory = false,
            storageName: string = undefined,
        ) {
            // Before opening a storage make sure all other storages of same type are closed.
            Internal.closeSecondStorage(player.id, player);

            if (forceOpenInventory) {
                player.emit(INVENTORY_EVENTS.TO_CLIENT.OPEN);
                await alt.Utils.wait(250);
            }

            // If the matching uid is already open; we do not open it for others.
            if (Internal.isStorageOpen(secondStorageUid)) {
                return;
            }

            if (secondStorageSize < secondStorageItems.length) {
                secondStorageSize = secondStorageItems.length;
            }

            openSecondStorages[player.id] = deepCloneArray<StoredItem>(secondStorageItems);
            openSecondStorageSessions[player.id] = secondStorageUid;
            openSecondStoragesWeight[player.id] = secondStorageMaxWeight;

            secondStorageItems = Athena.systems.inventory.weight.update(secondStorageItems);
            const storageWeight = Athena.systems.inventory.weight.getDataWeight(secondStorageItems);

            const fullSecondStorageList = Athena.systems.inventory.manager.convertFromStored(openSecondStorages[player.id]);
            Athena.webview.emit(player, INVENTORY_EVENTS.TO_WEBVIEW.SET_SECOND, fullSecondStorageList, storageName, secondStorageSize, storageWeight, secondStorageMaxWeight);
        },
        /**
         * Updates a storage session with new data.
         *
         * @param {alt.Player} player An alt:V Player Entity
         * @param {Array<StoredItem>} items
         */
        resync(player: alt.Player) {
            if (!openSecondStorages[player.id]) {
                return;
            }

            openSecondStorages[player.id] = Athena.systems.inventory.weight.update(openSecondStorages[player.id]);
            const storageWeight = Athena.systems.inventory.weight.getDataWeight(openSecondStorages[player.id]);

            const fullStorageList = Athena.systems.inventory.manager.convertFromStored(openSecondStorages[player.id]);

            Athena.webview.emit(player, INVENTORY_EVENTS.TO_WEBVIEW.RESYNC_SECOND, fullStorageList, storageWeight);
        },
        /**
         * Returns true if a player is using the matching session uid.
         *
         * @param {alt.Player} player An alt:V Player Entity
         * @param {string} uid A unique string
         * @return {void}
         */
        isUsingSession(player: alt.Player, uid: string) {
            return openSecondStorageSessions[player.id] === uid;
        },
        /**
         * Returns true if the session with a specific uid is in use.
         *
         * @param {string} uid A unique string
         * @return {void}
         */
        isSessionInUse(uid: string) {
            return Internal.isStorageOpen(uid);
        },
        /** Returns current open second storage id */
        getOpenSecondStorageId(player: alt.Player) {
            return openSecondStorageSessions[player.id];
        },
        getAt<CustomData = {}>(player: alt.Player, slot: number): StoredItem<CustomData> | undefined {
            const openStorage = openSecondStorages[player.id];
            if (!openStorage) {
                return undefined;
            }
            const index = openStorage.findIndex((x) => x.slot === slot);
            if (index <= -1) {
                return undefined;
            }

            return openStorage[index] as StoredItem<CustomData>;
        }
    },
};
