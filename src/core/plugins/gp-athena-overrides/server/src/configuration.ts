import * as Athena from '@AthenaServer/api/index.js';
import { Config } from '@AthenaPlugins/gp-athena-overrides/shared/config.js';

export class Configuration {
    static init() {
        if (Config.DISABLE_VEHICLE_SPAWN_DESPAWN) {
            Athena.systems.defaults.vehiclesDespawnOnLeave.disable();
            Athena.systems.defaults.vehiclesSpawnOnJoin.disable();
        }

        if (Config.DISABLE_DEFAULT_WEAPON_ITEMS) Athena.systems.defaults.weaponItems.disable();
        if (Config.DISABLE_DEFAULT_TIME_SYNC) Athena.systems.defaults.time.disable();
        if (Config.DISABLE_HOSPITAL_BLIPS) Athena.systems.defaults.hospitalBlips.disable();
        if (Config.DISABLE_DEFAULT_AMMO) Athena.systems.defaults.ammo.disable();
    }
}
