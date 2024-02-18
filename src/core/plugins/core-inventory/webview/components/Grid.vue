<template>
    <div class="inventory-split">
        <div class="inventory-frame" v-if="machine && Array.isArray(machine)">
               
           
            <div class="machine-slots">       
                            
                <div class="machine-options">   
                    <div class="machine-header">{{recipe.recipeMachine}}
                </div>         
                    <Dropdown :options="recipe.options.recipeTypes"
                        v-on:selected="onSelectRecipeType"
                        placeholder="Type"
                        :maxItem="10"
                        v-if="recipe.recipeMode === 'Recipe'"/>
                    <Dropdown :options="recipe.options.effects"
                        v-on:selected="onSelectRecipeEffect"
                        placeholder="Effect"
                        :maxItem="10"
                        v-if="recipe.recipeMode === 'Recipe' && recipe.recipeConsumable"/>
                    <Dropdown :options="recipe.options.ammounts"
                        v-on:selected="onSelectRecipeAmount"
                        placeholder="Amount"
                        :maxItem="10"
                        v-if="recipe.recipeMode === 'Recipe'"/>              
                    <Dropdown :options="recipe.options.ammountsPerCount"
                        v-on:selected="onSelectRecipeAmountPerCount"
                        placeholder="Amount per Use"
                        :maxItem="10"
                        v-if="recipe.recipeMode === 'Recipe' && recipe.recipeConsumable"
                        :disabled="recipe.recipeMode != 'Recipe'"/>
                    <Dropdown :options="recipe.options.productionTimes"
                        v-on:selected="onSelectRecipeProductionTime"
                        placeholder="Productiontime"
                        :maxItem="10"
                        v-if="recipe.recipeMode && recipe.recipeConsumable"
                        :disabled="recipe.recipeMode != 'Recipe'"/>
                    <Dropdown :options="recipe.options.status"
                        v-on:selected="onSelectRecipeStatus"
                        placeholder="Status"
                        :maxItem="10"
                        v-if="recipe.recipeMode && recipe.recipeConsumable"
                        :disabled="recipe.recipeMode != 'Recipe'"/>
                    <Dropdown :options="recipe.options.expirationTimes"
                        v-on:selected="onSelectRecipeExpirationTime"
                        placeholder="Expiration Time"
                        :maxItem="10"
                        v-if="recipe.recipeMode && recipe.recipeConsumable"
                        :disabled="recipe.recipeMode != 'Recipe'"/>
                    <Dropdown :options="recipe.options.tearandwears"
                        v-on:selected="onSelectRecipeTearAndWear"
                        placeholder="Tear & Wear"
                        :maxItem="10"
                        v-if="recipe.recipeMode && recipe.recipeConsumable"
                        :disabled="recipe.recipeMode != 'Recipe'"/>                   
                    <Dropdown :options="recipe.options.qualities"
                        v-on:selected="onSelectRecipeQuality"
                        placeholder="Quality"
                        :maxItem="10"
                        :disabled="recipe.recipeMode != 'Recipe'"/>
                    <Dropdown :options="recipe.options.vehicles"
                        v-on:selected="onSelectRecipeVehicle"
                        placeholder="Vehicle"
                        :maxItem="10"
                        v-if="recipe.recipeMode && recipe.recipeConsumable"
                        />
                </div>
              
                <div class="machine-slots-max">
                    
                    <MachineSlot
                        v-for="(slot, index) in slotLimits.machine"
                        class="slot"
                        :class="getSelectedItemClass('machine', index)"
                        :key="index"
                        :id="getID('machine', index)"
                        :info="getSlotInfo('machine', index)"
                        @mouseenter="updateDescriptor('machine', index)"
                        @mouseleave="updateDescriptor(undefined, undefined)"
                        @mousedown="
                            (e) => onMouseDownMachine(e, index, { endDrag, canBeDragged: hasItem('machine', index), singleClick, startDrag })
                        "
                        @contextmenu="(e) => contextMenuMachine(e, index)"
                    >
                        <template v-slot:image v-if="hasItem('machine', index)">
                            <img
                                :src="getImagePath(getItem('machine', index))"
                                :class="`outlined-image-${getItemSex('machine',index)}`"
                            />
                        </template>
                        <template v-slot:index v-else>
                            <template v-if="config.showGridNumbers">
                                {{ slot }}
                            </template>
                        </template>
                    </MachineSlot>
                    <div class="machine-actions">
                        <Button class="" :disable="recipe.recipeMode === 'Produce'" >
                            Create recipe
                        </Button>  
                        <Button class="" :disable="recipe.recipeMode != 'Produce'">
                            Produce
                        </Button> 
                    </div>
                </div>   
                        
            </div>

            <div class="production">
                <p v-for="log in recipe.recipeLog">{{log.name}}</p>
            </div>
            
            <div class="weight-frame" v-if="config.isWeightEnabled">
                <div class="split">
                    <div class="icon pr-2">
                        <Icon class="grey--text text--lighten-1" :noSelect="true" :size="18" icon="icon-anvil"></Icon>
                    </div>
                    <span class="weight-text">
                        {{ machineTotalWeight.toFixed(2) }} / {{ weightLimits.machine }} {{ config.units }}
                    </span>
                    <span class="storage-name-text">
                        {{ machineName }}
                    </span>
                </div>
            </div>
        </div>
        <div class="spacer">&nbsp;</div>
        <div class="inventory-frame inventory-frame-small" v-if="second && Array.isArray(second)">
            <div class="inventory-slots-max">
                <Slot
                    v-for="(slot, index) in slotLimits.second"
                    class="slot"
                    :class="getSelectedItemClass('second', index)"
                    :key="index"
                    :id="getID('second', index)"
                    :info="getSlotInfo('second', index)"
                    :showPrice="showSecondPrices"
                    @mouseenter="updateDescriptor('second', index)"
                    @mouseleave="updateDescriptor(undefined, undefined)"
                    @mousedown="
                        (e) => onMouseDownSecond(e, index,  { endDrag, canBeDragged: hasItem('second', index), singleClick, startDrag })
                    "
                    @contextmenu="(e) => contextMenuSecond(e, index)"
                >
                    <template v-slot:image v-if="hasItem('second', index)">
                        <img
                            :src="getImagePath(getItem('second', index))"
                            :class="`outlined-image-${getItemSex('second',index)}`"
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
                        {{ secondTotalWeight.toFixed(2) }} / {{ weightLimits.second }} {{ config.units }}
                    </span>
                    <span class="storage-name-text">
                        {{ secondName }}
                    </span>
                </div>
            </div>
        </div>
        <div class="spacer">&nbsp;</div>
        <div class="inventory-frame inventory-frame-small" v-if="custom && Array.isArray(custom)">
            <div class="inventory-slots-max">
                <Slot
                    v-for="(slot, index) in slotLimits.custom"
                    class="slot"
                    :class="getSelectedItemClass('custom', index)"
                    :key="index"
                    :id="getID('custom', index)"
                    :info="getSlotInfo('custom', index)"
                    :showPrice="showCustomPrices"
                    @mouseenter="updateDescriptor('custom', index)"
                    @mouseleave="updateDescriptor(undefined, undefined)"
                    @mousedown="
                        (e) => onMouseDownCustom(e, index, { endDrag, canBeDragged: hasItem('custom', index), singleClick, startDrag })
                    "
                    @contextmenu="(e) => contextMenuCustom(e, index)"
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
            <div class="weight-frame" v-if="config.isWeightEnabled">
                <div class="split">
                    <div class="icon pr-2">
                        <Icon class="grey--text text--lighten-1" :noSelect="true" :size="18" icon="icon-anvil"></Icon>
                    </div>
                    <span class="weight-text">
                        {{ customTotalWeight.toFixed(2) }} / {{ weightLimits.custom }} {{ config.units }}
                    </span>
                    <span class="storage-name-text">
                        {{ customName }}
                    </span>
                </div>
            </div>
        </div>
        <div class="spacer">&nbsp;</div>
        <div class="inventory-frame">
            <Split
                :name="splitData.name"
                :slot="splitData.slot"
                :inventoryType="splitData.inventoryType"
                :quantity="splitData.quantity"
                @cancel-split="cancelSplit"
                v-if="splitData"
            >
            </Split>
            <Give
                :name="giveData.name"
                :slot="giveData.slot"
                :inventoryType="giveData.inventoryType"
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
                    @mousedown="(e) => onMouseDownToolbar(e, index, { endDrag, canBeDragged: hasItem('toolbar', index), startDrag })"
                    @contextmenu="(e) => contextMenuToolbar(e, index)"
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
                    @contextmenu="(e) => contextMenuInventory(e, index)"
                    @mousedown="
                        (e) => onMouseDownInventory(e, index, { endDrag, canBeDragged: hasItem('inventory', index), singleClick, startDrag })
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
            <div class="item-descriptor">
                    <div class="item-descriptor-title" color="red">{{ itemName }}</div>
                    <div class="item-descriptor-description">{{ itemDescription }}</div>    
            </div>
            <div class="weight-frame" v-if="config.isWeightEnabled">
                
               
                <div class="split">
                    <div class="icon pr-2">
                        <Icon class="grey--text text--lighten-1" :noSelect="true" :size="18" icon="icon-anvil"></Icon>
                    </div>
                    <span class="weight-text">
                        {{ totalWeight.toFixed(2) }} / {{ weightLimits.inventory }} {{ config.units }}
                    </span>
                    <span class="storage-name-text">
                        Inventory
                    </span>
                </div>
            </div>
            <Context :contextTitle="context.title" :x="context.x" :y="context.y" v-if="context && contextShow">
                <div v-if="context.hasUseEffect && (context.inventoryType === 'toolbar' || context.inventoryType === 'inventory')" @click="contextAction('use')" >Use</div>
                <template v-for="customAction in context.customEvents">
                    <div 
                        v-if="context.inventoryType === 'inventory' || (context.inventoryType === 'toolbar' && customAction.toolbarSupport) || (context.inventoryType !== 'toolbar' && customAction.storageSupport)"
                        @click="contextAction('custom', customAction.eventToCall)">{{ customAction.name }}</div>
                </template>
          
                <!-- Hier beginnt die Hinzufügung der rekursiven Untermenüs -->
                <template v-for="customSub in context.customSubMenus">
                    <ContextSub
                    v-if="context.inventoryType === 'inventory' || (context.inventoryType === 'toolbar' && customSub.toolbarSupport) || (context.inventoryType !== 'toolbar' && customSub.storageSupport)"
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

                <div @click="contextAction('split')" v-if="context.inventoryType !== 'toolbar' && context.quantity > 1">Split</div>
                <div @click="contextAction('drop')" v-if="context.inventoryType === 'toolbar' || context.inventoryType === 'inventory'">Drop</div>
                <div @click="contextAction('give')" v-if="context.inventoryType === 'toolbar' || context.inventoryType === 'inventory'">Give</div>
                <!-- <div @click="contextAction('cancel')">Cancel</div> -->
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
import { DualSlotInfo, InventoryType, SlotInfo } from '@AthenaPlugins/core-inventory/shared/interfaces.js';
import { Draggable } from '@ViewUtility/drag.js';

export default defineComponent({
    name: 'Inventory',
    components: {
        Slot: defineAsyncComponent(() => import('./Slot.vue')),
        MachineSlot: defineAsyncComponent(() => import('./MachineSlot.vue')),
        Split: defineAsyncComponent(() => import('./Split.vue')),
        Give: defineAsyncComponent(() => import('./Give.vue')),
        Context: defineAsyncComponent(() => import('./ContextCustom.vue')),
        ContextSub: defineAsyncComponent(() => import('./ContextCustomSub.vue')),
        Icon: defineAsyncComponent(() => import('@ViewComponents/Icon.vue')),
        Button: defineAsyncComponent(() => import('@components/Button.vue')),
        Dropdown: defineAsyncComponent(() => import('@components/DropDown.vue')),
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
            second: [] as Array<Item>,
            machine: [] as Array<Item>,
            slotLimits: {
                inventory: 30,
                toolbar: 5,
                custom: 35,
                second: 35,
                machine: 12,
            },
            weightLimits: {
                inventory: 64,
                toolbar: 64,
                custom: 64,
                second: 64,
                machine: 5,
            },
            showCustomPrices: false,
            showSecondPrices: false,
            recipe: {
                recipeMode: "Produce",
                recipeMachine: "BBQ Grill",
                recipeType: "consumable", // consumable, weapon, clothing, vehicle
                recipeConsumable: true,
                options: {                    
                    recipeTypes: [
                        { id: "consumable", name: "Consumable" },
                        { id: "weapon", name: "Weapon" },
                        { id: "clothing", name: "Clothing" },
                        { id: "vehicle", name: "Vehicle" },
                    ],
                    effects: [
                        { id: "effect1", name: "effect1" },
                    ],
                    ammounts: [
                        { id: "1", name: "10" },
                        { id: "2", name: "20" },
                        { id: "4", name: "40" },
                        { id: "6", name: "60" },
                        { id: "8", name: "80" },
                        { id: "8", name: "100" },
                    ],
                    ammountsPerCount: [
                        { id: "1", name: "10" },
                        { id: "2", name: "20" },
                        { id: "4", name: "40" },
                        { id: "6", name: "60" },
                        { id: "8", name: "80" },
                        { id: "8", name: "100" },
                    ],
                    productionTimes: [
                        { id: "1", name: "10" },
                        { id: "2", name: "20" },
                        { id: "4", name: "40" },
                        { id: "6", name: "60" },
                        { id: "8", name: "80" },
                        { id: "8", name: "100" },
                    ],
                    status: [
                        { id: "1", name: "Hot" },
                        { id: "2", name: "Cold" },
                        { id: "4", name: "Frozen" },
                        { id: "6", name: "Packed" },
                    ],
                    expirationTimes: [
                        { id: "1", name: "7 days" },
                        { id: "2", name: "14 days" },
                        { id: "4", name: "28 days" },
                        { id: "6", name: "56 days" },
                        { id: "8", name: "112 days" },
                        { id: "8", name: "224 days" },
                        { id: "8", name: "unlimited" },
                    ],
                    tearandwears: [
                        { id: "1", name: "10" },
                        { id: "2", name: "20" },
                        { id: "4", name: "40" },
                        { id: "6", name: "60" },
                        { id: "8", name: "80" },
                        { id: "8", name: "100" },
                    ],
                    vehicles: [
                        { id: "0", name: "None" },
                        { id: "1", name: "Car" },
                        { id: "2", name: "Bike" },
                        { id: "4", name: "Truck" },
                        { id: "6", name: "Helicopter" },
                        { id: "8", name: "Plane" },
                        { id: "8", name: "Boat" },
                    ],
                    qualities: [
                        { id: "1", name: "10" },
                        { id: "2", name: "20" },
                        { id: "3", name: "30" },
                        { id: "4", name: "40" },
                        { id: "5", name: "50" },
                        { id: "6", name: "60" },
                        { id: "7", name: "70" },
                        { id: "8", name: "80" },
                        { id: "9", name: "90" },
                        { id: "10", name: "100" },
                    ],

                },
                recipeLog: [
                    { id: "inreview", name: "In Review ..." },
                    { id: "inproduction", name: "In Production ..." },
                ],        
            },           
            contextShow: false,
            context: undefined as
                | {
                      quantity: number;
                      x: number;
                      y: number;
                      title: string;
                      slot: number;
                      inventoryType: InventoryType;
                      hasUseEffect: boolean;
                      customEvents: Array<CustomContextAction>;
                      customSubMenus: Array<CustomSubMenu>;
                  }
                | undefined,
            itemSingleClick: undefined as { type: InventoryType; index: number },
            itemName: '',
            itemDescription: '',
            totalWeight: 0,
            customTotalWeight: 0,
            secondTotalWeight: 0,
            machineTotalWeight: 0,
            customName: '',
            secondName: '',
            machineName: '',
            splitData: undefined as { name: string; slot: number; quantity: number, inventoryType: InventoryType},
            giveData: undefined as { name: string; slot: number; quantity: number, inventoryType: InventoryType },
            config: {
                units: INVENTORY_CONFIG.WEBVIEW.WEIGHT.UNITS,
                showGridNumbers: INVENTORY_CONFIG.WEBVIEW.GRID.SHOW_NUMBERS,
                showToolbarNumbers: INVENTORY_CONFIG.WEBVIEW.TOOLBAR.SHOW_NUMBERS,
                isWeightEnabled: true,
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
                    startMaxWeight: this.weightLimits[this.itemSingleClick.type],
                    startMaxSlots: this.weightLimits[this.itemSingleClick.type],
                    endMaxWeight: this.weightLimits[type],
                    endMaxSlots: this.weightLimits[type],
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
                startMaxWeight: this.weightLimits[startType],
                startMaxSlots: this.weightLimits[startType],
                endMaxWeight: this.weightLimits[endType],
                endMaxSlots: this.weightLimits[endType],
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
                price: 0,
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
            defaultTemplate.price = typeof item.price === 'number' ? item.price : 0;
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
        setItems(inventory: Array<Item>, toolbar: Array<Item>, totalWeight: number, maxWeight: number) {
            this.inventory = inventory;
            this.toolbar = toolbar;
            this.totalWeight = totalWeight;

            if (typeof maxWeight !== 'undefined') {
                const newWeightLimits = { ...this.slotLimits };
                newWeightLimits.inventory = maxWeight;
                this.weightLimits = newWeightLimits;
            }
        },
        setCustomItems(customItems: Array<Item>, customName: string, maximumSize: number, totalWeight: number, maxWeight: number, showPrices: boolean = false) {
            if (typeof customItems === 'undefined') {
                customItems = [];
            }

            this.custom = customItems;
            this.showCustomPrices = showPrices;

            if(typeof customName !== 'undefined') {
                this.secondName = customName;
            }

            if (typeof maximumSize !== 'undefined') {
                const newSlotLimits = { ...this.slotLimits };
                newSlotLimits.custom = maximumSize;
                this.slotLimits = newSlotLimits;
            }
            
            if (typeof totalWeight !== 'undefined') {
                this.customTotalWeight = totalWeight;
            }            

            if (typeof maxWeight !== 'undefined') {
                const newWeightLimits = { ...this.slotLimits };
                newWeightLimits.custom = maxWeight;
                this.weightLimits = newWeightLimits;
            }
        },
        setSecondItems(secondItems: Array<Item>, secondName: string, maximumSize: number, totalWeight: number, maxWeight: number, showPrices: boolean = false) {
            if (typeof secondItems === 'undefined') {
                secondItems = [];
            }

            this.second = secondItems;
            this.showSecondPrices = showPrices;

            if(typeof secondName !== 'undefined') {
                this.secondName = secondName;
            }

            if (typeof maximumSize !== 'undefined') {
                const newSlotLimits = { ...this.slotLimits };
                newSlotLimits.second = maximumSize;
                this.slotLimits = newSlotLimits;
            }
            
            if (typeof totalWeight !== 'undefined') {
                this.secondTotalWeight = totalWeight;
            }            

            if (typeof maxWeight !== 'undefined') {
                const newWeightLimits = { ...this.slotLimits };
                newWeightLimits.second = maxWeight;
                this.weightLimits = newWeightLimits;
            }
        },
        setMachineItems(machineItems: Array<Item>, machineName: string, maximumSize: number, totalWeight: number, maxWeight: number) {
            if (typeof machineItems === 'undefined') {
                machineItems = [];
            }

            this.machine = machineItems;

            if(typeof machineName !== 'undefined') {
                this.machineName = machineName;
            }

            if (typeof maximumSize !== 'undefined') {
                const newSlotLimits = { ...this.slotLimits };
                newSlotLimits.machine = maximumSize;
                this.slotLimits = newSlotLimits;
            }

            if (typeof totalWeight !== 'undefined') {
                this.machineTotalWeight = totalWeight;
            }
            
            if (typeof maxWeight !== 'undefined') {
                const newWeightLimits = { ...this.slotLimits };
                newWeightLimits.machine = maxWeight;
                this.weightLimits = newWeightLimits;
            }
        },
        contextMenuToolbar(e: MouseEvent, slot: number) {
            if (e.altKey) {
                // Unequip item if alt key is pressed
                this.unequip(e, slot);
                return;
            }

            e.preventDefault();
            if (!this.hasItem('toolbar', slot)) {
                return;
            }            

            const item = this.getItem('toolbar', slot);

            // Let's check, if this item can be used. This information is used to show/hide the "Use" context menu action.
            const hasUseEffect: boolean =
                typeof item.consumableEventToCall !== 'undefined' ||
                (item.behavior && (item.behavior.isEquippable || item.behavior.isWeapon || item.behavior.isClothing));

            this.contextShow = false;
            this.context = {
                title: item.name,
                quantity: item.quantity,
                slot: item.slot,
                inventoryType: "toolbar",
                x: e.clientX,
                y: e.clientY,
                hasUseEffect: hasUseEffect,
                customEvents: item.customEventsToCall,
                customSubMenus: item.customSubMenus,
            };

            if (e.altKey) {
                // Unequip item if alt key is pressed
                this.unequip(e, slot);
                return;
            } else {
                this.contextShow = true;
            }
        },
        onMouseDownInventory(e: MouseEvent, startIndex: number, draggable: Draggable) {
            if (e.altKey && e.button === 0 && draggable.canBeDragged) {
                // Move item to custom or second storage
                console.log('alt key pressed, startIndex: ' + startIndex + ' draggable: ' + JSON.stringify(draggable));
                this.endDrag('inventory', startIndex, 'custom', -1);
            } else {
                this.drag(e, draggable);
            }           
        },
        onMouseDownToolbar(e: MouseEvent, startIndex: number, draggable: Draggable) {
            this.drag(e, draggable);
        },
        onMouseDownCustom(e: MouseEvent, startIndex: number, draggable: Draggable) {
            if (e.altKey && e.button === 0 && draggable.canBeDragged) {
                // Move item to inventory
                this.endDrag('custom', startIndex, 'inventory', -1);
            } else {
                this.drag(e, draggable);
            }           
        },
        onMouseDownSecond(e: MouseEvent, startIndex: number, draggable: Draggable) {
            if (e.altKey && e.button === 0 && draggable.canBeDragged) {
                // Move item to inventory
                this.endDrag('second', startIndex, 'inventory', -1);
            } else {
                this.drag(e, draggable);
            }           
        },
        onMouseDownMachine(e: MouseEvent, startIndex: number, draggable: Draggable) {
            if (e.altKey && e.button === 0 && draggable.canBeDragged) {
                // Move item to custom storage
                this.endDrag('machine', startIndex, 'custom', -1);
            } else {
                this.drag(e, draggable);
            }           
        },
        contextMenuInventory(e: MouseEvent, slot: number) {
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
                quantity: item.quantity,
                slot: item.slot,
                inventoryType: "inventory",
                x: e.clientX,
                y: e.clientY,
                hasUseEffect: hasUseEffect,
                customEvents: item.customEventsToCall,
                customSubMenus: item.customSubMenus,
            };

            if (e.altKey) {
                // Use item direct if alt is pressed
                this.contextAction('use');
                return;
            } else {
                this.contextShow = true;
            }
        },
        contextMenuCustom(e: MouseEvent, slot: number) {
            e.preventDefault();
            if (!this.hasItem('custom', slot)) {
                return;
            }

            const item = this.getItem('custom', slot);

            // Let's check, if this item can be used. This information is used to show/hide the "Use" context menu action.
            const hasUseEffect: boolean =
                typeof item.consumableEventToCall !== 'undefined' ||
                (item.behavior && (item.behavior.isEquippable || item.behavior.isWeapon || item.behavior.isClothing));

            this.contextShow = false;
            this.context = {
                title: item.name,
                quantity: item.quantity,
                slot: item.slot,
                inventoryType: "custom",
                x: e.clientX,
                y: e.clientY,
                hasUseEffect: hasUseEffect,
                customEvents: item.customEventsToCall,
                customSubMenus: item.customSubMenus,
            };

            if (e.altKey) {
                // Use item direct if alt is pressed
                this.contextAction('use');
                return;
            } else {
                this.contextShow = true;
            }
        },
        contextMenuSecond(e: MouseEvent, slot: number) {
            e.preventDefault();
            if (!this.hasItem('second', slot)) {
                return;
            }

            const item = this.getItem('second', slot);

            // Let's check, if this item can be used. This information is used to show/hide the "Use" context menu action.
            const hasUseEffect: boolean =
                typeof item.consumableEventToCall !== 'undefined' ||
                (item.behavior && (item.behavior.isEquippable || item.behavior.isWeapon || item.behavior.isClothing));

            this.contextShow = false;
            this.context = {
                title: item.name,
                quantity: item.quantity,
                slot: item.slot,
                inventoryType: "second",
                x: e.clientX,
                y: e.clientY,
                hasUseEffect: hasUseEffect,
                customEvents: item.customEventsToCall,
                customSubMenus: item.customSubMenus,
            };

            if (e.altKey) {
                // Use item direct if alt is pressed
                this.contextAction('use');
                return;
            } else {
                this.contextShow = true;
            }
        },
        contextMenuMachine(e: MouseEvent, slot: number) {
            e.preventDefault();
            if (!this.hasItem('machine', slot)) {
                return;
            }

            const item = this.getItem('machine', slot);

            // Let's check, if this item can be used. This information is used to show/hide the "Use" context menu action.
            const hasUseEffect: boolean =
                typeof item.consumableEventToCall !== 'undefined' ||
                (item.behavior && (item.behavior.isEquippable || item.behavior.isWeapon || item.behavior.isClothing));

            this.contextShow = false;
            this.context = {
                title: item.name,
                quantity: item.quantity,
                slot: item.slot,
                inventoryType: "machine",
                x: e.clientX,
                y: e.clientY,
                hasUseEffect: hasUseEffect,
                customEvents: item.customEventsToCall,
                customSubMenus: item.customSubMenus,
            };

            if (e.altKey) {
                // Use item direct if alt is pressed
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
            console.log('eventToCall: ' + eventToCall + ' type: ' + type);
            console.log('this.context JSON: ' + JSON.stringify(this.context));

            const slot = this.context.slot;
            const inventoryType = this.context.inventoryType;
            console.log('slot: ' + slot + ' inventoryType: ' + inventoryType);
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
                console.log('eventToCall 2: ' + eventToCall + ' type: ' + type);
                WebViewEvents.emitServer(eventToCall, inventoryType, slot);
                return;
            }

            // Send Event to do the thing it describes
            if (type === 'use') {
                console.log('eventToCall 3: ' + eventToCall + ' type: ' + type);
                WebViewEvents.emitServer(INVENTORY_EVENTS.TO_SERVER.USE, inventoryType, slot, eventToCall);
                return;
            }

            if (type === 'split' || type === 'give') {
                const item = this.getItem(inventoryType, slot);
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
                    inventoryType: inventoryType,
                    slot: slot,
                };

                console.log('XXXXX eventToCall 4: ' + eventToCall + ' type: ' + type);

                return;
            }

            if (type === 'drop') {
                const item = this.getItem(inventoryType, slot);
                WebViewEvents.emitClient(INVENTORY_EVENTS.FROM_WEBVIEW.DROP_ONGROUND_PROPERLY, inventoryType, slot, item.model);
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
            const newWeightLimits = { ...this.weightLimits };
            newWeightLimits.inventory = value;
            this.weightLimits = newWeightLimits;           
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
        onSelectRecipeType(selected) {
            this.recipe.recipeType = selected;
            this.recipe.recipeConsumable = selected === 'consumable';
        },
        onSelectRecipeEffect(selected) {
            this.recipe.recipeEffect = selected;
        },
        onSelectRecipeAmount(selected) {
            this.recipe.recipeAmount = selected;
        },
        onSelectRecipeAmountPerCount(selected) {
            this.recipe.recipeAmountPerCount = selected;
        },
        onSelectRecipeProductionTime(selected) {
            this.recipe.recipeProductionTime = selected;
        },
        onSelectRecipeStatus(selected) {
            this.recipe.recipeStatus = selected;
        },
        onSelectRecipeExpirationTime(selected) {
            this.recipe.recipeExpirationTime = selected;
        },
        onSelectRecipeTearAndWear(selected) {
            this.recipe.recipeTearAndWear = selected;
        },
        onSelectRecipeVehicle(selected) {
            this.recipe.recipeVehicle = selected;
        },
        onSelectRecipeQuality(selected) {
            this.recipe.recipeQuality = selected;
        },
        onSelectRecipeMode(selected) {
            this.recipe.recipeMode = selected;
        },
    },
    mounted() {
        this.custom = undefined;
        this.second = undefined;
        this.machine = undefined;
        this.customName = '';
        this.secondName = '';
        this.machineName = '';   

        if ('alt' in window) {
            WebViewEvents.on(INVENTORY_EVENTS.TO_WEBVIEW.SET_CUSTOM, this.setCustomItems);
            WebViewEvents.on(INVENTORY_EVENTS.TO_WEBVIEW.SET_SECOND, this.setSecondItems)
            WebViewEvents.on(INVENTORY_EVENTS.TO_WEBVIEW.SET_MACHINE, this.setMachineItems)
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

        const exampleItem2: Item = {
            name: 'Big Box',
            dbName: 'box',
            quantity: 1,
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

        const recipeItems: Array<Item> = [           
            { ...exampleItem, slot: 4, icon: 'burger', quantity: 1, name: 'Burger', description:'Recipe for a realy good burger', totalWeight: 5 },
            { ...exampleItem, slot: 0, icon: 'crate', quantity: 1, name: 'Bread', totalWeight: 1 },
            { ...exampleItem, slot: 1, icon: 'crate', quantity: 1, name: 'Ketchup', totalWeight: 1 },
            { ...exampleItem, slot: 3, icon: 'crate', quantity: 1, name: 'Meat', totalWeight: 1 },
            { ...exampleItem, slot: 6, icon: 'crate', quantity: 1, name: 'Bread', totalWeight: 1 },
            { ...exampleItem, slot: 5, icon: 'crate', quantity: 1, name: 'Salat', totalWeight: 1 },
        ];

        this.setItems(
            exampleItems,
            [{ ...exampleItem, icon: 'assaultrifle', name: 'Assault Rifle', totalWeight: 10 }],
            8,
            25,
        );

        this.setCustomItems([exampleItem]);
        this.setSecondItems([exampleItem2]);
        this.setMachineItems(recipeItems);
        this.customName = 'Custom';
        this.secondName = 'Second';
        this.machineName = 'Machine';

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
    justify-content: center;
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
    height: 110%;
    align-self: flex-end;
    position: relative;
}

.inventory-frame-small {
    min-width: 400px;
    max-width: 400px;
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
    max-height: 660px;
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

.machine-header {
    margin: 10px;
}

.machine-slots {
    /* display: flex;
    justify-content: flex-end;
    width: 60%;
    margin-left: 10vw; */

    display: flex;
    flex-direction: row; /* Standard ist bereits "row", kann weggelassen werden */
    justify-content: flex-end;
    width: 100%;
    /* height: 88%; */
    /* margin-left: 10vw; */
}

.production {
    overflow-y: auto;
    height: 21vh;
    padding-left: 10px;

    min-height: 5.5vh;
    margin-left: 10px;
    margin-top: 10px;
    border: 2px solid rgba(255, 255, 255, 0.1);
    /* padding: 15px; */
    margin-right: 10px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.machine-options {
    /* display: flex; */
    flex-direction: column; /* Elemente untereinander anordnen */
    overflow-y: hidden;
    width: 50%;
    /* padding-top: 60px; */
    padding-left: 10px;
}

.machine-options div {
    margin-bottom: 10px;
}

.machine-slots-max {
    display: flex;
    flex-flow: row wrap;
    box-sizing: border-box;
    overflow-y: hidden;
    justify-content: space-evenly;
    align-content: flex-start;
    height: 100%;  
    width: 70%;
    padding-top: 5px;   
    padding-right: 5px;
}

.machine-slots-max .slot {
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
    /* display: flex; */
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

.storage-name-text {
    font-size: 12px;
    font-family: 'Consolas';
    padding-top: 3px;
    margin-left: auto;
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

.machine-slots .slot:nth-last-child(-n+4)::before {
    content: "♻️"; /* Hier kannst du ein anderes Symbol verwenden, wenn du möchtest */
    position: absolute;
    top: 50%; /* Vertikal zentriert */
    left: 50%; /* Horizontal zentriert */
    transform: translate(-50%, -50%); /* Zentriert das Symbol */
    font-size: 20px; /* Passe die Größe des Symbols nach Bedarf an */
    color: rgba(0, 0, 0, 0.7); /* Farbe des Symbols */
}

.machine-actions {
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    align-items: flex-end;
    min-height: 60px;
    max-height: 60px;

}

.item-descriptor {
    min-height: 5.5vh;
    margin-left: 10px;
    margin-top: 10px;
    border: 2px solid rgba(255, 255, 255, 0.1);
    /* padding: 15px; */
    margin-right: 10px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.item-descriptor-title {
    font-size: 0.9em;
    font-weight: bold;
    margin: 5px;
    margin-left: 8px;
}

.item-descriptor-description {
    font-size: 0.8em;
    line-height: 1.4;
    
    margin: 5px;
    margin-left: 8px;
}

</style>