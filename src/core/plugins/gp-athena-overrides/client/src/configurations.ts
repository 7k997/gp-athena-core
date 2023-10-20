import * as AthenaClient from '@AthenaClient/api/index.js';
import { Config } from '@AthenaPlugins/gp-athena-overrides/shared/config.js';

export class Configurations {
    static init() {
        if (Config.ENTITY_SELECTOR_MARKER_OFF) {
            AthenaClient.systems.entitySelector.setMarkerOff();
        }

        if (Config.ENTITY_SELECTOR_AUTOMODE) {
            AthenaClient.systems.entitySelector.setToAutoMode();
        }

        AthenaClient.streamers.item.setDefaultMaxDistance(Config.DEFAULT_STREAMING_DISTANCE);
    }
}
