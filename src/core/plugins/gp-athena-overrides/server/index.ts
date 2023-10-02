import * as alt from 'alt-server';
import * as Athena from '@AthenaServer/api';
import { Configuration } from './src/configuration';
import { VehiclesSpawn } from './src/vehiclesSpawn';
import { Examples } from './examples';

const PLUGIN_NAME = 'gpAthenaOverrides';

Athena.systems.plugins.registerPlugin(PLUGIN_NAME, () => {
    Configuration.init();
    VehiclesSpawn.init();
    Examples.init();
    alt.log(`~lg~${PLUGIN_NAME} was Loaded`);
});
