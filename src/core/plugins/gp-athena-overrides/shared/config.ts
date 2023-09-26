export const Config = {
    ENTITY_SELECTOR_MARKER_OFF: true, //Turn the marker off
    MAPOBJECT_SELECTOR_MARKER_OFF: false, //Turn the marker off
    ENTITY_SELECTOR_AUTOMODE: true, //Find the closest entity and not allow cycling targets.
    DISABLE_VEHICLE_SPAWN_DESPAWN: true, //Disable the ability to spawn/despawn vehicles on disconnect or connect. Instead all vehicles which are not in garage will spawn on server start.
    DISABLE_DEFAULT_WEAPON_ITEMS: true, //Disable the default weapon items.
    DISABLE_DEFAULT_AMMO: true, //Disable the default ammo.
    DISABLE_DEFAULT_TIME_SYNC: false, //Disable the default time sync.
    DISABLE_HOSPITAL_BLIPS: false, //Disable the hospital blips.
    WEATHER_SYNC_INTERVAL: 1000 * 60 * 1, //1 minutes, DO NOT SET IT BELOW 1 MINUTE.

    //TODO: Configuration for Corechanges. These are quickly added and only working with some changes in core. These changes should
    //be moved into this plugin and not be in core.
    DISABLE_TOOLBAR_COOLDOWN: false, //Disable the toolbar cooldown. (NOT TESTED, DO NOT USE, WILL HAVE SIDEEFFECTS)
    TOOLBAR_COOLDOWN_DELAY_TIME_BEFORE_USE: 0, //The cooldown before using a toolbar item. Normally 0.
    TOOLBAR_COOLDOWN_DELAY_TIME_AFTER_USE: 1000, //The cooldown after using a toolbar item. Prevents spamming. Normally 1000.
    DISABLE_TOOLBAR_COOLDOWN_DRAWING: true, //Disable the toolbar cooldown drawing.
    INVENTORY_AVATAR: false, //Disable the inventory avatar. If True also the char will be freezed if u open the inventory.
};
