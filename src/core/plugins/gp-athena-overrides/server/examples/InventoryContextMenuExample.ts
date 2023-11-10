import * as alt from 'alt-server';
import * as Athena from '@AthenaServer/api/index.js';
import { DefaultItemBehavior, Item, StoredItem } from '@AthenaShared/interfaces/item.js';
import { ISharedItem } from '@AthenaPlugins/gp-items-shared/shared/interfaces.js';
import { InventoryType } from '@AthenaPlugins/core-inventory/shared/interfaces.js';

const enum ExampleActions {
    Action1 = 'gp-athena-overrides:example:action1',
}
export class InventoryContextMenuExample {
    static init() {
        //TODO Example menu..check if it works. also check db, should not be saved! Too much data!
        Athena.systems.inventory.factory.addInjection(
            'fromStoredItem_AfterInjection',
            InventoryContextMenuExample.addContextMenu,
        );

        alt.onClient(ExampleActions.Action1, InventoryContextMenuExample.action1);
    }

    static action1(player: alt.Player, type: InventoryType, slot: number) {
        alt.log('action1');
        //To something with item...
    }

    static addContextMenu<CustomData = ISharedItem, CustomBehavior = DefaultItemBehavior>(
        functionName: string,
        item: Item<CustomBehavior & DefaultItemBehavior, CustomData>,
    ) {
        const contextMenuName = 'example context';
        const clothingContextMenuName = 'example clothing context';

        //FIXME: Workaround - prevent double creation by removing old menue with same name
        if (item.customEventsToCall) {
            let index = item.customEventsToCall.findIndex((subMenu) => subMenu.name === contextMenuName);
            if (index !== -1) {
                item.customEventsToCall.splice(index, 1);
            }

            index = item.customEventsToCall.findIndex((subMenu) => subMenu.name === clothingContextMenuName);
            if (index !== -1) {
                item.customEventsToCall.splice(index, 1);
            }
        }

        //FIXME: Workaround - prevent double creation by removing old menue with same name
        if (item.customSubMenus) {
            let index = item.customSubMenus.findIndex((subMenu) => subMenu.name === clothingContextMenuName);
            if (index !== -1) {
                item.customSubMenus.splice(index, 1);
            }
        }

        //Example for context menu
        if (!item.customEventsToCall) {
            item.customEventsToCall = [];
        }

        item.customEventsToCall.push({ name: contextMenuName, eventToCall: ExampleActions.Action1 });

        //Example for submenues
        if ((item as StoredItem<ISharedItem>).data.type === 'clothing') {
            item.customSubMenus.push({
                name: clothingContextMenuName,
                isOpen: false,
                contextActions: [
                    {
                        name: 'action 1',
                        eventToCall: ExampleActions.Action1,
                    },
                ],
                customSubMenus: [
                    {
                        name: 'Sub menue 1',
                        isOpen: false,
                        contextActions: [
                            {
                                name: 'sub menu action 1',
                                eventToCall: ExampleActions.Action1,
                            },
                            {
                                name: 'sub menu action 2',
                                eventToCall: ExampleActions.Action1,
                            },
                        ],
                    },
                ],
            });
        }

        return item;
    }
}
