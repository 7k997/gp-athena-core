import * as alt from 'alt-server';
import * as Athena from '@AthenaServer/api/index.js';
import { DeathCommands } from './src/commands.js';
import { DeathSystem } from './src/death.js';

const PLUGIN_NAME = 'Athena Death System';

Athena.systems.plugins.registerPlugin(PLUGIN_NAME, () => {
    DeathSystem.init();
    DeathCommands.init();
    alt.log(`~lg~CORE ==> ${PLUGIN_NAME} was Loaded`);
});
