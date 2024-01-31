import * as alt from 'alt-server';
import { ISharedItem } from '@AthenaPlugins/gp-items-shared/shared/interfaces.js';
import { BaseItemEx } from '@AthenaShared/interfaces/item.js';

let pluginItems: BaseItemEx<ISharedItem>[] = [];
export class SharedItemCache {
    static async getItems(): Promise<Array<BaseItemEx<ISharedItem>>> {
        //TODO: Wait for all plugins to register their items
        await alt.Utils.wait(1000 * 60);
        return [ ...pluginItems];
    }

    static addPluginItems(newItems: Array<BaseItemEx<ISharedItem>>) {
        pluginItems = [...pluginItems, ...newItems];
    }
}
