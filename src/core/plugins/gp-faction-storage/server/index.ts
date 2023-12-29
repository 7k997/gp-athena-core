import * as alt from 'alt-server';
import * as Athena from '@AthenaServer/api/index.js';
import { GPFactionDefaultSystem } from './src/system.js';

const PLUGIN_NAME = 'gp-faction-storage';

Athena.systems.plugins.registerPlugin(PLUGIN_NAME, async () => {
    GPFactionDefaultSystem.init();
    alt.log(`~lg~CORE ==> ${PLUGIN_NAME} was Loaded`);
});
