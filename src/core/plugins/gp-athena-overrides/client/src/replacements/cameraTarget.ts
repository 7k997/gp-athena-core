import * as native from 'natives';
import * as alt from 'alt-client';
import * as AthenaClient from '@AthenaClient/api/index.js';
import { KEY_BINDS } from '@AthenaShared/enums/keyBinds.js';
import { drawText3D } from '@AthenaClient/screen/text.js';
import { SYSTEM_EVENTS } from '@AthenaShared/enums/system.js';
import Raycast from '@AthenaPlugins/gp-athena-utils/client/src/utility/raycast.js';
import { Config } from '@AthenaPlugins/gp-athena-overrides/shared/config.js';

interface ClosestTarget {
    scriptID: number;
    pos: alt.IVector3;
    normalizedZ?: number;
    type?: 'npc' | 'player' | 'object' | 'vehicle';
}

//config
const renderDisplayLabel = Config.INTERACTION_DISPLAY_NAME_ENABLED;

const ignoredEntities: Array<number> = [];
let displayLabel = `[~b~${String.fromCharCode(KEY_BINDS.INTERACT)}~w~]~n~.`;
let temporaryLabel = null;
let isProcessing = false;
let closestTarget: ClosestTarget;
let interval: number;

export class CameraTarget {
    static init() {
        alt.onceServer(SYSTEM_EVENTS.TICKS_START, InternalFunctions.init);
    }

    static get(): ClosestTarget | null {
        return closestTarget;
    }

    static setDisplayLabel(label: string) {
        displayLabel = label;
    }

    static setTemporaryLabel(label: string) {
        temporaryLabel = label;
    }

    static addIgnoredEntity(handle: number) {
        const index = ignoredEntities.findIndex((x) => x === handle);
        if (index === -1) {
            ignoredEntities.push(index);
        }
    }

    static removeIgnoredEntity(handle: number) {
        const index = ignoredEntities.findIndex((x) => x === handle);
        if (index === -1) {
            return;
        }

        ignoredEntities.splice(index, 1);
    }
}

const InternalFunctions = {
    init() {
        interval = alt.setInterval(InternalFunctions.find, 250);
        alt.setInterval(() => {
            if (AthenaClient.webview.isAnyMenuOpen()) {
                return;
            }

            if (alt.Player.local.vehicle) {
                return;
            }

            if (closestTarget && closestTarget.pos && closestTarget.scriptID !== 0) {
                const pos = native.getEntityCoords(closestTarget.scriptID, false);
                if (!pos) {
                    return;
                }

                if (closestTarget.type === 'object') {
                    const model = native.getEntityModel(closestTarget.scriptID);

                    //TODO: Replacement needed?
                    // if (!ObjectWheelMenu.isModelValidObject(model)) {
                    //     return;
                    // }
                }

                if (temporaryLabel) {
                    drawText3D(
                        temporaryLabel,
                        new alt.Vector3(pos.x, pos.y, closestTarget.normalizedZ),
                        0.75,
                        new alt.RGBA(255, 255, 255, 255),
                    );
                    return;
                }

                if (renderDisplayLabel) {
                    drawText3D(
                        displayLabel,
                        new alt.Vector3(pos.x, pos.y, closestTarget.normalizedZ),
                        0.75,
                        new alt.RGBA(255, 255, 255, 255),
                    );
                }
            }
        }, 0);
    },
    find() {
        if (alt.Player.local.vehicle) {
            return;
        }

        if (AthenaClient.webview.isAnyMenuOpen()) {
            return;
        }

        if (isProcessing) {
            return;
        }

        isProcessing = true;

        // Do the processing for camera target
        // const raycastInfo = Raycast.simpleRaycast(16 | 8 | 4 | 2 | 1, 15);
        const raycastInfo = Raycast.simpleRaycastPlayersView(16 | 8 | 4 | 2 | 1, 15);

        if (!raycastInfo.didComplete || !raycastInfo.didHit) {
            closestTarget = null;
            temporaryLabel = null;
            isProcessing = false;
            return;
        }

        if (!raycastInfo.entityHit || !native.isEntityOnScreen(raycastInfo.entityHit)) {
            closestTarget = null;
            temporaryLabel = null;
            isProcessing = false;
            return;
        }

        const isIgnoredIndex = ignoredEntities.findIndex((x) => x === raycastInfo.entityHit);
        if (isIgnoredIndex >= 0) {
            closestTarget = null;
            temporaryLabel = null;
            isProcessing = false;
            return;
        }

        const coords = native.getEntityCoords(raycastInfo.entityHit, false);
        const model = native.getEntityModel(raycastInfo.entityHit);
        const [_, min, max] = native.getModelDimensions(model);
        const halfHeight = (Math.abs(min.z) + Math.abs(max.z)) / 2;

        closestTarget = {
            pos: raycastInfo.position,
            scriptID: raycastInfo.entityHit,
            normalizedZ: coords.z - Math.abs(min.z) + halfHeight,
        };

        if (alt.Player.all.find((p) => `${p.scriptID}` === `${raycastInfo.entityHit}`)) {
            closestTarget.type = 'player';
            isProcessing = false;
            return;
        }

        if (alt.Vehicle.all.find((v) => `${v.scriptID}` === `${raycastInfo.entityHit}`)) {
            closestTarget.type = 'vehicle';
            isProcessing = false;
            return;
        }

        if (native.isEntityAPed(raycastInfo.entityHit)) {
            closestTarget.type = 'npc';
            isProcessing = false;
            return;
        }

        if (native.isEntityAnObject(raycastInfo.entityHit)) {
            closestTarget.type = 'object';
            isProcessing = false;
            return;
        }

        temporaryLabel = null;
        closestTarget = null;
        isProcessing = false;
    },
};
