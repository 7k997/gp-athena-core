import * as AthenaClient from '@AthenaClient/api/index.js';
import { ObjectMenuInjection } from '@AthenaClient/menus/object.js';
import { CreatedDrop } from '@AthenaClient/streamers/item.js';
import { Config } from '@AthenaPlugins/gp-athena-overrides/shared/config.js';
import { SYSTEM_EVENTS } from '@AthenaShared/enums/system.js';
import { IWheelOptionExt } from '@AthenaShared/interfaces/wheelMenu.js';
import * as alt from 'alt-client';
import * as native from 'natives';

const Injections: Array<ObjectMenuInjection> = [];

export class EntitySelectorOverride {
    static init() {
        AthenaClient.menu.object.override('open', EntitySelectorOverride.open);
        AthenaClient.menu.object.override('addInjection', EntitySelectorOverride.addInjection);

        AthenaClient.streamers.item.setDefaultMaxDistance(Config.DEFAULT_STREAMING_DISTANCE);
    }

    /**
     * Allows the current Menu Options to be modified.
     * Meaning, a callback that will modify existing options, or append new options to the menu.
     * Must always return the original wheel menu options + your changes.
     *
     * @static
     * @param {ObjectMenuInjection} callback
     *
     */
    static addInjection(callback: ObjectMenuInjection): void {
        Injections.push(callback);
    }

    static open(object: AthenaClient.CreatedObject | CreatedDrop) {
        alt.logWarning(`TEST!!!`);
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
        if (dist >= 3) {
            return;
        }

        let options: Array<IWheelOptionExt> = [];

        if ('name' in object) {
            alt.logWarning(`Object is a CreatedDrop`);
            // The property name is only available on CreatedDrop, so object is a CreatedDrop
            // Add default option to pick up the item, removed implemented in gp-items-shared
            // options.push({
            //     name: `Pickup ${object.name} (x${object.quantity})`,
            //     callback: () => {
            //         alt.emitServer(SYSTEM_EVENTS.INTERACTION_PICKUP_ITEM, object._id);
            //     },
            //     icon: 'icon-move_to_inbox',
            // });
        } else {
            alt.logWarning(`Object is a CreatedObject`);
        }

        for (const callback of Injections) {
            try {
                options = callback(object, options);
            } catch (err) {
                console.warn(`Got Entity Menu Injection Error: ${err}`);
                continue;
            }
        }

        // Used to debug if the item showed up correctly
        // options.push({ name: `${object.model}` });

        if (options.length <= 0) {
            return;
        }

        if (options.length === 1) {
            //Don't need to show wheel menu. Just use the only option.
            EntitySelectorOverride.execute(options[0]);
        }

        AthenaClient.systems.wheelMenu.open('Object', options);
    }

    static execute(option: IWheelOptionExt) {
        if (typeof option.callback === 'function') {
            if (Array.isArray(option.data)) {
                option.callback(...option.data);
            } else {
                option.callback();
            }
        }

        if (typeof option.emitClient === 'string') {
            if (Array.isArray(option.data)) {
                alt.emit(option.emitClient, ...option.data);
            } else {
                alt.emit(option.emitClient);
            }
        }

        if (typeof option.emitServer === 'string') {
            if (Array.isArray(option.data)) {
                alt.emitServer(option.emitServer, ...option.data);
            } else {
                alt.emitServer(option.emitServer);
            }
        }
    }
}
