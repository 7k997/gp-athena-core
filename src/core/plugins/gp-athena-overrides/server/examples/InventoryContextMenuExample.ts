// import * as Athena from '@AthenaServer/api/index.js';
// import { DefaultItemBehavior, Item, StoredItem } from '@AthenaShared/interfaces/item.js';
// import { ISharedItem } from '@AthenaPlugins/gp-items-shared/shared/interfaces.js';

// export class InventoryContextMenuExample {
//     static init() {
//         Athena.systems.inventory.factory.addInjection(
//             'fromStoredItem_AfterInjection',
//             InventoryContextMenuExample.addContextMenu,
//         );
//     }

//     static addContextMenu<CustomData = ISharedItem, CustomBehavior = DefaultItemBehavior>(
//         functionName: string,
//         item: Item<CustomBehavior & DefaultItemBehavior, CustomData>,
//     ) {
//         if (!item.customEventsToCall) {
//             item.customEventsToCall = [];
//         }
//         item.customEventsToCall.push({ name: 'example context', eventToCall: 'example' });

//         if ((item as StoredItem<ISharedItem>).data.type === 'clothing') {
//             item.customEventsToCall.push({ name: 'example clothing context', eventToCall: 'example' });
//         }
//         return item;
//     }
// }
