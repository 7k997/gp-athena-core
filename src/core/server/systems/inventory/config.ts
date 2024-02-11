import { GLOBAL_SYNCED } from '@AthenaShared/enums/globalSynced.js';
import de from '@AthenaShared/locale/languages/de.js';
import * as alt from 'alt-server';

/**
 * Do not modify this directly.
 * These are used as internal values.
 * Use the config setter / getter in ItemManager system to modify.
 * @type {*}
 * */
let DEFAULT_CONFIG = {
    inventory: {
        size: 30,
        weight: 64,
    },
    toolbar: {
        size: 4,
        weight: 64,
    },
    custom: {
        size: 256,
        weight: 64,
    },
    second: {
        size: 256,
        weight: 64,
    },
    machine: {
        size: 9,
        weight: 5,
    },
    /**
     * @deprecated Use `inventory.weight` instead. No disable for now - untested!
     */
    weight: {
        enabled: true,
    },
};

/**
 * Modify the existing inventory configurations.
 * Values set may not work with interfaces designed for default values above.
 *
 * @param {typeof DEFAULT} config
 */
export function set(config: typeof DEFAULT_CONFIG) {
    DEFAULT_CONFIG = Object.assign(DEFAULT_CONFIG, config);
    alt.setSyncedMeta(GLOBAL_SYNCED.INVENTORY_WEIGHT_ENABLED, DEFAULT_CONFIG.weight.enabled);
}

/**
 * Returns the current inventory configurations.
 *
 * @return {typeof DEFAULT}
 */
export function get(): typeof DEFAULT_CONFIG {
    return DEFAULT_CONFIG;
}

/**
 * Use this function to disable weight restrictions on inventories.
 * @deprecated Use `inventory.weight` instead. No disable for now!
 */
export function disableWeight() {
    DEFAULT_CONFIG.weight.enabled = false;
    alt.setSyncedMeta(GLOBAL_SYNCED.INVENTORY_WEIGHT_ENABLED, false);
}
