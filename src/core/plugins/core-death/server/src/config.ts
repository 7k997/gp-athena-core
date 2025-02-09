import { Config } from '@AthenaPlugins/gp-athena-overrides/shared/config.js';

export const DEATH_CONFIG = {
    RESPAWN_TIME: 30000,
    LOSE_ALL_WEAPONS_ON_RESPAWN: !Config.DISABLE_WEAPON_REMOVE_ON_DEATH,
    RESPAWN_HEALTH: 199,
    RESPAWN_ARMOUR: 0,
    HOSPITALS: [
        { x: -248.01309204101562, y: 6332.01513671875, z: 33.0750732421875 },
        { x: 1839.15771484375, y: 3672.702392578125, z: 34.51904296875 },
        { x: 297.4647521972656, y: -584.7089233398438, z: 44.292724609375 },
        { x: -677.0172119140625, y: 311.7821350097656, z: 83.601806640625 },
        { x: 1151.2904052734375, y: -1529.903564453125, z: 36.3017578125 },
        { x: -449.5361328125, y: -340.45361328125, z: 34.501773834228516 },
    ],
};
