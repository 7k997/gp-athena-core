import * as alt from 'alt-client';
import { CameraTarget } from './src/replacements/cameraTarget';
import { Configurations } from './src/configurations';
import { EntitySelectorOverride } from './src/overrides/entitySelectorOverride';
import { MapObjectTarget } from './src/replacements/mapObjectTarget';

Configurations.init();
// EntitySelectorOverride.init(); //not needed right now, DO NOT USE
// CameraTarget.init();
MapObjectTarget.init();

alt.log(`~ly~Plugin Loaded -- gpAnimations`);
