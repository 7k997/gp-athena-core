/**
 * Used as a global keybind manager.
 * These are the defaults for all players who join your server.
 * Figure out what your keycode is through...
 * https://keycode.info/
 *
 * @ignore
 */
export const KEY_BINDS = {
    // ------------------------------Default Keys------------------------------
    INTERACT_ALT: 13, // Enter
    INTERACT_CYCLE: 9, // TAB

    //------------------------------GP Keys---------------------------------

    // Stern Special Key
    NOCLIP: 106,

    //5: 53,
    INTERACTION_EFFECT: 53,

    //F2
    HUD_SWITCH: 113,

    // Left Alt
    INTERACTION_MODE: 18,
    // 1 - 4
    TOOLBAR_ONE: 49,
    TOOLBAR_TWO: 50,
    TOOLBAR_THREE: 51,
    TOOLBAR_FOUR: 52,
    TOOLBAR_FIVE: 52,

    // E - Interact outside of vehicle
    INTERACT: 69,
    // X - Interact in vehicle
    INTERACT_KEY_FOR_VEHICLE: 88,
    // F
    VEHICLE_FUNCS: 70, // Driver
    // U
    VEHICLE_OPTIONS: 85, // Vehicle Options
    // H
    PLAYER_INTERACT: 72,
    // I
    INVENTORY: 73,
    // J
    ANIMATION: 74,
    // K
    FACTIONS: 75,
    //F4
    // WALKIETALKIE: 115,
    // T
    WALKIETALKIE_TALK: 84,
    // F5
    CHAT: 116,
    // X
    VEHICLE_LOCK: 88,
    // Y
    VEHICLE_ENGINE: 89,
    // Y (REPLACED WITH E OBJECT MENU)
    // OBJECT_ANIMATION: 89,
    //, Numpad
    STOP_ANIMATION: 110,
    //,
    STOP_ANIMATION2: 188,

    //F7
    OPTIONS: 118,

    //0
    KEYBIND_CHECKOWNERSHIP: 96,
    //-
    KEYBIND_OPENADMINMENU: 189,

    CUSTOM_ANIMATION_1: 97,
    CUSTOM_ANIMATION_2: 98,
    CUSTOM_ANIMATION_3: 99,
    CUSTOM_ANIMATION_4: 100,
    CUSTOM_ANIMATION_5: 101,
    CUSTOM_ANIMATION_6: 102,
    CUSTOM_ANIMATION_7: 103,
    CUSTOM_ANIMATION_8: 104,
    CUSTOM_ANIMATION_9: 105,

    // F1
    DEBUG_KEY: 112,
    // F2
    LEADERBOARD: 113,
    // F2
    // PHONE: 113,
    // >
    // FREE: 226,
    TRADE: 226,
    //. place object
    PLACEOBJECT: 190,
    //#
    HUD: 191,
    //°^ Voice Range
    RANGE: 220,
    //*
    MUTE: 187,
    //F3
    TABLET: 114,
    //VueExample
    VUE: 120,
    //M
    CURSOR: 77,
    //B
    FINGERPOINTING: 66,

    ////Siren Control
    //Stage Up - Bild-Hoch
    SIREN_STAGE_UP: 33,
    //Stage Down - Bild-Runter
    SIREN_STAGE_DOWN: 34,
    //Siren Switch - E
    SIREN_SWITCH: 46,
    //Light Switch -> Ende
    SIREN_LIGHT: 35,

    //R hitting with gun oder Waffe neu laden
    RELOAD: 82,
    //Q Zielen Geste
    AIM: 81,
    //L Ohnmächtig
    RAGDOLL: 76,
    //Pos1
    GPSSYSTEM: 36,
    //G
    TOWTRUCK: 71,
    //O
    VIEWMODE: 79,
    //B
    TAXICALLTEST: 45,
    //ä
    QUICKTEST: 222,
    QUICKTEST2: 192,

    //* numpad
    GENERATOR: 171,

    //Blinker und Lights
    TURNLEFT_SIGNAL: 37,
    TURNRIGHT_SIGNAL: 39,
    INTERNAL_LIGHTS: 38,
    WARNING_LIGHTS: 40,

    //WINDOWS Just for test, later in Interaction wheel menu
    //-, + am Numpad
    WINDOWLEFT: 109,
    WINDOWRIGHT: 107,

    // NUM + / 107
    FIREHOSE: 1,

    // left mouse button / 1
    LEFTMOUSE: 1,

    // right mouse button / 2
    RIGHTMOUSE: 2,

    //F10 - Player IDs
    SHOW_PLAYER_IDS: 121,

    OPENTRASH: 71,
};

/**
 * Use this to overwrite the default values.
 *
 * @export
 * @param {keyof typeof KEY_BINDS} key
 * @param {number} keyCode
 */
export function overwriteDefaultKeybind(key: keyof typeof KEY_BINDS, keyCode: number) {
    KEY_BINDS[key] = keyCode;
}
