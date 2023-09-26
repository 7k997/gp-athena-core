import * as alt from 'alt-server';
import Database from '@stuyk/ezmongodb';
import * as Athena from '@AthenaServer/api';
import { StoredItem } from '@AthenaShared/interfaces/item';

class ItemSemaphore {
    private semaphores: Map<string, number> = new Map();

    public async acquire(storageId: string, slot: number): Promise<boolean> {
        const semaphoreKey = this.getSemaphoreKey(storageId, slot);
        const currentCount = this.semaphores.get(semaphoreKey) || 0;

        if (currentCount === 0) {
            this.semaphores.set(semaphoreKey, 1);
            return true;
        }

        return false;
    }

    public release(storageId: string, slot: number): void {
        const semaphoreKey = this.getSemaphoreKey(storageId, slot);
        const currentCount = this.semaphores.get(semaphoreKey) || 0;

        if (currentCount > 0) {
            this.semaphores.set(semaphoreKey, currentCount - 1);
        }
    }

    private getSemaphoreKey(storageId: string, slot: number): string {
        return `${storageId}_${slot}`;
    }
}

const itemSemaphores: { [storageId_slot: string]: ItemSemaphore } = {};

const openIdentifiers: string[] = [];
const boundIdentifiers: Array<{ id: number; storage: string }> = [];

interface StorageUpdateStatus {
    [storageId: string]: boolean;
}

const subscriptions: Array<{ id: number; storage: string }> = [];
const updateStatus: StorageUpdateStatus = {};
const notifyInterval = 10000; // 10 Sekunden

function init() {
    Database.createCollection(Athena.database.collections.Storage);
}

export interface StorageInstance<CustomData = {}> {
    _id?: unknown;

    /**
     * The date which this storage was last accessed.
     *
     * @type {number}
     *
     */
    lastUsed: number;

    /**
     * The data stored in the database.
     *
     * @type {Array<StoredItem<CustomData>>}
     *
     */
    items: Array<StoredItem<CustomData>>;
}

export function subscribe(player: alt.Player, storage: string): void {
    let id = player.id;
    subscriptions.push({ id, storage });
    if (!updateStatus[storage]) {
        updateStatus[storage] = false;
    }
}

export function unsubscribe(playerId: number, storageId: string): void {
    const index = subscriptions.findIndex((sub) => sub.id === playerId && sub.storage === storageId);
    if (index !== -1) {
        subscriptions.splice(index, 1);
    }
}

setInterval(() => {
    for (const storage in updateStatus) {
        if (updateStatus[storage]) {
            // Notify nur, wenn ein Update für diesen Storage vorliegt
            const affectedSubscriptions = subscriptions.filter((sub) => sub.storage === storage);
            for (const subscription of affectedSubscriptions) {
                // Hier könntest du die Spieler über die Änderung informieren
                // Zum Beispiel: alt.emit('storageChange', subscription.playerId, subscription.storageId);
            }
            updateStatus[storage] = false; // Zurücksetzen nach Benachrichtigung
        }
    }
}, notifyInterval);

// Funktion, um Änderungen zu benachrichtigen
export function notifyChanges(storage: string): void {
    const affectedSubscriptions = subscriptions.filter((sub) => sub.storage === storage);
    for (const subscription of affectedSubscriptions) {
        // Hier könntest du die Spieler über die Änderung informieren
        // Zum Beispiel: alt.emit('storageChange', subscription.playerId, storageId);
    }
}

/**
 * Creates a new storage, and returns the '_id' of the storage from the database.
 *
 * Use the ID returned to fetch the data with the other storage functions.
 *
 *
 * @param {Array<StoredItem>} items
 * @return {Promise<string>}
 */
export async function create(items: Array<StoredItem>): Promise<string> {
    if (Overrides.create) {
        return Overrides.create(items);
    }

    const document = await Database.insertData<StorageInstance>(
        { items, lastUsed: Date.now() },
        Athena.database.collections.Storage,
        true,
    );

    return document._id.toString();
}

/**
 * Stores items into a database instance by providing the storage identifier, and the modified items array.
 *
 *
 * @param {string} id
 * @param {Array<StoredItem>} items
 * @returns {Promise<boolean>}
 */
export async function set(id: string, items: Array<StoredItem>): Promise<boolean> {
    if (Overrides.set) {
        return Overrides.set(id, items);
    }

    return await Database.updatePartialData(id, { items, lastUsed: Date.now() }, Athena.database.collections.Storage);
}

/**
 * Fetches stored items from a storage array.
 *
 *
 * @template CustomData
 * @param {string} id
 * @return {Promise<Array<StoredItem<CustomData>>>}
 */
export async function get<CustomData = {}>(id: string): Promise<Array<StoredItem<CustomData>>> {
    if (Overrides.get) {
        return Overrides.get<CustomData>(id);
    }

    const document = await Database.fetchData<StorageInstance<CustomData>>(
        '_id',
        id,
        Athena.database.collections.Storage,
    );

    return document.items;
}

export async function addItem<CustomData = {}>(id: string, item: StoredItem<CustomData>): Promise<boolean> {
    if (Overrides.addItem) {
        return Overrides.addItem(id, item);
    }

    const storage = await get(id);

    // Prüfen, ob das Slot bereits belegt ist
    const slotOccupied = storage.some((existingItem) => existingItem.slot === item.slot);

    if (slotOccupied) {
        return false; // Slot ist bereits belegt
    }

    storage.push(item);

    // Update the storage with the modified items
    await set(id, storage);

    // Aktualisierung für diesen Storage festlegen
    updateStatus[id] = true;

    return true;
}

export async function takeItem<CustomData = {}>(
    id: string,
    item: StoredItem<CustomData>,
): Promise<StoredItem<CustomData> | null> {
    if (Overrides.takeItem) {
        return Overrides.takeItem(id, item);
    }

    // Check if the storage is in exclusive mode
    if (!isOpen(id)) {
        return null; // Storage is in exclusive mode, cannot take item
    }

    const itemSemaphore = getItemSemaphore(id, item.slot);
    const canAccess = await itemSemaphore.acquire(id, item.slot);

    if (!canAccess) {
        // Failed to acquire semaphore (item is being accessed by another operation)
        return null;
    }

    try {
        const storage = await get<CustomData>(id);

        const index = storage.findIndex((storedItem) => storedItem.slot === item.slot);

        if (index !== -1) {
            // Item exists in storage, remove it
            const takenItem = storage.splice(index, 1)[0];

            // Update the storage with the modified items
            await set(id, storage);

            return takenItem;
        } else {
            // Item not found in storage
            return null;
        }
    } finally {
        itemSemaphore.release(id, item.slot);
    }
}

export async function moveItem(id: string, fromSlot: number, toSlot: number): Promise<boolean> {
    if (Overrides.moveItem) {
        return Overrides.moveItem(id, fromSlot, toSlot);
    }

    // Check if the storage is in exclusive mode
    if (!isOpen(id)) {
        return false; // Storage is in exclusive mode, cannot take item
    }

    const itemSemaphoreFrom = getItemSemaphore(id, fromSlot);
    const itemSemaphoreTo = getItemSemaphore(id, toSlot);

    const canAccessFrom = await itemSemaphoreFrom.acquire(id, fromSlot);
    const canAccessTo = await itemSemaphoreTo.acquire(id, toSlot);

    if (!canAccessFrom || !canAccessTo) {
        // Failed to acquire semaphore (another operation is in progress)
        return false;
    }

    try {
        // Perform the item move operation
        const storage = await get(id);
        const itemToMove = storage.find((item) => item.slot === fromSlot);

        if (!itemToMove) {
            // Item not found in the 'fromSlot'
            return false;
        }

        // Update the slot for the item
        itemToMove.slot = toSlot;

        // Update the storage with the modified items
        await set(id, storage);

        return true;
    } finally {
        itemSemaphoreFrom.release(id, fromSlot);
        itemSemaphoreTo.release(id, toSlot);
    }
}

function getItemSemaphore(storageId: string, slot: number): ItemSemaphore {
    const semaphoreKey = `${storageId}_${slot}`;

    if (!itemSemaphores[semaphoreKey]) {
        itemSemaphores[semaphoreKey] = new ItemSemaphore();
    }

    return itemSemaphores[semaphoreKey];
}

/**
 * Sets a storage identifier as in use.
 *
 * Returns true if the value was set to in-use, and didn't already exist.
 *
 *
 * @param {string} id
 * @return {boolean}
 */
export function setAsOpen(id: string): boolean {
    if (Overrides.setAsOpen) {
        return Overrides.setAsOpen(id);
    }

    // Check if the storage is already open
    if (isOpen(id)) {
        return false; // Storage is already in open mode
    }

    openIdentifiers.push(id);
    return true;
}

/**
 * Checks if a storage identifier is currently in use.
 *
 *
 * @param {string} id
 * @return {void}
 */
export function isOpen(id: string): boolean {
    if (Overrides.isOpen) {
        return Overrides.isOpen(id);
    }

    return openIdentifiers.findIndex((x) => x === id) >= 0;
}

/**
 * Removes the storage identifier from in-use status.
 *
 * Returns true if the value was successfully removed.
 *
 *
 * @param {string} id
 * @returns {boolean}
 */
export function removeAsOpen(id: string): boolean {
    if (Overrides.removeAsOpen) {
        return Overrides.removeAsOpen(id);
    }

    let wasRemoved = false;

    for (let i = openIdentifiers.length - 1; i >= 0; i--) {
        if (openIdentifiers[i] === id) {
            openIdentifiers.splice(i, 1);
            wasRemoved = true;
            break;
        }
    }

    for (let i = boundIdentifiers.length - 1; i >= 0; i--) {
        if (boundIdentifiers[i].storage === id) {
            boundIdentifiers.splice(i, 1);
            break;
        }
    }

    return wasRemoved;
}

/**
 * Marks the storage instance as closed if the player disconnects.
 *
 * Automatically removes the player when `removeAsOpen` is called.
 *
 * Returns false if a player binding is already present.
 *
 *
 * @param {alt.Player} player An alt:V Player Entity
 * @param {string} id
 * @returns {boolean}
 */
export function closeOnDisconnect(player: alt.Player, id: string): boolean {
    if (Overrides.closeOnDisconnect) {
        return Overrides.closeOnDisconnect(player, id);
    }

    const index = boundIdentifiers.findIndex((x) => x.id === player.id);
    if (index >= 0) {
        return false;
    }

    boundIdentifiers.push({ id: player.id, storage: id });
    return true;
}

alt.on('playerDisconnect', (player: alt.Player) => {
    // Unsubscribe des Spielers von allen Storage-Änderungen
    const playerSubscriptions = subscriptions.filter((sub) => sub.id === player.id);
    for (const subscription of playerSubscriptions) {
        unsubscribe(subscription.id, subscription.storage);
    }

    // Remove player binding for exclusive access
    const index = boundIdentifiers.findIndex((x) => x.id === player.id);
    if (index >= 0) {
        removeAsOpen(boundIdentifiers[index].storage);
    }
});

init();

interface StorageFuncs {
    create: typeof create;
    set: typeof set;
    get: typeof get;
    setAsOpen: typeof setAsOpen;
    removeAsOpen: typeof removeAsOpen;
    isOpen: typeof isOpen;
    closeOnDisconnect: typeof closeOnDisconnect;
    addItem: typeof addItem;
    takeItem: typeof takeItem;
    moveItem: typeof moveItem;
}

const Overrides: Partial<StorageFuncs> = {};

export function override(functionName: 'create', callback: typeof create);
export function override(functionName: 'set', callback: typeof set);
export function override(functionName: 'get', callback: typeof get);
export function override(functionName: 'setAsOpen', callback: typeof setAsOpen);
export function override(functionName: 'isOpen', callback: typeof isOpen);
export function override(functionName: 'removeAsOpen', callback: typeof removeAsOpen);
export function override(functionName: 'closeOnDisconnect', callback: typeof closeOnDisconnect);
export function override(functionName: 'addItem', callback: typeof addItem);
export function override(functionName: 'takeItem', callback: typeof takeItem);
export function override(functionName: 'moveItem', callback: typeof moveItem);
/**
 * Used to override storage functions.
 *
 *
 * @param {keyof StorageFuncs} functionName
 * @param {*} callback
 */
export function override(functionName: keyof StorageFuncs, callback: any): void {
    Overrides[functionName] = callback;
}
