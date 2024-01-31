import * as alt from 'alt-server';
import * as Athena from '@AthenaServer/api/index.js';
import { RegisterItems } from './src/registerItems.js';

const PLUGIN_NAME = 'GP-Items-Shared';

Athena.systems.plugins.registerPlugin(PLUGIN_NAME, async () => {
    
    // alt.log(`~lg~${PLUGIN_NAME} loading... ItemInjection`);
    // await ItemInjections.init();
    alt.log(`~lg~${PLUGIN_NAME} loading... RegisterItems`);
    await RegisterItems.init();
    // alt.log(`~lg~${PLUGIN_NAME} loading... UpdateItems`);
    // await UpdateItems.init();
    // alt.log(`~lg~${PLUGIN_NAME} loading... VitalEffects`);
    // await VitalEffects.init();
    // alt.log(`~lg~${PLUGIN_NAME} loading... ObjectAttachments`);
    // await ObjectAttachments.init();
    // alt.log(`~lg~${PLUGIN_NAME} loading... ObjectEffects`);
    // await ObjectEffects.init();
    // alt.log(`~lg~${PLUGIN_NAME} loading... ObjectOptions`);
    // await ObjectOptions.init();
    // alt.log(`~lg~${PLUGIN_NAME} loading... ObjectAnimations`);
    // await ObjectAnimations.init();
    // alt.log(`~lg~${PLUGIN_NAME} loading... InteractionEffects`);
    // await InteractionEffects.init();
    // alt.log(`~lg~${PLUGIN_NAME} loading... ItemContextMenu`);
    // await ItemContextMenu.init();

    alt.log(`~lg~${PLUGIN_NAME} (Free version) was Loaded`);
});
