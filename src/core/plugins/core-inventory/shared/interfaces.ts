export type InventoryType = 'inventory' | 'toolbar' | 'custom' | 'machine';

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
