import * as alt from 'alt-server';
import * as Athena from '@AthenaServer/api';
import { Nametags } from './src/nametags';

const PLUGIN_NAME = 'Nametags Plugin';

Athena.systems.plugins.registerPlugin(PLUGIN_NAME, async () => {
    Nametags.init();
    alt.log(`~lg~CORE ==> ${PLUGIN_NAME} was Loaded`);
});
