import * as alt from 'alt-server';
import * as Athena from '@AthenaServer/api/index.js';
import { FuelStationSystem } from './src/fuelStation.js';

const PLUGIN_NAME = 'Athena Fuel Station';

Athena.systems.plugins.registerPlugin(PLUGIN_NAME, () => {
    FuelStationSystem.init();
    alt.log(`~lg~CORE ==> ${PLUGIN_NAME} was Loaded`);
});
