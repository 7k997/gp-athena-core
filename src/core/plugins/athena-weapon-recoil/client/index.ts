import * as alt from 'alt-client';
import * as native from 'natives';
import { config } from '../shared/config.js';

alt.on('connectionComplete', () => {
    if (config.shooting_stat.enabled) alt.setStat('shooting_ability', config.shooting_stat.value);
});

//TODO Perfomance, only if weapon in hand
alt.everyTick(() => {
    if (native.isPedShooting(alt.Player.local.scriptID)) {
        if (config.shooting_stat.enabled) alt.setStat('shooting_ability', config.shooting_stat.value);
        let wep = native.getSelectedPedWeapon(alt.Player.local.scriptID);
        if (config.rates[wep] && config.rates[wep] != 0)
            native.setGameplayCamRelativePitch(native.getGameplayCamRelativePitch() + config.rates[wep], 1.2);
    }
});
