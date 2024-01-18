export type InventoryType = 'inventory' | 'toolbar' | 'custom' | 'machine';

export interface SlotInfo {
    slot: number;
    location: 'inventory' | 'toolbar' | 'custom' | 'machine';
    hasItem: boolean;
    quantity: number;
    name: string;
    totalWeight: number;
    highlight?: boolean;
    price?: number;
}

export interface DualSlotInfo {
    startType: InventoryType;
    startIndex: number;
    startMaxWeight: number;
    startMaxSlots: number;
    endType: InventoryType;
    endIndex: number;
    endMaxWeight: number;
    endMaxSlots: number;
}
