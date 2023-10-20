import * as alt from 'alt-server';
import * as Athena from '@AthenaServer/api/index.js';

import { VitalsSystem } from './src/system.js';

import './src/commands.js';
import { VitalsEffects } from './src/effects.js';

const PLUGIN_NAME = 'Vitals Plugin';

Athena.systems.plugins.registerPlugin(PLUGIN_NAME, () => {
    VitalsSystem.init();
    VitalsEffects.init();
    alt.log(`~lg~CORE ==> ${PLUGIN_NAME} was Loaded`);
});
