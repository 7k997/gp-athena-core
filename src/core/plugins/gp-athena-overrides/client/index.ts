import * as alt from 'alt-client';
import { CameraTarget } from './src/replacements/cameraTarget.js';
import { Configurations } from './src/configurations.js';
import { EntitySelectorOverride } from './src/overrides/entitySelectorOverride.js';
import { MapObjectTarget } from './src/replacements/mapObjectTarget.js';

Configurations.init();
// EntitySelectorOverride.init(); //not needed right now, DO NOT USE
// CameraTarget.init();
MapObjectTarget.init();

alt.log(`~ly~Plugin Loaded -- gpAnimations`);
