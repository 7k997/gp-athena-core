import * as alt from 'alt-server';
import * as Athena from '@AthenaServer/api/index.js';
import { Configuration } from './src/configuration.js';
import { VehiclesSpawn } from './src/vehiclesSpawn.js';
import { Notifications } from './overrides/notifications.js';
// import { Examples } from './examples/index.js';

const PLUGIN_NAME = 'gpAthenaOverrides';

Athena.systems.plugins.registerPlugin(PLUGIN_NAME, () => {
    Configuration.init();
    VehiclesSpawn.init();
    Notifications.init();
    // Examples.init();
    alt.log(`~lg~${PLUGIN_NAME} was Loaded`);
});
