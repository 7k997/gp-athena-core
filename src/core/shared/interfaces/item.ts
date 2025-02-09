import de from '@AthenaShared/locale/languages/de.js';
import * as alt from 'alt-shared';
// import { type } from 'os';

/**
 * Default Weapon Data Information
 */
export type WeaponInfo = { hash: number; ammo: number; components?: Array<string | number> };

/**
 * An Item Drop that is represented on server s ide and client side.
 */
export type ItemDrop = {
    _id: unknown;
    pos: alt.IVector3;
    rot?: alt.IVector3;
    expiration: number;
    model?: string;
    pedModel?: string;
    usePedModel?: boolean;
    name: string;
    hash?: number;
    dimension: number;
    collision?: boolean;
    frozen?: boolean;
    maxDistance?: number;
    maxDistancePickup?: number;
    isPeaceful?: boolean;
} & StoredItem;

/**
 * Default Clothing Information
 */
export type ClothingInfo = {
    sex: number;
    components: Array<ClothingComponent>;
    //Corechange: Added componentsAlternatives, TODO: Make it required
    componentsAlternatives?: Array<ClothingComponent>;
    options?: Array<ClothingComponent>;
};

/**
 * dlc information for given clothing data
 *
 *
 * @interface ClothingComponent
 */
export interface ClothingComponent {
    /**
     * The component identifier
     *
     * @type {number}
     *
     */
    id: number;

    /**
     * Corechange:
     * The associated name for a given dlc clothing component.
     * Used in menus to select and for clothing outfit crafting for restoring items.
     *
     * Optional: if not set the component can not be moved out of clothing info
     *
     */
    name?: string;

    /**
     * Corechange:
     * 0 - female component
     * 1 - Male component
     * 2 - bisexual component
     *
     * Optional: if not set the sex is used from clothing info
     */
    sex?: number;

    /**
     * Corechange:
     *
     * Just a remark for the component, not used yet
     */
    type?: string;

    /**
     * The associated relative drawing id for a given dlc clothing component
     *
     * @type {number}
     *
     */
    drawable: number;

    /**
     *
     *
     * @type {number}
     *
     */
    texture: number;

    /**
     *
     *
     * @type {number}
     *
     */
    palette?: number;

    /**
     *
     *
     * @type {number}
     *
     */
    dlc: number;

    /**
     *
     *
     * @type {boolean}
     *
     */
    isProp?: boolean;
}

/**
 * Item behavior associated with an item
 *
 *
 * @interface DefaultItemBehavior
 */
export interface DefaultItemBehavior {
    /**
     * Can this item be dropped.
     *
     * @type {boolean}
     *
     */
    canDrop?: boolean;

    /**
     * Can the item be stacked
     *
     * @type {boolean}
     *
     */
    canStack?: boolean;

    /**
     * Can the item be traded
     *
     * @type {boolean}
     *
     */
    canTrade?: boolean;

    /**
     * Used to state that an item is clothing.
     *
     * DO NOT specify isEquippable with this; leave it as false.
     *
     * @type {boolean}
     *
     */
    isClothing?: boolean;

    /**
     * Can this item be added to the toolbar.
     *
     * @type {boolean}
     *
     */
    isToolbar?: boolean;

    /**
     * Is this item a weapon?
     *
     * DO NOT specify isEquippable with this; leave it as false.
     *
     * @type {boolean}
     *
     */
    isWeapon?: boolean;

    /**
     * Do not specify clothing, and weapon with this.
     *
     * Just only specify this one if doing custom equips.
     *
     * @type {boolean}
     *
     */
    isEquippable?: boolean;

    /**
     * Destroy this item on drop.
     *
     * @type {boolean}
     *
     */
    destroyOnDrop?: boolean;

    /**
     * Override default icon behavior for items such as clothing.
     * Allows for specifying a custom icon instead.
     *
     * @type {boolean}
     *
     */
    isCustomIcon?: boolean;
}

/**
 * Interface for defining further custom context actions for items,
 * to show up when right-clicking on the item in inventory.
 */
export interface CustomContextAction {
    /**
     * The visible name of this action.
     */
    name: string;

    /**
     * The events which should be triggered.
     */
    eventToCall: string | Array<string>;

    /**
    * true if Custom sub menu supports also toolbar
    */
    toolbarSupport?: boolean;

    /**
     * true if Custom action supports also storages
     */
    storageSupport?: boolean;
}

export interface CustomSubMenu {
    /**
     * The visible name of this action.
     */
    name: string;

    isOpen: boolean;

    /**
     * The events which should be triggered.
     */
    contextActions?: Array<CustomContextAction>;

    customSubMenus?: Array<CustomSubMenu>;

    /**
     * true if Custom sub menu supports also toolbar
     */
    toolbarSupport?: boolean;

    /**
     * true if Custom sub menu supports also storages
     */
    storageSupport?: boolean;
}

/**
 * Shared Item Information for Both Interfaces Below
 *
 * @interface SharedItem
 * @template CustomData
 */
export interface SharedItem<CustomData = {}> {
    /**
     * The matching database name for this item.
     *
     * @type {string}
     *
     */
    dbName?: string;

    /**
     * Any custom data assigned to this item.
     *
     * @type {CustomData}
     *
     */
    data: CustomData;

    /**
     * The version of this item it is based upon.
     *
     * @type {number}
     *
     */
    version?: number;

    /**
    * The Price of this item.
    *
    * @type {number}
    */
    price?: number;

    /**
    * The Slot from the source storage/inventory
    * This is normally undefined, if the item is not from a storage/inventory
    * 
    * Needed to get the original source of the ShareItem/BasedItem
    *
    * @type {number}
    */
    slot?: number;

    /**
    * The Quantity from the source storage/inventory
    * This is normally undefined, if the item is not from a storage/inventory
    * 
    * Needed to get the original quantity of the ShareItem/BasedItem
    *
    * @type {number}
    */
    quantity?: number;
}

/**
 * Apply a generic type to a custom item's data set
 */
export type StoredItemEx<T> = StoredItem<T>;

/**
 * The StoredItem is stored in the player in the following locations:
 * equipment, inventory, and toolbar
 *
 *
 * @interface StoredItem
 * @extends {SharedItem<CustomData>}
 * @template CustomData
 */
export interface StoredItem<CustomData = {}> extends SharedItem<CustomData> {
    /**
     * The id of this item.
     *
     * The id of this item is used to identify an item clearly.
     * Example: 5 note items with the same dbName. 4 without ID are new note items, they can be stacked. 1 with ID is a already used note item with modifactions in data.
     * No stackable possible if ID is set!
     * @type {string}
     *
     */
    id?: string;

    /**
     * The amount of this item the player has.
     *
     * @type {number}
     *
     */
    quantity: number;

    /**
     * Where this item should be displayed in a toolbar, equipment bar, or inventory bar.
     *
     * //Corechange, set slot to optional. //TODO: Check dependencies
     * @type {number}
     *
     */
    slot?: number;

    /**
     * A generic way to flag an item to be equipped.
     * Equipped can mean anything in the code base; it's up to the user to define its equip usage.
     *
     * @type {boolean}
     *
     */
    isEquipped?: boolean;

    /**
     * The weight calculated for this item.
     *
     * @type {number}
     *
     */
    totalWeight?: number;

    /**
     * Specify an icon to override the default base item icon with.
     *
     * @type {string}
     *
     */
    icon?: string;

    /**
     * Flag this item as uncraftable. Just in case it has a shared base.
     *
     * @type {boolean}
     *
     */
    disableCrafting?: boolean;

    /**
     * A new name to associate with this item.
     *
     * This is completely optional, and uses the base item name by default
     *
     * @type {string}
     * @memberof StoredItem
     */
    name?: string;

    /**
     * A new description to associate with this item.
     *
     * This is completely optional, and uses the base item description by default
     *
     * @type {string}
     * @memberof StoredItem
     */
    description?: string;
}

/**
 * Apply a generic type to a base item's data set.
 */
export type BaseItemEx<T> = BaseItem<DefaultItemBehavior, T>;

/**
 * The BaseItem is used as a way for the main items to point towards item information.
 * This item stored in the database is used to construct front facing item information.
 *
 *
 * @interface BaseItem
 * @extends {SharedItem<CustomData>}
 * @template Behavior
 * @template CustomData
 */
export interface BaseItem<Behavior = DefaultItemBehavior, CustomData = {}> extends SharedItem<CustomData> {
    /**
     * Database entry for item. Do not add / append.
     *
     * @type {unknown}
     *
     */
    _id?: unknown;

    /**
     * The name of this item.
     *
     * @type {string}
     *
     */
    name: string;

    /**
     * Corechange: Added description
     * The name of this item.
     *
     * @type {string}
     *
     */
    description?: string;

    /**
     * A client-side icon name.
     * They are specified and created by you.
     *
     * @type {string}
     *
     */
    icon: string;

    /**
     * If this value is defined it will be used as the maximum stack size for the item.
     *
     * @type {number}
     *
     */
    maxStack?: number;

    /**
     * The weight of this item.
     *
     * @type {number}
     *
     */
    weight?: number;

    /**
     * Behavior associated with this item.
     *
     * @type {Behavior}
     *
     */
    behavior?: Behavior;

    /**
     * The event to call when this item is consumed.
     *
     * @type {string}
     *
     */
    consumableEventToCall?: string | Array<string>;

    /**
     * Custom context actions in addition to the standard consumable event.
     *
     * @type {string}
     *
     */
    customEventsToCall?: Array<CustomContextAction>;

    customSubMenus?: Array<CustomSubMenu>;

    /**
     * The drop model of this item when it is on the ground.
     * If not defined it will default to a box of some sort.
     *
     * @type {string}
     *
     */
    model?: string;

    /**
     * The drop ped model of this item when it will be placed as Ped.
     * If not defined it will placed as object, see model.
     *
     * @type {string}
     *
     */
    pedModel?: string;

     /**
     * Place the item always as ped, if pedModel is defined.
     * Normally undefined or false.
     * @type {string}
     *
     */
    usePedModel?: boolean;

    /**
     * An expiration time in milliseconds before the item drop is cleared.
     * Stored items come with an expiration date.
     *
     * @type {number}
     *
     */
    msTimeout?: number;

    noCollision?: boolean; //If true, the item will not collide with other items
    noFreeze?: boolean; //If true, the item will not be freezed on drop/place (normally noCollision must be false)
    maxDistance?: number; //TODO: Test and explain - used in item place preview
    maxDistancePickup?: number; //TODO: Test and explain - used in item place preview
    zaxisadjustment?: number; //TODO: Test and explain
    rotation?: alt.IVector3; //TODO: Test and explain

    dynamic?: boolean; //If true, the item was created in gameplay and is not in any item file hardcoded
}

/**
 * A combination of the stored, and base item.
 *
 * A stored item is merged into the base item to create this
 */
export type Item<Behavior = DefaultItemBehavior, CustomData = {}> = BaseItem<Behavior, CustomData> &
    StoredItem<CustomData>;

/**
 * A combination of the stored, and base item.
 *
 * A stored item is merged into the base item to create this
 *
 * This one allows for custom data.
 */
export type ItemEx<T> = BaseItem<DefaultItemBehavior, T> & StoredItem<T>;
