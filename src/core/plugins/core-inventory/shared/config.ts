import { KEY_BINDS } from '@AthenaShared/enums/keyBinds';

const THE_LETTER_I = KEY_BINDS.INVENTORY;

export const INVENTORY_CONFIG = {
    PLUGIN_FOLDER_NAME: 'core-inventory',
    KEYBIND: THE_LETTER_I,
    WEBVIEW: {
        GRID: {
            SHOW_NUMBERS: false,
        },
        TOOLBAR: {
            SHOW_NUMBERS: true,
        },
        WEIGHT: {
            UNITS: 'kg',
        },
    },
    MAX_GIVE_DISTANCE: 5,
};
