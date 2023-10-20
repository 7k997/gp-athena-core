import * as alt from 'alt-server';
import * as Athena from '@AthenaServer/api/index.js';
import { createDefaultInteriors } from './src/interiors.js';
import { InteriorSystem } from './src/system.js';

const PLUGIN_NAME = 'Athena Interiors';

Athena.systems.plugins.registerPlugin(PLUGIN_NAME, async () => {
    await InteriorSystem.init();
    await createDefaultInteriors();
    alt.log(`~lg~CORE ==> ${PLUGIN_NAME} was Loaded`);
});
