import alt from 'alt-server';
import * as Athena from '@AthenaServer/api/index.js';
import { WeatherCommands } from './src/commands/weatherCommands.js';
import { World } from './src/world.js';

const PLUGIN_NAME = 'Athena Weather';

Athena.systems.plugins.registerPlugin(PLUGIN_NAME, () => {
    WeatherCommands.init();
    World.init();
    alt.log(`~lg~CORE ==> ${PLUGIN_NAME} Loaded.`);
});
