import * as alt from 'alt-client';
import * as native from 'natives';
import * as AthenaClient from '@AthenaClient/api/index.js';

import { IWheelOptionExt } from '@AthenaShared/interfaces/wheelMenu.js';
import { IPed } from '@AthenaShared/interfaces/iPed.js';
import { Config } from '@AthenaPlugins/gp-athena-overrides/shared/config.js';

export type NpcMenuInjection = (scriptID: number, ped: IPed, options: Array<IWheelOptionExt>) => Array<IWheelOptionExt>;

const Injections: Array<NpcMenuInjection> = [];
let disabled = false;

/**
 * Allows the current Menu Options to be modified.
 * Meaning, a callback that will modify existing options, or append new options to the menu.
 * Must always return the original wheel menu options + your changes.
 *
 * @static
 * @param {NpcMenuInjection} callback
 *
 */
export function addInjection(callback: NpcMenuInjection) {
    if (Overrides.addInjection) {
        return Overrides.addInjection(callback);
    }

    if (disabled) {
        return;
    }

    Injections.push(callback);
}

/**
 * Opens the wheel menu against a target npc script id.
 *
 * @static
 * @param {number} scriptID
 * @return {void}
 *
 */
export function open(scriptID: number): void {
    if (Overrides.open) {
        return Overrides.open(scriptID);
    }
    
    if (disabled) {
        return;
    }
    if (AthenaClient.webview.isAnyMenuOpen()) {
        return;
    }
    //Corechange: Check if entity is a ped failes for some reason.
    // if (!native.isEntityAPed(scriptID)) {
    //     return;
    // }

    //Corechange: Get ped also if its not created by athena api.
    const ped = AthenaClient.streamers.ped.getGlobal(scriptID);
    if (!ped) {
        return;
    }
    const coords = native.getEntityCoords(scriptID, false);
    const dist = AthenaClient.utility.vector.distance(alt.Player.local.pos, coords);
    if (dist >= Config.NPC_MENU_DISTANCE) {
        return;
    }
    let options: Array<IWheelOptionExt> = [];

    for (const callback of Injections) {
        try {
            options = callback(scriptID, ped, options);
        } catch (err) {
            console.warn(`Got NPC Menu Injection Error: ${err}`);
            continue;
        }
    }

    if (options.length <= 0) {
        return;
    }

    AthenaClient.systems.wheelMenu.open('Citizen', options);
}

/**
 * Disable the NPC Wheel Menu
 *
 * @export
 */
export function disable() {
    disabled = true;
}

interface NpcMenuFuncs {
    addInjection: typeof addInjection;
    open: typeof open;
}

const Overrides: Partial<NpcMenuFuncs> = {};

export function override(functionName: 'addInjection', callback: typeof addInjection);
export function override(functionName: 'open', callback: typeof open);
export function override(functionName: keyof NpcMenuFuncs, callback: any): void {
    Overrides[functionName] = callback;
}
