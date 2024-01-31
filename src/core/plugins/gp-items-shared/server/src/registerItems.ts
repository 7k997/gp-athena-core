import * as alt from 'alt-server';
import * as Athena from '@AthenaServer/api/index.js';
import { ISharedItem } from '@AthenaPlugins/gp-items-shared/shared/interfaces.js';
import { defaults } from '@AthenaPlugins/gp-items-shared/shared/items/templates/defaults.js';
import { SharedItemCache } from './itemCache.js';
import { BaseItemEx, ItemEx } from '@AthenaShared/interfaces/item.js';
import { ItemUtil } from '@AthenaPlugins/gp-athena-utils/server/utility/itemUtil.js';

export class RegisterItems {
    static async init() {
        alt.logWarning('Registering items...');
        const items = await SharedItemCache.getItems();
        alt.logWarning(`${items.length} items loaded`);
        for (let i = 0; i < items.length; i++) {
            if (i % 1000 === 0) {
                alt.log(i + '/' + items.length);
            }
            alt.logWarning("Added item: " + items[i].name);
            await Athena.systems.inventory.factory.upsertAsync(RegisterItems.updateFromTemplate(items[i]));
        }        
    }

    static updateFromTemplate(item: BaseItemEx<ISharedItem>): BaseItemEx<ISharedItem> {
        const template = defaults.find((template) => {
            if (template.name === item.data.type) {
                return true;
            }
            return false;
        });

        if (template) {
            item = ItemUtil.deepTransferObject<BaseItemEx<ISharedItem>>(item, template);
        }

        return item;
    }
}
