import * as Athena from '@AthenaServer/api/index.js';
import { Config } from '@AthenaPlugins/gp-athena-overrides/shared/config.js';
import { InventoryContextMenuExample } from './InventoryContextMenuExample.js';

export class Examples {
    static init() {
        if (!Config.EXAMPLES_ENABLED) return;

        InventoryContextMenuExample.init();
    }
}
