import { KEY_BINDS } from '@AthenaShared/enums/keyBinds.js';
import { INametagConfig } from '../interfaces.js';

// Hover over these in VSCode to see what they do.
const nametagConfig: INametagConfig = {
    MAX_DRAW_DISTANCE: 50,
    SHOULD_SCREEN_SHAKE: true,
    SHOW_NAME: true,
    SHOW_ID: true,
    SHOW_NAME_INSTANTLY: false,
    SHOW_NAMETAGS_AND_ID_WITH_KEY: true, //If true, you have to hold the key to show nametags and ids
    SHOW_NAMETAGS_AND_ID_ONLY_FOR_ADMINS: true, //If true, only admins can see nametags and ids
    NAME_TAGS_KEY: KEY_BINDS.SHOW_PLAYER_IDS, // F10
};

export default nametagConfig;
