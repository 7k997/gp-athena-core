import { Appearance } from '@AthenaShared/interfaces/appearance.js';
import { LOCALE } from '@AthenaShared/locale/locale.js';

export interface Meta {
    permissionLevel: number; // Used to determine the player's current permissionLevel as a player..
    isDead: boolean; // Used to determine when a player is dead or not.
    //NOT FILLED ANYMORE!!! gridSpace: number; // Used to identify what part of the map the player is on. Based on Y Axis.

    /**
     * Check if in a voice channel.
     *
     * @type {boolean}
     *
     */
    voice: boolean;

    // Currency
    bank: number;
    cash: number;
    bankNumber: number;

    // Food & Water
    food: number;
    water: number;

    // Player Info
    appearance: Appearance;

    // Keys
    lockIDs: number[];
    mainLockIDs: number[];

    // Multilanguage
    displayLanguage: LOCALE;
}
