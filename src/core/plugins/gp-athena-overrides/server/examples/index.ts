import * as Athena from '@AthenaServer/api';
import { Config } from '@AthenaPlugins/gp-athena-overrides/shared/config';
import { InventoryContextMenuExample } from './InventoryContextMenuExample';

export class Examples {
    static init() {
        if (!Config.EXAMPLES_ENABLED) return;

        InventoryContextMenuExample.init();
    }
}
