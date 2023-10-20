import * as charRef from '../../../../shared/interfaces/character.js';

// Extends the player interface.
declare module 'alt-server' {
    export interface Character extends Partial<charRef.Character> {
        /**
         * The ipl string that this player belongs to atm.
         * Also used as a way to tell if a player is in an interior.
         * @type {(null | undefined | string)}
         * @memberof Character
         */
        interiorUID?: null | undefined | string;
    }
}
