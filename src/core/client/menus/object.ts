import * as alt from 'alt-client';
import * as native from 'natives';
import * as AthenaClient from '@AthenaClient/api/index.js';

import { IWheelOptionExt } from '../../shared/interfaces/wheelMenu.js';
import { CreatedObject } from '@AthenaClient/streamers/object.js';
import { CreatedDrop } from '@AthenaClient/streamers/item.js';
import { Config } from '@AthenaPlugins/gp-athena-overrides/shared/config.js';

export type ObjectMenuInjection = (
    existingObject: CreatedObject | CreatedDrop,
    options: Array<IWheelOptionExt>,
) => Array<IWheelOptionExt>;

const Injections: Array<ObjectMenuInjection> = [];
let disabled = false;

/**
 * Allows the current Menu Options to be modified.
 * Meaning, a callback that will modify existing options, or append new options to the menu.
 * Must always return the original wheel menu options + your changes.
 *
 * @static
 * @param {ObjectMenuInjection} callback
 *
 */
export function addInjection(callback: ObjectMenuInjection): void {
    if (Overrides.addInjection) {
        return Overrides.addInjection(callback);
    }

    if (disabled) {
        return;
    }

    Injections.push(callback);
}

/**
 * Opens the wheel menu against a target object created with the server-side object api
 *
 * @static
 * @param {CreatedObject} scriptID
 * @return {void}
 *
 */
export function open(object: CreatedObject | CreatedDrop): void {
    if (Overrides.open) {
        return Overrides.open(object);
    }

    if (disabled) {
        return;
    }

    if (AthenaClient.webview.isAnyMenuOpen()) {
        return;
    }

    if (!object.createdObject) {
        return;
    }

    if (!native.isEntityAnObject(object.createdObject.scriptID)) {
        return;
    }

    const coords = native.getEntityCoords(object.createdObject.scriptID, false);
    const dist = AthenaClient.utility.vector.distance(alt.Player.local.pos, coords);
    if (dist >= Config.MAX_INTERACTION_DISTANCE) {
        return;
    }

    let options: Array<IWheelOptionExt> = getOptions(object);
    // If only one option, execute it. No need for another dialog.
    // Force Single Option Invoke
    if (options.length === 1) {
        const option = options[0];

        if (option.callback) {
            const data = option.data ? option.data : [];
            option.callback(...data);
            return;
        }

        if (option.emitServer) {
            const data = option.data ? option.data : [];
            alt.emitServer(option.emitServer, ...data);
            return;
        }

        if (option.emitClient) {
            const data = option.data ? option.data : [];
            alt.emit(option.emitClient, ...data);
            return;
        }

        return;
    }

    AthenaClient.systems.wheelMenu.open('Object', options);
}

export function getOptions(object: CreatedObject | CreatedDrop): Array<IWheelOptionExt> {

    let options: Array<IWheelOptionExt> = [];

    for (const callback of Injections) {
        try {
            options = callback(object, options);
        } catch (err) {
            console.warn(`Got Object Menu Injection Error: ${err}`);
            continue;
        }
    }

    if (options.length <= 0) {
        return null;
    }

    return options;
}

/**
 * Disable the Object Wheel Menu
 *
 * @export
 */
export function disable() {
    disabled = true;
}

interface ObjectMenuFuncs {
    addInjection: typeof addInjection;
    open: typeof open;
}

const Overrides: Partial<ObjectMenuFuncs> = {};

export function override(functionName: 'addInjection', callback: typeof addInjection);
export function override(functionName: 'open', callback: typeof open);
export function override(functionName: keyof ObjectMenuFuncs, callback: any): void {
    Overrides[functionName] = callback;
}
