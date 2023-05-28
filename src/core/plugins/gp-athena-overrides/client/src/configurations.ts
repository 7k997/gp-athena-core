import * as AthenaClient from '@AthenaClient/api';
import { Config } from '@AthenaPlugins/gp-athena-overrides/shared/config';

export class Configurations {
    static init() {
        if (Config.ENTITY_SELECTOR_MARKER_OFF) {
            AthenaClient.systems.entitySelector.setMarkerOff();
        }

        if (Config.ENTITY_SELECTOR_AUTOMODE) {
            AthenaClient.systems.entitySelector.setToAutoMode();
        }
    }
}
