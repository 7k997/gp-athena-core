import * as alt from 'alt-server';

import * as Athena from '@AthenaServer/api/index.js';
import { StoredItem } from '@AthenaShared/interfaces/item.js';
import { deepCloneArray, deepCloneObject } from '@AthenaShared/utility/deepCopy.js';

export type dbName = string;

export type ItemCombo = dbName[];

export type Quantities = number[];

export interface CraftRecipe {
    /**
     * A unique identifier for this recipe.
     *
     * @type {string}
     *
     */
    uid: string;

    /**
     * Multiple items that can be combined.
     *
     * @type {ItemCombo}
     *
     */
    combo: ItemCombo;

    /**
     * Specific slots that must be used for the recipe.
     *
     * @type {number[]}
     *
     */
    slots?: number[];

    /**
     * The amount required to combine.
     *
     * @type {Quantities}
     *
     */
    quantities: Quantities;

    /**
     * The dbname of the machine which must be used for the recipe.
     *
     * @type {Quantities}
     *
     */
    machine?: string;

    /**
     * The crafting result.
     *
     * @type {dbName}
     *
     */
    result?: {
        /**
         * Name of the item.
         *
         * @type {string}
         */
        dbName: string;

        /**
         * The amount of this item.
         *
         * @type {number}
         */
        quantity: number;

        /**
         * What version of this item to use.
         *
         * @type {(number | undefined)}
         */
        version?: number | undefined;

        /**
         * The custom data to start with on this item.
         * If data migration is specified; the data will be stacked on top of this data object.
         *
         * @type {Object}
         */
        data?: Object | ((item1: StoredItem, item2: StoredItem) => Object);
    };

    /**
     * What items to take the data from.
     * ORDER MATTERS. What item is specified first will get data appended first.
     * Second item overwrites matching property names.
     *
     * @type {ItemCombo}
     *
     */
    dataMigration?: ItemCombo;

    /**
     * The custom sound associated with this crafting recipe.
     *
     * @type {string}
     *
     */
    sound?: string;
}

const recipes: Array<CraftRecipe> = [];

/**
 * Add a recipe in-memory. Does not store to database.
 *
 * #### Example
 * ```ts
 * Athena.systems.inventory.crafting.addRecipe({
 *   combo: ['burger', 'tomato'],
 *   quantities: [1, 1],
 *   uid: 'burger-with-tomato',
 *   result: { dbName: 'burger-with-tomato', quantity: 1 },
 * });
 * ```
 *
 * @param {Recipe} recipe
 */
export function addRecipe(recipe: CraftRecipe): boolean {
    if (Overrides.addRecipe) {
        return Overrides.addRecipe(recipe);
    }

    if (recipe.combo.length !== recipe.quantities.length) {
        alt.logWarning(`Aborted Recipe. Recipe ${recipe.uid} needs matching items and quantities.`);
        return false;
    }

    if (recipe.combo.length < 1) {
        alt.logWarning(`Aborted Recipe. Recipe ${recipe.uid} needs at least one item.`);
        return false;
    }

    for (const quantity of recipe.quantities) {
        if (quantity <= 0) {
            alt.logWarning(`Aborted Recipe. Recipe ${recipe.uid} has invalid quantities.`);
            return false;
        }
    }

    alt.log(`~c~Recipe: ~lg~${recipe.uid}`);
    recipes.push(recipe);
    return true;
}

/**
 * Remove a recipe from in-memory storage.
 *
 * @param {string} uid - The unique identifier of the recipe to be removed.
 * @returns {boolean} - True if the recipe was found and removed, false otherwise.
 */
export function removeRecipe(uid: string): boolean {
    const index = recipes.findIndex((recipe) => recipe.uid === uid);

    if (index !== -1) {
        recipes.splice(index, 1);
        alt.log(`~c~Removed Recipe: ~lr~${uid}`);
        return true;
    }

    alt.logWarning(`Recipe with UID ${uid} not found.`);
    return false;
}

export function findRecipe(combo: ItemCombo, machine?: string, slotNumbers?: number[]): CraftRecipe | undefined {
    if (Overrides.findRecipe) {
        return Overrides.findRecipe(combo);
    }

    if (combo.length < 1) {
        return undefined;
    }

    for (const recipe of recipes) {
        if (combo.length !== recipe.combo.length || (slotNumbers && slotNumbers.length !== recipe.combo.length)) {
            continue;
        }

        let foundItems = 0;

        for (let i = 0; i < combo.length; i++) {
            const item = combo[i];
            const slotNumber = slotNumbers && slotNumbers[i];

            if (recipe.combo.includes(item)) {
                if (!slotNumber || slotNumber === i) {
                    foundItems += 1;
                } else {
                    // Wenn eine Slot-Nummer angegeben ist, aber nicht übereinstimmt, breche die Überprüfung ab
                    foundItems = 0;
                    break;
                }
            }
        }

        if (foundItems === combo.length && (!recipe.machine || recipe.machine === machine)) {
            return recipe;
        }
    }

    return undefined;
}


/**
 * Combine two slots given a data set.
 * It will attempt to find a matching recipe and make modifications according to the combination.
 * Returns an object with the modified dataSet, and a sound associated with the crafting recipe if provided in the recipe itself.
 *
 * @param {Array<StoredItem>} dataSet
 * @param {number} slot1
 * @param {number} slot2
 * @returns {{ dataSet: Array<StoredItem>; sound?: string } | undefined}
 */
export function combineItems(
    dataSet: Array<StoredItem>,
    slot1: number,
    slot2: number,
    type: 'inventory' | 'toolbar' | 'custom',
): { dataSet: Array<StoredItem>; sound?: string } | undefined {
    if (Overrides.combineItems) {
        return Overrides.combineItems(dataSet, slot1, slot2, type);
    }

    if (slot1 === slot2) {
        return undefined;
    }

    const item1 = Athena.systems.inventory.slot.getAt(slot1, dataSet);
    const item2 = Athena.systems.inventory.slot.getAt(slot2, dataSet);

    if (!item1 || !item2) {
        return undefined;
    }

    if (item1.disableCrafting || item2.disableCrafting) {
        return undefined;
    }

    if (typeof item1 === 'undefined' || typeof item2 === 'undefined') {
        return undefined;
    }

    const recipe = findRecipe([item1.dbName, item2.dbName]);
    if (typeof recipe === 'undefined') {
        return undefined;
    }

    // Verify Quantities
    if (!Athena.systems.inventory.manager.hasItem(dataSet, recipe.combo[0], recipe.quantities[0])) {
        return undefined;
    }

    if (!Athena.systems.inventory.manager.hasItem(dataSet, recipe.combo[1], recipe.quantities[1])) {
        return undefined;
    }

    // Recipe found; now to remove both items.
    const baseItem = Athena.systems.inventory.factory.getBaseItem(recipe.result.dbName, recipe.result.version);
    if (typeof baseItem === 'undefined') {
        alt.logWarning(`Aborted Recipe. Recipe ${recipe.uid} cannot find item provided in result.`);
        return undefined;
    }

    // Attempt to find an open slot to combine data into.
    const openSlot = Athena.systems.inventory.slot.findOpen(type, dataSet);
    if (typeof openSlot === 'undefined') {
        return undefined;
    }

    let newItem: Omit<StoredItem, 'slot'> = {
        dbName: recipe.result.dbName,
        quantity: recipe.result.quantity,
        version: recipe.result.version,
        data: baseItem.data ? deepCloneObject(baseItem.data) : {},
    };

    if (typeof recipe.result.data === 'function') {
        newItem.data = recipe.result.data(item1, item2);

        if (typeof newItem.data === 'undefined') {
            return undefined;
        }
    } else {
        if (recipe.result.data) {
            newItem.data = Object.assign(newItem.data, recipe.result.data);
        }

        // Combines data sets based on specified data migration by dbNames.
        if (recipe.dataMigration && recipe.dataMigration.length >= 1) {
            const firstCombine = recipe.dataMigration[0] === item1.dbName ? item1 : item2;
            newItem.data = Object.assign(newItem.data, firstCombine.data);

            if (recipe.dataMigration.length >= 2) {
                const secondCombine = recipe.dataMigration[0] === item1.dbName ? item1 : item2;
                newItem.data = Object.assign(newItem.data, secondCombine.data);
            }
        }
    }

    // Remove quantities from original data set...
    let newData = deepCloneArray<StoredItem>(dataSet);
    for (let i = 0; i < recipe.combo.length; i++) {
        if (i === 0 ? item1.quantity : item2.quantity === recipe.quantities[i]) {
            newData = Athena.systems.inventory.slot.removeAt(i === 0 ? slot1 : slot2, newData);
        } else {
            newData = Athena.systems.inventory.manager.sub(
                { dbName: recipe.combo[i], quantity: recipe.quantities[i] },
                newData,
            );
        }

        if (typeof newData === 'undefined') {
            return undefined;
        }
    }

    newData = Athena.systems.inventory.manager.add(newItem, newData, type);
    if (typeof newData === 'undefined') {
        return undefined;
    }

    return { dataSet: newData, sound: recipe.sound };
}


interface CraftingFuncs {
    addRecipe: typeof addRecipe;
    combineItems: typeof combineItems;
    findRecipe: typeof findRecipe;
}

const Overrides: Partial<CraftingFuncs> = {};

export function override(functionName: 'addRecipe', callback: typeof addRecipe);
export function override(functionName: 'combineItems', callback: typeof combineItems);
export function override(functionName: 'findRecipe', callback: typeof findRecipe);
/**
 * Used to override inventory crafting functionality
 *
 *
 * @param {keyof CraftingFuncs} functionName
 * @param {*} callback
 */
export function override(functionName: keyof CraftingFuncs, callback: any): void {
    Overrides[functionName] = callback;
}
