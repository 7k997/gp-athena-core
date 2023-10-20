import * as alt from 'alt-server';
import * as AthenaClient from '@AthenaClient/api/index.js';
import * as PlayerEvents from '@AthenaServer/player/events.js';
import NametagConfig from './config.js';
import { NAMETAG_EVENTS } from '../enums.js';

/**
 * Send the configuration to the player.
 * @param {alt.Player} player - The player to pass the configuration to.
 * @returns None
 */
function passConfiguration(player: alt.Player) {
    alt.emitClient(player, NAMETAG_EVENTS.CONFIG, NametagConfig);
}

export class Nametags {
    /**
     * Creates a callback handler for setting up nametags when the user spawns.
     * @static
     * @memberof Nametags
     */
    static init() {
        PlayerEvents.on('selected-character', passConfiguration);
    }
}
