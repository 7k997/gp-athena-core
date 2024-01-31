
import { ISharedItem } from '../../interfaces.js';
import { ITEM_TYPES } from '../../enums.js';
import { BaseItemEx } from '@AthenaShared/interfaces/item.js';

export const defaults: BaseItemEx<ISharedItem>[] = [
    {
        name: ITEM_TYPES.CLOTHING_BAG,
        description: '',
        icon: 'clothing',
        maxStack: 3,
        weight: 0.1,
        behavior: {
            canDrop: true,
            canStack: true,
            canTrade: true,
            destroyOnDrop: false,
            isToolbar: true,
            isClothing: true,
        },
        data: {
            type: ITEM_TYPES.CLOTHING_BAG,
            storageid: null,
            wallettype: 'backpack',
            content: 128,
            size: 20,
            max_weight: 25,
        },
        version: 1,
    },
    {
        name: ITEM_TYPES.WALLET,
        description: '',
        icon: 'crate',
        maxStack: 3,
        weight: 0.1,
        behavior: {
            canDrop: true,
            canStack: true,
            canTrade: true,
            destroyOnDrop: false,
            isToolbar: true,
        },
        data: {
            type: ITEM_TYPES.WALLET,
            storageid: null,
            wallettype: 'wallet',
            content: 128,
            size: 20,
            max_weight: 25,
        },
        version: 1,
    },
];
