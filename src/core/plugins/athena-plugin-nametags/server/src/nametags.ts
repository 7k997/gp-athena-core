import * as alt from 'alt-server';
import NametagConfig from './config';
import { NAMETAG_EVENTS } from '../../shared/enums';
import * as PlayerEvents from '@AthenaServer/player/events';
import { Player } from 'alt-client';

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
