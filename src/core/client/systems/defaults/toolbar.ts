import * as alt from 'alt-client';
import * as native from 'natives';
import * as AthenaClient from '@AthenaClient/api/index.js';

import { SYSTEM_EVENTS } from '@AthenaShared/enums/system.js';
import { Item } from '@AthenaShared/interfaces/item.js';
import { KEY_BINDS } from '@AthenaShared/enums/keyBinds.js';
import { Config } from '@AthenaPlugins/gp-athena-overrides/shared/config.js';


const DELAY_TIME_BEFORE_USE = Config.TOOLBAR_COOLDOWN_DELAY_TIME_BEFORE_USE;
const DELAY_TIME_AFTER_USE = Config.TOOLBAR_COOLDOWN_DELAY_TIME_AFTER_USE;
const KeyBinds = {
    [KEY_BINDS.TOOLBAR_ONE]: 0,
    [KEY_BINDS.TOOLBAR_TWO]: 1,
    [KEY_BINDS.TOOLBAR_THREE]: 2,
    [KEY_BINDS.TOOLBAR_FOUR]: 3,
    [KEY_BINDS.TOOLBAR_FIVE]: 4,
};

let toolbar: Array<Item> = [];
let debounceAfter = Date.now();
let debounceBefore = Date.now();
let enabled = true;
let intervalAfter: number;
let intervalBefore: number;
let lastKey: number;

const Internal = {
    init() {
        if (!enabled) {
            return;
        }

        alt.on('keyup', Internal.handleKeyPress);
    },
    handleChanges(_inventory: Array<Item>, _toolbar: Array<Item>) {
        if (!enabled) {
            return;
        }

        toolbar = _toolbar;
    },
    drawCooldownAfter() {
        if (Date.now() >= debounceAfter) {
            alt.clearInterval(intervalAfter);
            intervalAfter = undefined;
            alt.emitServer(SYSTEM_EVENTS.PLAYER_TOOLBAR_INVOKE, lastKey);
            return;
        }

        if (!enabled) {
            return;
        }

        //TODO: Corechange quick fix. Remove drawText3D
        if (!Config.DISABLE_TOOLBAR_COOLDOWN_DRAWING) {
            const timeLeft = ((debounceAfter - Date.now()) / 1000).toFixed(2);
            const offsetPos = native.getOffsetFromEntityInWorldCoords(alt.Player.local.scriptID, 0.5, 0, 0.2);
            AthenaClient.screen.text.drawText3D(`${timeLeft}s`, offsetPos, 0.5, new alt.RGBA(255, 255, 255, 150));
        }
    },
    drawCooldownBefore() {
        if (Date.now() >= debounceBefore) {
            alt.clearInterval(intervalBefore);
            intervalBefore = undefined;
            alt.emitServer(SYSTEM_EVENTS.PLAYER_TOOLBAR_INVOKE, lastKey);
            return;
        }

        if (!enabled) {
            return;
        }

        //TODO: Corechange quick fix. Remove drawText3D
        if (!Config.DISABLE_TOOLBAR_COOLDOWN_DRAWING) {
            const timeLeft = ((debounceBefore - Date.now()) / 1000).toFixed(2);
            const offsetPos = native.getOffsetFromEntityInWorldCoords(alt.Player.local.scriptID, 0.5, 0, 0.2);
            AthenaClient.screen.text.drawText3D(`${timeLeft}s`, offsetPos, 0.5, new alt.RGBA(255, 255, 255, 150));
        }
    },
    handleKeyPress(key: number) {
        if (!enabled) {
            return;
        }

        if (AthenaClient.webview.isAnyMenuOpen() && !AthenaClient.webview.isAllowToolbarKeys()) {
            return;
        }

        if (typeof KeyBinds[key] === 'undefined') {
            return;
        }

        //TODO: Corechange quick fix. Remove Cooldown
        if (Config.DISABLE_TOOLBAR_COOLDOWN) {
            lastKey = KeyBinds[key];
            alt.emitServer(SYSTEM_EVENTS.PLAYER_TOOLBAR_INVOKE, lastKey);
        } else {
            if (Date.now() < debounceAfter) {
                if (typeof intervalAfter === 'undefined') {
                    intervalAfter = alt.setInterval(Internal.drawCooldownAfter, 0);
                }

                AthenaClient.systems.sound.play2d('error', 0.2);
                return;
            }

            if (typeof intervalBefore !== 'undefined') {
                alt.clearInterval(intervalBefore);
            }

            debounceAfter = Date.now() + DELAY_TIME_AFTER_USE;
            debounceBefore = Date.now() + DELAY_TIME_BEFORE_USE;
            const index = toolbar.findIndex((x) => x.slot === KeyBinds[key]);
            if (index <= -1) {
                return;
            }

            if (typeof intervalBefore === 'undefined') {
                intervalBefore = alt.setInterval(Internal.drawCooldownBefore, 0);
            }

            lastKey = KeyBinds[key];
        }
    },
};

export const ToolbarSystem = {
    disable() {
        enabled = false;
    },
};

alt.onServer(SYSTEM_EVENTS.PLAYER_TOOLBAR_ENABLE, Internal.init);
alt.onServer(SYSTEM_EVENTS.PLAYER_EMIT_INVENTORY_SYNC, Internal.handleChanges);
