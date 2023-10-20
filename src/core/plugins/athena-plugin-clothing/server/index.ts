import * as alt from 'alt-server';
import * as Athena from '@AthenaServer/api/index.js';
import { ClothingFunctions } from './src/view.js';

const PLUGIN_NAME = 'Athena Clothing';

Athena.systems.plugins.registerPlugin(PLUGIN_NAME, () => {
    ClothingFunctions.init();
    alt.log(`~lg~CORE ==> ${PLUGIN_NAME} was Loaded`);
});
