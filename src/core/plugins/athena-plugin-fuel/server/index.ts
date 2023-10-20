import * as alt from 'alt-server';
import * as Athena from '@AthenaServer/api/index.js';
import { FuelSystem } from './src/fuel.js';

const PLUGIN_NAME = 'Athena Fuel';

Athena.systems.plugins.registerPlugin(PLUGIN_NAME, () => {
    FuelSystem.init();
    alt.log(`~lg~CORE ==> ${PLUGIN_NAME} was Loaded`);
});
