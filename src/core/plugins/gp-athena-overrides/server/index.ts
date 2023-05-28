import * as alt from 'alt-server';
import * as Athena from '@AthenaServer/api';
import { Configuration } from './src/configuration';

const PLUGIN_NAME = 'gpAthenaOverrides';

Athena.systems.plugins.registerPlugin(PLUGIN_NAME, () => {
    Configuration.init();
    alt.log(`~lg~${PLUGIN_NAME} was Loaded`);
});
