<template>
    <div class="inventory-split">
        <div class="inventory-frame" v-if="custom && Array.isArray(custom)">
            <div class="inventory-slots-max">
                <Slot
                    v-for="(slot, index) in slotLimits.custom"
                    class="slot"
                    :class="getSelectedItemClass('custom', index)"
                    :key="index"
                    :id="getID('custom', index)"
                    :info="getSlotInfo('custom', index)"
                    @mouseenter="updateDescriptor('custom', index)"
                    @mouseleave="updateDescriptor(undefined, undefined)"
                    @mousedown="
                        (e) => drag(e, { endDrag, canBeDragged: hasItem('custom', index), singleClick, startDrag })
                    "
                >
                    <template v-slot:image v-if="hasItem('custom', index)">
                        <img
                            :src="getImagePath(getItem('custom', index))"
                            :class="`outlined-image-${getItemSex('custom',index)}`"
                        />
                    </template>
                    <template v-slot:index v-else>
                        <template v-if="config.showGridNumbers">
                            {{ slot }}
                        </template>
                    </template>
                </Slot>
            </div>
        </div>
        <div class="spacer">&nbsp;</div>
        <div class="inventory-frame">
            <Split
                :name="splitData.name"
                :slot="splitData.slot"
                :quantity="splitData.quantity"
                @cancel-split="cancelSplit"
                v-if="splitData"
            >
            </Split>
            <Give
                :name="giveData.name"
                :slot="giveData.slot"
                :quantity="giveData.quantity"
                @cancel-give="cancelGive"
                v-if="giveData"
            >
            </Give>
            <div class="inventory-toolbar slot">
                <Slot
                    v-for="(slot, index) in slotLimits.toolbar"
                    class="slot"
                    :key="index"
                    :id="getID('toolbar', index)"
                    :info="getSlotInfo('toolbar', index)"
                    @mouseenter="updateDescriptor('toolbar', index)"
                    @mouseleave="updateDescriptor(undefined, undefined)"
                    @mousedown="(e) => drag(e, { endDrag, canBeDragged: hasItem('toolbar', index), startDrag })"
                    @contextmenu="(e) => unequip(e, index)"
                >
                    <template v-slot:image v-if="hasItem('toolbar', index)">
                        <img :src="getImagePath(getItem('toolbar', index))" @error="handleImageError"/>
                    </template>
                    <template v-slot:index v-else>
                        <template v-if="config.showToolbarNumbers">
                            {{ slot }}
                        </template>
                    </template>
                </Slot>
            </div>
            <div class="inventory-slots">
                <Slot
                    v-for="(slot, index) in slotLimits.inventory"
                    class="slot"
                    :class="getSelectedItemClass('inventory', index)"
                    :key="index"
                    :id="getID('inventory', index)"
                    :info="getSlotInfo('inventory', index)"
                    @mouseenter="updateDescriptor('inventory', index)"
                    @mouseleave="updateDescriptor(undefined, undefined)"
                    @contextmenu="(e) => contextMenu(e, index)"
                    @mousedown="
                        (e) => drag(e, { endDrag, canBeDragged: hasItem('inventory', index), singleClick, startDrag })
                    "
                >
                    <template v-slot:image v-if="hasItem('inventory', index)">
                        <img
                            :src="getImagePath(getItem('inventory', index))"
                            :class="`outlined-image-${getItemSex('inventory', index)}`"
                            @error="handleImageError"
                        />
                    </template>
                    <template v-slot:index v-else>
                        <template v-if="config.showGridNumbers">
                            {{ slot }}
                        </template>
                    </template>
                </Slot>
            </div>
            <div class="weight-frame" v-if="config.isWeightEnabled">
                <div class="split">
                    <div class="icon pr-2">
                        <Icon class="grey--text text--lighten-1" :noSelect="true" :size="18" icon="icon-anvil"></Icon>
                    </div>
                    <span class="weight-text">
                        {{ totalWeight.toFixed(2) }} / {{ config.maxWeight }} {{ config.units }}
                    </span>
                </div>
            </div>
            <Context :contextTitle="context.title" :x="context.x" :y="context.y" v-if="context && contextShow">
                <div v-if="context.hasUseEffect" @click="contextAction('use')">Use</div>
                <template v-for="customAction in context.customEvents">
                    <div @click="contextAction('use', customAction.eventToCall)">{{ customAction.name }}</div>
                </template>

                <!-- Hier beginnt die Hinzufügung der rekursiven Untermenüs -->
                <template v-for="customSub in context.customSubMenus">
                    <ContextSub
                        :subContextTitle="customSub.name"
                        :submenus="customSub.customSubMenus"
                        :actions="customSub.contextActions"
                        :isTopLevel="true"
                        @contextParentAction="contextAction"
                    >
                        <!-- Hier wird das rekursive Untermenü angezeigt -->
                        <!-- <template v-for="subMenuAction in customSub.contextActions">
                            <div class="sub-menu-itemstest" @click="contextAction('use', subMenuAction.eventToCall)">
                                {{ subMenuAction.name }}
                            </div>
                        </template> -->
                    </ContextSub>
                </template>
                <!-- Hier endet die Hinzufügung der rekursiven Untermenüs -->

                <div @click="contextAction('split')">Split</div>
                <div @click="contextAction('drop')">Drop</div>
                <div @click="contextAction('give')">Give</div>
                <div @click="contextAction('cancel')">Cancel</div>
            </Context>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent } from 'vue';
import { CustomContextAction, CustomSubMenu, Item } from '@AthenaShared/interfaces/item.js';
import { makeDraggable } from '@ViewUtility/drag.js';
import WebViewEvents from '@ViewUtility/webViewEvents.js';
import { INVENTORY_EVENTS } from '../../shared/events.js';
import { getImagePath } from '../utility/inventoryIcon.js';
import { INVENTORY_CONFIG } from '../../shared/config.js';
import { debounceReady } from '../utility/debounce.js';
import { DualSlotInfo, InventoryType } from '@AthenaPlugins/core-inventory/shared/interfaces.js';
import { SlotInfo } from '../utility/slotInfo.js';

export default defineComponent({
    name: 'Inventory',
    components: {
        Slot: defineAsyncComponent(() => import('./Slot.vue')),
        Split: defineAsyncComponent(() => import('./Split.vue')),
        Give: defineAsyncComponent(() => import('./Give.vue')),
        Context: defineAsyncComponent(() => import('./ContextCustom.vue')),
        ContextSub: defineAsyncComponent(() => import('./ContextCustomSub.vue')),
        Icon: defineAsyncComponent(() => import('@ViewComponents/Icon.vue')),
    },
    props: {
        offclick: {
            type: Number,
            default: 0,
        },
    },
    data() {
        return {
            toolbar: [] as Array<Item>,
            inventory: [] as Array<Item>,
            custom: [] as Array<Item>,
            slotLimits: {
                inventory: 30,
                toolbar: 5,
                custom: 35,
            },
            contextShow: false,
            context: undefined as
                | {
                      x: number;
                      y: number;
                      title: string;
                      slot: number;
                      hasUseEffect: boolean;
                      customEvents: Array<CustomContextAction>;
                      customSubMenus: Array<CustomSubMenu>;
                  }
                | undefined,
            itemSingleClick: undefined as { type: InventoryType; index: number },
            itemName: '',
            itemDescription: '',
            totalWeight: 0,
            splitData: undefined as { name: string; slot: number; quantity: number },
            giveData: undefined as { name: string; slot: number; quantity: number },
            config: {
                units: INVENTORY_CONFIG.WEBVIEW.WEIGHT.UNITS,
                showGridNumbers: INVENTORY_CONFIG.WEBVIEW.GRID.SHOW_NUMBERS,
                showToolbarNumbers: INVENTORY_CONFIG.WEBVIEW.TOOLBAR.SHOW_NUMBERS,
                isWeightEnabled: true,
                maxWeight: 64,
            },
        };
    },
    methods: {
        handleImageError(e: Event) {
            const target = e.target as HTMLImageElement;
            target.src = './assets/icons/crate_grey.png';
        },
        getImagePath,
        drag: makeDraggable,
        updateDescriptor(type: InventoryType, index: number) {
            if (typeof type === 'undefined') {
                this.itemName = '';
                this.itemDescription = '';
                return;
            }

            const item = this.getItem(type, index);
            if (!item) {
                this.itemName = '';
                this.itemDescription = '';
                return;
            }

            this.itemName = item.name;
            this.itemDescription = item.description;
        },
        startDrag() {
            this.itemSingleClick = undefined;
        },
        singleClick(type: InventoryType, index: number) {
            if (typeof this.itemSingleClick !== 'undefined') {
                // Ignore same inventory slot
                if (this.itemSingleClick.type === type && this.itemSingleClick.index === index) {
                    return;
                }

                // Ignore inventory types that do not match.
                // Combining should be done inside of inventory only.
                if (this.itemSingleClick.type !== type) {
                    return;
                }

                if (!('alt' in window)) {
                    const secondItem = `${type}-${index}`;
                    const firstItem = `${this.itemSingleClick.type}-${this.itemSingleClick.index}`;
                    console.log(`Combine Event:`, firstItem, secondItem);
                    this.itemSingleClick = undefined;
                    return;
                }

                const info: DualSlotInfo = {
                    startType: this.itemSingleClick.type,
                    startIndex: this.itemSingleClick.index,
                    endType: type,
                    endIndex: index,
                };

                WebViewEvents.emitServer(INVENTORY_EVENTS.TO_SERVER.COMBINE, info);

                this.itemSingleClick = undefined;
                return;
            }

            this.itemSingleClick = { type, index };
        },
        endDrag(startType: InventoryType, startIndex: number, endType: InventoryType, endIndex: number) {
            if (!('alt' in window)) {
                console.log(`Should Perform SWAP or Stack of items.`);
                console.log(startType, startIndex);
                console.log(endType, endIndex);
                return;
            }

            if (!debounceReady()) {
                return;
            }

            // Call server-side swap / stack
            WebViewEvents.playSound(`@plugins/sounds/${INVENTORY_CONFIG.PLUGIN_FOLDER_NAME}/inv_move.ogg`, 0.2);
            const info: DualSlotInfo = {
                startType,
                startIndex,
                endType,
                endIndex,
            };

            WebViewEvents.emitServer(INVENTORY_EVENTS.TO_SERVER.SWAP, info);
        },
        getSlotInfo(type: InventoryType, slot: number): SlotInfo {
            const defaultTemplate: SlotInfo = {
                location: type,
                hasItem: false,
                name: undefined,
                quantity: 0,
                totalWeight: 0,
                highlight: false,
                slot,
            };

            if (typeof this[type] === undefined) {
                return defaultTemplate;
            }

            const items = [...this[type]] as Array<Item>;
            const itemIndex = items.findIndex((item) => item && item.slot === slot);

            if (itemIndex <= -1) {
                return defaultTemplate;
            }

            const item = items[itemIndex];
            if (typeof item === 'undefined') {
                return defaultTemplate;
            }

            defaultTemplate.hasItem = true;
            defaultTemplate.highlight = item.isEquipped;
            defaultTemplate.name = item.name;
            defaultTemplate.quantity = item.quantity;
            defaultTemplate.totalWeight = typeof item.totalWeight === 'number' ? item.totalWeight : 0;
            return defaultTemplate;
        },
        /**
         * Determines if a specific data type has a matching slot item.
         * @param type
         * @param slot
         */
        hasItem(type: InventoryType, slot: number): boolean {
            if (typeof this[type] === undefined) {
                return false;
            }

            const items = [...this[type]] as Array<Item>;
            return items.findIndex((item) => item && item.slot === slot) !== -1;
        },
        getItemSex(type: InventoryType, slot: number): number {
            if (typeof this[type] === undefined) {
                return 3;
            }
            const items = [...this[type]] as Array<Item>;
            let index = items.findIndex((item) => item && item.slot === slot);
            if (index === -1) {
                return 3;
            }

            let item = items[index];
            if (item && item.data) {
                return items[index].data['sex'] as number;
            }

            return 3;
        },
        getItem(type: InventoryType, slot: number): Item | undefined {
            if (typeof this[type] === undefined) {
                return undefined;
            }

            const items = [...this[type]] as Array<Item>;
            return items[items.findIndex((item) => item && item.slot === slot)];
        },
        getSelectedItemClass(type: InventoryType, index: number) {
            if (typeof this.itemSingleClick === 'undefined') {
                return {};
            }

            if (this.itemSingleClick.type !== type || this.itemSingleClick.index !== index) {
                return {};
            }

            return { 'item-outline': true };
        },
        getID(type: InventoryType, index: number): string {
            return type + '-' + index;
        },
        setMaxSlots(value: number) {
            this.maxSlots = value;
        },
        setItems(inventory: Array<Item>, toolbar: Array<Item>, totalWeight: number) {
            this.inventory = inventory;
            this.toolbar = toolbar;
            this.totalWeight = totalWeight;
        },
        setCustomItems(customItems: Array<Item>, maximumSize: number) {
            if (typeof customItems === 'undefined') {
                customItems = [];
            }

            this.custom = customItems;

            if (typeof maximumSize !== 'undefined') {
                const newSlotLimits = { ...this.slotLimits };
                newSlotLimits.custom = maximumSize;
                this.slotLimits = newSlotLimits;
            }
        },
        contextMenu(e: MouseEvent, slot: number) {
            //TODO: Allow running with inventory.

            e.preventDefault();
            if (!this.hasItem('inventory', slot)) {
                return;
            }

            const item = this.getItem('inventory', slot);

            // Let's check, if this item can be used. This information is used to show/hide the "Use" context menu action.
            const hasUseEffect: boolean =
                typeof item.consumableEventToCall !== 'undefined' ||
                (item.behavior && (item.behavior.isEquippable || item.behavior.isWeapon || item.behavior.isClothing));

            this.contextShow = false;
            this.context = {
                title: item.name,
                slot: item.slot,
                x: e.clientX,
                y: e.clientY,
                hasUseEffect: hasUseEffect,
                customEvents: item.customEventsToCall,
                customSubMenus: item.customSubMenus,
            };

            if (e.altKey) {
                // Use item direct if Ctrl is pressed
                this.contextAction('use');
                return;
            } else {
                this.contextShow = true;
            }
        },
        contextAction(
            type: 'use' | 'split' | 'drop' | 'give' | 'cancel' | 'custom',
            eventToCall: string | string[] = undefined,
        ) {
            console.log('eventToCall: ' + eventToCall);

            const slot = this.context.slot;
            this.context = undefined;

            if (typeof slot === 'undefined') {
                return;
            }

            if (type === 'cancel') {
                return;
            }

            if (!debounceReady()) {
                return;
            }

            // Send custom Event
            if (type === 'custom') {
                WebViewEvents.emitServer(eventToCall, 'inventory', slot);
                return;
            }

            // Send Event to do the thing it describes
            if (type === 'use') {
                WebViewEvents.emitServer(INVENTORY_EVENTS.TO_SERVER.USE, 'inventory', slot, eventToCall);
                return;
            }

            if (type === 'split' || type === 'give') {
                const item = this.getItem('inventory', slot);
                if (typeof item === 'undefined') {
                    return;
                }

                if (type === 'split' && item.quantity <= 1) {
                    return;
                }

                const dataName = type === 'split' ? 'splitData' : 'giveData';
                this[dataName] = {
                    name: item.name,
                    quantity: item.quantity,
                    slot: slot,
                };

                return;
            }

            if (type === 'drop') {
                WebViewEvents.emitServer(INVENTORY_EVENTS.TO_SERVER.DROP, 'inventory', slot);
                return;
            }
        },
        unequip(e: Event, slot: number) {
            e.preventDefault();
            if (!this.hasItem('toolbar', slot)) {
                return;
            }

            if (!('alt' in window)) {
                console.log('It should unequip toolbar item @ ' + slot);
                return;
            }

            // Send Event to Server to Unequip
            WebViewEvents.emitServer(INVENTORY_EVENTS.TO_SERVER.UNEQUIP, slot);
        },
        setSize(value: number) {
            const newLimits = { ...this.slotLimits };
            newLimits.inventory = value;
            this.slotLimits = newLimits;
        },
        setWeightState(value: boolean) {
            const newConfig = { ...this.config };
            newConfig.isWeightEnabled = value;
            this.config = newConfig;
        },
        setMaxWeight(value: number) {
            const newConfig = { ...this.config };
            newConfig.maxWeight = value;
            this.config = newConfig;
        },
        cancelSplit() {
            this.splitData = undefined;
        },
        cancelGive() {
            this.giveData = undefined;
        },
        openSubMenuOnHover(customSub) {
            customSub.isOpen = true;
        },
        closeSubMenuOnLeave(customSub) {
            customSub.isOpen = false;
        },
    },
    mounted() {
        this.custom = undefined;

        if ('alt' in window) {
            WebViewEvents.on(INVENTORY_EVENTS.TO_WEBVIEW.SET_CUSTOM, this.setCustomItems);
            WebViewEvents.on(INVENTORY_EVENTS.TO_WEBVIEW.SET_INVENTORY, this.setItems);
            WebViewEvents.on(INVENTORY_EVENTS.TO_WEBVIEW.SET_SIZE, this.setSize);
            WebViewEvents.on(INVENTORY_EVENTS.TO_WEBVIEW.SET_WEIGHT_STATE, this.setWeightState);
            WebViewEvents.on(INVENTORY_EVENTS.TO_WEBVIEW.SET_MAX_WEIGHT, this.setMaxWeight);
            WebViewEvents.emitReady('Inventory');
            return;
        }

        const exampleItem: Item = {
            name: 'Big Box',
            dbName: 'box',
            quantity: 2,
            slot: 0,
            data: {},
            version: 0,
            weight: 1,
            icon: 'assets/icons/crate.png',
        };

        const exampleItems: Array<Item> = [
            exampleItem,
            { ...exampleItem, slot: 2, icon: 'burger', name: 'Burger', totalWeight: 2 },
            { ...exampleItem, slot: 5, icon: 'burger', quantity: 5, name: 'Burger', totalWeight: 5 },
            { ...exampleItem, slot: 23, icon: 'pistol', name: 'Pistol .50', totalWeight: 4, isEquipped: false },
            { ...exampleItem, slot: 24, icon: 'pistol50', name: 'Pistol .50', totalWeight: 4, isEquipped: true },
        ];

        this.setItems(
            exampleItems,
            [{ ...exampleItem, icon: 'assaultrifle', name: 'Assault Rifle', totalWeight: 10 }],
            25,
            true,
            25,
        );

        this.setCustomItems([exampleItem]);
    },
    watch: {
        offclick() {
            this.context = undefined;
        },
    },
});
</script>

<style scoped>
.inventory-split {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    width: 100%;
    position: relative;
}

.spacer {
    flex-grow: 1;
}

.inventory-frame {
    background: rgba(0, 0, 0, 0.75);
    min-width: 512px;
    max-width: 512px;
    box-sizing: border-box;
    border-radius: 6px;
    border: 2px solid rgba(255, 255, 255, 0.2);
    box-sizing: border-box;
    height: 100%;
    align-self: flex-end;
    position: relative;
}

.inventory-frame .inventory-toolbar {
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    align-items: center;
    min-height: 106px;
    max-height: 106px;
}

.inventory-toolbar .slot {
    background: rgba(0, 0, 0, 0.5);
    box-sizing: border-box;
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
}

.inventory-toolbar {
    padding-right: 8px;
}

.inventory-slots {
    display: flex;
    flex-flow: row wrap;
    box-sizing: border-box;
    overflow-y: scroll;
    justify-content: space-evenly;
    align-content: flex-start;
    max-height: 487px;
    padding-top: 12px;
}

.inventory-slots-max {
    display: flex;
    flex-flow: row wrap;
    box-sizing: border-box;
    overflow-y: scroll;
    justify-content: space-evenly;
    align-content: flex-start;
    height: 100%;
    padding-top: 5px;
}

.inventory-slots .slot,
.inventory-slots-max .slot {
    margin-bottom: 5px;
    background: rgba(0, 0, 0, 0.5);
    box-sizing: border-box;
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
}

.item-outline {
    border: 2px solid rgba(255, 255, 255, 0.5) !important;
}

.weight-frame {
    display: flex;
    width: 100%;
    min-height: 20px;
    padding: 10px;
    box-sizing: border-box;
    justify-content: flex-start;
}

.weight-text {
    font-size: 12px;
    font-family: 'Consolas';
    padding-top: 3px;
}

.sub-menu {
    position: relative; /* Ermöglicht die Positionierung der Untermenü-Elemente */
}
.sub-menu-indicator {
    margin-left: 4px; /* Geringer Abstand zwischen Menüpunkt und Pfeil */
    color: #ccc;
    font-size: 12px;
    transform: rotate(90deg);
}
.sub-menu-items {
    position: absolute;
    top: 0;
    left: 100%; /* Positioniert das Untermenü rechts von seinem Elternelement */
    min-width: 200px; /* Breite des Untermenüs */
    background-color: rgba(0, 0, 0, 0.75);
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    padding: 4px; /* Etwas Abstand zwischen Untermenü und Inhalt */
    display: flex;
    flex-direction: column;
    z-index: 1; /* Sorgt dafür, dass das Untermenü über anderen Inhalten liegt */
}
.sub-menu-indicator {
    margin-left: auto; /* Verschiebt das Symbol nach rechts */
    color: #ccc; /* Farbe des Symbols */
    font-size: 12px;
    transform: rotate(90deg); /* Drehung um 90 Grad */
}

/* Stil für Untermenüeinträge in der zweiten Ebene */
.sub-menu-items .sub-menu:hover {
    background: #353535;
    cursor: pointer;
    color: rgba(255, 255, 255, 0.9);
}

.outlined-image-0 {
    border-radius: 50%; /* Runde Ecken */
    padding: 0px; /* Platz um das Bild herum */
    background: radial-gradient(
        ellipse farthest-side at 30% 30%,
        rgba(212, 17, 203, 0.5),
        rgba(0, 0, 255, 0)
    ); /* Glow-Effekt (pink) */
}

.outlined-image-1 {
    border-radius: 50%; /* Runde Ecken */
    padding: 0px; /* Platz um das Bild herum */
    background: radial-gradient(
        ellipse farthest-side at 30% 30%,
        rgba(17, 118, 212, 0.5),
        rgba(0, 0, 255, 0)
    ); /* Glow-Effekt (blue) */
}
.outlined-image-2 {
    border-radius: 50%; /* Runde Ecken */
    padding: 0px; /* Platz um das Bild herum */
    background: radial-gradient(
        ellipse farthest-side at 0% 0%,
        rgba(212, 17, 203, 0.5) 60%,
        /* Pink (oben links) */ rgba(17, 118, 212, 0.5) 100% /* Blau (unten rechts) */
    ); /* Glow-Effekt (Mischung aus pink und blue) */
}

.green-background {
    background-color: green;
}

.inventory-slots .slot:nth-child(-n+5) {
    background: rgba(0, 255, 0, 0.1); /* Leicht transparentes Grün */
    box-sizing: border-box;
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    position: relative; /* Damit wir das Symbol absolut positionieren können */
}

/* Schlosssymbol */
.inventory-slots .slot:nth-child(-n+5)::before {
    content: "🔒"; /* Hier kannst du ein anderes Symbol verwenden, wenn du möchtest */
    position: absolute;
    top: 50%; /* Vertikal zentriert */
    left: 50%; /* Horizontal zentriert */
    transform: translate(-50%, -50%); /* Zentriert das Symbol */
    font-size: 20px; /* Passe die Größe des Symbols nach Bedarf an */
    color: rgba(0, 0, 0, 0.7); /* Farbe des Symbols */
}

/* Die letzten 2 Slots */
.inventory-slots .slot:nth-last-child(-n+5) {
    background: rgba(255, 0, 0, 0.1); /* Leicht transparentes Rot */
    box-sizing: border-box;
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    position: relative; /* Damit wir das Symbol absolut positionieren können */
}

/* Schlosssymbol für die letzten 2 Slots */
.inventory-slots .slot:nth-last-child(-n+5)::before {
    content: "🙈"; /* Hier kannst du ein anderes Symbol verwenden, wenn du möchtest */
    position: absolute;
    top: 50%; /* Vertikal zentriert */
    left: 50%; /* Horizontal zentriert */
    transform: translate(-50%, -50%); /* Zentriert das Symbol */
    font-size: 20px; /* Passe die Größe des Symbols nach Bedarf an */
    color: rgba(0, 0, 0, 0.7); /* Farbe des Symbols */
}

</style>
