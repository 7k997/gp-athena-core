export const Config = {
    //DEBUG SETTINGS
    DEBUG: false,
    DEBUG_INFO: false,
    DEBUG_WARNING: true,
    DEVTOOLS: true, //Enable dev tools, in test set to false for test and production!
    ALT_DEBUG_OVERRIDE: true, //Override some places where alt.debug is used, just to remove somethings in Debug mode. (Default is false)

    //Notification Settings
    ACTIVATE_NOTIFICATION_REPLACEMENT: true, //Activate the notification replacement from Lord, see plugin-notifications.
    DEFAULT_NOTIFICATION_DURATION: 5000, //Default notification duration in ms.
    DEFAULT_NOTIFICATION_SOUND: 'notification.ogg', //Default notification sound file. Set to null for none.

    MAX_INTERACTION_DISTANCE: 5, //Max interaction distance for interaction with objects, items, players and NPCs. Athena Default is 25
    NPC_MENU_DISTANCE: 5, //Max interaction distance for the NPC menu. Athena Default is 5
    ENTITY_SELECTOR_MARKER_OFF: true, //Turn the marker off
    MAPOBJECT_SELECTOR_MARKER_OFF: true, //Turn the marker off [E]
    ENTITY_SELECTOR_AUTOMODE: true, //Find the closest entity and not allow cycling targets.
    DISABLE_VEHICLE_SPAWN_DESPAWN: true, //Disable the ability to spawn/despawn vehicles on disconnect or connect. Instead all vehicles which are not in garage will spawn on server start.
    DISABLE_VEHICLE_DESPAWN_ON_DESTROY: true, //Disable the vehicle despawn on destroy. (Default is 60 seconds)

    DISABLE_DROPPED_ITEMS_TEXTLABLES: true, //Disable the dropped items textlabels.
    DISABLE_DEFAULT_WEAPON_ITEMS: true, //Disable the default weapon items.
    DISABLE_WEAPON_REMOVE_ON_DEATH: true, //Disable the weapon remove on death.
    DISABLE_DEFAULT_AMMO: true, //Disable the default ammo.
    DISABLE_DEFAULT_TIME_SYNC: true, //Disable the default time sync. Only set to true if you have implemented your own time logic (Default is false)
    DISABLE_HOSPITAL_BLIPS: false, //Disable the hospital blips.
    DISABLE_CORE_WEATHER_UPDATE_METHOD: true, //Disable the core-weather plugin system. (Default is false)
    DISABLE_CORE_WEATHER_SYNC_INTERVAL: false, //Disable the core-weather sync interval. (Default is false)
    DISABLE_CORE_WEATHER_UPDATE_TIME_CLIENT: true, //Disable the core-weather update time. (Default is false) TODO: Maybe can be removed.
    DISABLE_CORE_WEATHER_UPDATE_TIME_SERVER: false, //Disable the core-weather update time. (Default is false) TODO: Maybe can be removed.
    UPDATE_WORLD_TIME_INTERVAL: 60000, //Default 60000. 1 minutes, DO NOT SET IT BELOW 1 MINUTE.
    WEATHER_SYNC_INTERVAL: 1000 * 60 * 1, //1 minutes, DO NOT SET IT BELOW 1 MINUTE.
    DROP_DEFAULT_EXPIRATION: 1000 * 60 * 5, //5 minutes, DO NOT SET IT BELOW 1 MINUTE.
    DROP_EXPIRATION_INTERVAL: 1000 * 60 * 5, //5 minutes, DO NOT SET IT BELOW 1 MINUTE.
    DISABLE_OBJECT_DROP_EXPIRATION: false, //Disable the object drop expiration, for all droped items in database. Leave it false normally!
    DISABLE_OBJECT_DROP_BYPLAYER_EXPIRATION: true, //Disable the object drop expiration for dropped items by player.
    ITEM_MAX_STACK: -1, //Max stack size for items. (Athena Default is 512, set it to -1 for endless stack if item not provide a max size.)
    ITEM_MAX_STACK_DISABLED: true, //Disable the max stack size for items. (Athena Default is false, if set to true the ITEM MAXSTACK will be ignored.)
    ITEM_PREVENT_UNIQUE_STACK: true, //Prevent unique items to stack. This should be always true! Prevents stacking if item has an unique id > item.id!
    DEFAULT_STREAMING_DISTANCE: 500, //Default streaming distance for objects. (Athena Core Default is 100 or lower)
    DEFAULT_PICKUP_DISTANCE: 2, //Default pickup distance for objects. (Athena Core Default is 2)
    DEFAULT_OBJECT_DROP_COLLISSION: true, //If not specified in item, the default collision state for dropped objects.
    DEFAULT_OBJECT_DROP_FROZEN: false, //If not specified in item, the default frozen state for dropped objects.
    INTERACTION_DISPLAY_NAME_ENABLED: true, //Display the interaction display name. (Default is true)

    //TODO: Configuration for Corechanges. These are quickly added and only working with some changes in core. These changes should
    //be moved into this plugin and not be in core.
    DISABLE_TOOLBAR_COOLDOWN: false, //Disable the toolbar cooldown. (NOT TESTED, DO NOT USE, WILL HAVE SIDEEFFECTS)
    TOOLBAR_COOLDOWN_DELAY_TIME_BEFORE_USE: 0, //The cooldown before using a toolbar item. Normally 0.
    TOOLBAR_COOLDOWN_DELAY_TIME_AFTER_USE: 1000, //The cooldown after using a toolbar item. Prevents spamming. Normally 1000.
    DISABLE_TOOLBAR_COOLDOWN_DRAWING: true, //Disable the toolbar cooldown drawing.
    INVENTORY_AVATAR: false, //Disable the inventory avatar. If True also the char will be freezed if u open the inventory.

    //TO Activate a set of example codes. Only for testing purposes.
    EXAMPLES_ENABLED: true, //Enable the example context menu.
};
