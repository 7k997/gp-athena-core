import * as alt from 'alt-server';
import * as Athena from '@AthenaServer/api/index.js';
import { VITAL_NAMES } from '../../shared/enums.js';
import { VitalsSystem } from './system.js';

Athena.systems.messenger.commands.register('setfood', '/setfood [amount]', ['admin'], setFoodCommand);
Athena.systems.messenger.commands.register('setwater', '/setwater [amount]', ['admin'], setWaterCommand);
function setFoodCommand(player: alt.Player, commandValue: string) {
    let value = parseInt(commandValue);

    if (isNaN(value)) {
        Athena.player.emit.message(player, 'Value must be a number.');
        return;
    }

    value = VitalsSystem.normalizeVital(value);
    VitalsSystem.adjustVital(player, VITAL_NAMES.FOOD, value, true);
}
function setWaterCommand(player: alt.Player, commandValue: string) {
    let value = parseInt(commandValue);

    if (isNaN(value)) {
        Athena.player.emit.message(player, 'Value must be a number.');
        return;
    }

    value = VitalsSystem.normalizeVital(value);
    VitalsSystem.adjustVital(player, VITAL_NAMES.WATER, value, true);
}
