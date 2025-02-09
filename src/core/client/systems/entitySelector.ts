import * as alt from 'alt-client';
import * as native from 'natives';

import * as AthenaClient from '@AthenaClient/api/index.js';

import { MARKER_TYPE } from '@AthenaShared/enums/markerTypes.js';
import { SYSTEM_EVENTS } from '@AthenaShared/enums/system.js';
import { Interaction } from '@AthenaShared/interfaces/interaction.js';
import { KEY_BINDS } from '@AthenaShared/enums/keyBinds.js';
import {
    ClosestTarget,
    MapObjectTarget,
} from '@AthenaPlugins/gp-athena-overrides/client/src/replacements/mapObjectTarget.js';
import { IWheelOptionExt } from '@AthenaShared/interfaces/wheelMenu.js';
import { CreatedDrop } from '@AthenaClient/streamers/item.js';
import { Config } from '@AthenaPlugins/gp-athena-overrides/shared/config.js';
import { ITEM_SYNCED_META_TYPES } from '@AthenaShared/enums/syncedMeta.js';
import { IObject } from '@AthenaShared/interfaces/iObject.js';

//Corechange: TODO remove entity selector over vehicles and maybe more
// import { CreatedObject } from '@AthenaClient/streamers/object.js';

export type ValidEntityTypes = 'object' | 'pos' | 'npc' | 'player' | 'vehicle' | 'interaction';
export type TargetInfo = {
    id: number;
    pos: alt.IVector3;
    type: ValidEntityTypes;
    dist: number;
    height: number;
    entity: alt.Entity;
};

let everyTick: number;
let selections: Array<TargetInfo> = [];
let selectionIndex = 0;
let lastSelection: TargetInfo;
let nextUpdate = Date.now();
let timeBetweenUpdates = 500;
let showMarker = true;
let color: alt.RGBA = new alt.RGBA(255, 255, 255, 200);
let size = new alt.Vector3(0.1, 0.05, 0.1);
let latestInteraction: Interaction;
let autoMode = true;
const IconMap = new Map<number, string>();
const NameMap = new Map<number, string>();

//Combined Object Map - Renders only one menue for two or more objects
const CombinedObjectMap = new Map<number, string>();
let CombinedObjects = new Map<string, Array<AthenaClient.CreatedObject>>();

const Internal = {
    init() {
        everyTick = alt.everyTick(Internal.tick);

        AthenaClient.systems.hotkeys.add({
            key: KEY_BINDS.INTERACT,
            description: 'Interact',
            identifier: 'interact-hotkey',
            restrictions: {
                isVehicleDriver: false,
            },
            keyDown: Internal.invokeSelection,
        });

        AthenaClient.systems.hotkeys.add({
            key: KEY_BINDS.INTERACT,
            description: 'Interact',
            identifier: 'interact-hotkey-vehicle',
            modifier: 'shift',
            restrictions: {
                isVehicleDriver: true,
            },
            keyDown: Internal.invokeSelection,
        });

        AthenaClient.systems.hotkeys.add({
            key: KEY_BINDS.INTERACT_ALT,
            description: 'Interact Alternative',
            identifier: 'interact-hotkey-alt',
            keyDown: Internal.invokeSelection,
        });

        AthenaClient.systems.hotkeys.add({
            key: KEY_BINDS.INTERACT_CYCLE,
            description: 'Interact Change Target',
            identifier: 'interact-hotkey-cycle',
            keyDown: Internal.selectClosestEntity,
        });

        selectionIndex = 0;
        Internal.updateSelectionList();
    },
    convert(dataSet: Array<alt.Entity>, type: ValidEntityTypes): Array<TargetInfo> {
        let entityInfo: Array<TargetInfo> = [];
        for (let i = 0; i < dataSet.length; i++) {
            if (type === 'player' && dataSet[i].remoteID === alt.Player.local.remoteID) {
                continue;
            }

            if (dataSet[i] instanceof alt.Object) {
                const object = dataSet[i] as alt.Object;
                if (object && native.isEntityAttached(object.scriptID)) {
                    continue;
                }
            }

            const [_, min, max] = native.getModelDimensions(dataSet[i].model);
            const height = Math.abs(min.z) + Math.abs(max.z);
            const dist = AthenaClient.utility.vector.distance2d(alt.Player.local.pos, dataSet[i].pos);
            entityInfo.push({ id: dataSet[i].scriptID, dist, type, pos: dataSet[i].pos, height, entity: dataSet[i] });
        }

        return entityInfo;
    },
    convertMapObject(mapObject: ClosestTarget, type: ValidEntityTypes): Array<TargetInfo> {
        let entityInfo: Array<TargetInfo> = [];

        const model = native.getEntityModel(mapObject.scriptID);
        const [_, min, max] = native.getModelDimensions(model);
        const height = Math.abs(min.z) + Math.abs(max.z);
        const dist = AthenaClient.utility.vector.distance2d(alt.Player.local.pos, mapObject.pos);
        entityInfo.push({ id: mapObject.scriptID, dist, type, pos: mapObject.pos, height, entity: null });

        return entityInfo;
    },
    getClosestNearby(dataSet: Array<alt.Entity>, distance = Config.MAX_INTERACTION_DISTANCE): alt.Entity[] {
        const closest = dataSet.filter((x) => {
            if (x.pos.x === 0 && x.pos.y === 0) {
                return false;
            }

            const dist = AthenaClient.utility.vector.distance(x.pos, alt.Player.local.pos);
            if (dist > distance) {
                return false;
            }

            return true;
        });

        return closest;
    },
    updateSelectionList() {
        const players = Internal.getClosestNearby([...alt.Player.all]);
        const peds = Internal.getClosestNearby([...alt.Ped.all]);
        const vehicles = Internal.getClosestNearby([...alt.Vehicle.streamedIn]);
        const serverObjects = Internal.getClosestNearby([...alt.Object.all]);
        const clientObjects = Internal.getClosestNearby([...alt.LocalObject.allWorld]);

        let entityInfo: Array<TargetInfo> = Internal.convert(players, 'player');
        entityInfo = entityInfo.concat(Internal.convert(peds, 'npc'));
        entityInfo = entityInfo.concat(Internal.convert(vehicles, 'vehicle'));
        entityInfo = entityInfo.concat(Internal.convert(serverObjects, 'object'));
        entityInfo = entityInfo.concat(Internal.convert(clientObjects, 'object'));

        if (latestInteraction) {
            const dist = AthenaClient.utility.vector.distance2d(alt.Player.local.pos, latestInteraction.position);
            entityInfo.push({
                dist,
                height: 1,
                id: -1,
                pos: latestInteraction.position,
                type: 'interaction',
                entity: null,
            });
        }

        entityInfo.sort((a, b) => {
            return a.dist - b.dist;
        });

        selections = entityInfo.slice(0, entityInfo.length < 5 ? entityInfo.length : Config.MAX_INTERACTION_TARGETS);

        //Corechange filter by Max Distance
        selections = entityInfo.filter((entityInfo) => entityInfo.dist <= Config.MAX_INTERACTION_DISTANCE);

        if (typeof lastSelection === 'undefined') {
            if (selections.length >= 1) {
                lastSelection = selections[0];
                selectionIndex = 0;
            }

            return;
        }

        if (selections.length <= 0) {
            lastSelection = undefined;
            return;
        }

        let index = selections.findIndex((x) => x.id === lastSelection.id);
        if (index <= -1) {
            index = 0;
        }

        lastSelection = selections[index];
        selectionIndex = autoMode === false ? index : 0;
    },
    selectClosestEntity() {
        if (AthenaClient.webview.isAnyMenuOpen()) {
            return;
        }

        if (typeof everyTick !== 'number') {
            return;
        }

        selectionIndex += 1;
        if (selectionIndex >= selections.length) {
            selectionIndex = 0;
        }

        //TODO: Corechange Last selection was not set in core athena
        lastSelection = selections[selectionIndex];
        AthenaClient.systems.sound.frontend('SKIP', 'HUD_FRONTEND_DEFAULT_SOUNDSET');
    },
    invokeSelection() {
        //Corechange completly reworked
        // if (latestInteraction) {
        //     AthenaClient.systems.interaction.invoke();
        //     return;
        // }

        // //TODO Implement config setting
        const configPreSelectMenu = true;
        let selected = selections;

        //No pre selection menu
        if (!configPreSelectMenu) {
            selected = [selections[selectionIndex]];
        }

        // //More then one selection -> Open pre selection menu

        // Here we will construct a dynamic wheel menu based on the amount of options we have.
        const wheelOptions: Array<IWheelOptionExt> = [];
        const scriptIDsAdded: Map<number, boolean> = new Map();

        //Clean up last combined objects
        CombinedObjects.clear();

        for (const selection of selected) {
            if (typeof selection === 'undefined') {
                break;
            }

            switch (selection.type) {
                case 'npc':
                    wheelOptions.push({
                        name: `Person`,
                        icon: 'icon-user-tie',
                        data: [selection.id],
                        callback: (_scriptID: number) => {
                            AthenaClient.menu.npc.open(_scriptID);
                        },
                    });
                    break;
                case 'player':
                    const targetPlayer = alt.Player.all.find((x) => x.scriptID === selection.id);
                    if (!targetPlayer || !targetPlayer.valid) {
                        break;
                    }
                    wheelOptions.push({
                        name: `Person`,
                        icon: 'icon-person',
                        data: [targetPlayer],
                        callback: (_targetPlayer: alt.Player) => {
                            AthenaClient.menu.player.open(_targetPlayer);
                        },
                    });
                    break;
                case 'vehicle':
                    const targetVehicle = alt.Vehicle.all.find((x) => x.scriptID === selection.id);
                    if (!targetVehicle || !targetVehicle.valid) {
                        break;
                    }
                    const model = native.getDisplayNameFromVehicleModel(targetVehicle.model);
                    wheelOptions.push({
                        name: model,
                        icon: 'icon-directions_car',
                        data: [targetVehicle],
                        callback: (_targetVehicle: alt.Vehicle) => {
                            AthenaClient.menu.vehicle.open(_targetVehicle);
                        },
                    });
                    break;
                case 'object':
                    if (alt.Player.local.vehicle) {
                        break;
                    }

                    //Try first to find server object
                    let object: alt.Object = alt.Object.all.find((x) => x.scriptID === selection.id);

                    if (!object) {
                        //If not found, try to find client object
                        object = alt.LocalObject.allWorld.find((x) => x.scriptID === selection.id);
                            }

                    let createdObject: AthenaClient.CreatedObject;
                    if (!object) {
                        alt.logError('Created object not found! ' + selection.entity.model + ' ' + selection.entity.scriptID);
                        break;
                        } else {
                        const syncedObjectMeta = object.getStreamSyncedMeta(ITEM_SYNCED_META_TYPES.OBJECT) as IObject;
                        if (!syncedObjectMeta) {
                            //No synced meta, e.g. map object or object which is not created on server side
                            const localObject: IObject = {
                                model: Config.ENTITY_SELECTOR_HINT,
                                hash: object.model,
                                pos: object.pos,
                                rot: object.rot,
                                };
                            createdObject = { ...localObject, createdObject: object };
                            }
                        else {
                            createdObject = { ...syncedObjectMeta, createdObject: object };
                        }
                    }

                    //Corechange: gp-athena-overrides
                    //Corechange: prevent duplicate entries for dropped items and objects, because there are always both.
                    const droppedItem = AthenaClient.streamers.item.getDropped(object.remoteID);

                    if (typeof droppedItem !== 'undefined') {
                        if (Config.DEBUG)
                            alt.logWarning(
                                'ScriptID 1: ' +
                                    object.scriptID +
                                    ' ScriptID 2: ' +
                                    droppedItem?.createdObject.scriptID,
                            );
                        scriptIDsAdded.set(droppedItem.createdObject.scriptID, true);

                        let iconReplacement = IconMap.get(droppedItem.hash);                        
                        wheelOptions.push({
                            name: droppedItem.name,
                            icon: iconReplacement ? iconReplacement : 'icon-lightbulb',
                            data: [droppedItem],
                            callback: (_droppedItem: CreatedDrop) => {
                                AthenaClient.menu.object.open(_droppedItem);
                            },
                        });
                        break;
                    }

                    if (!scriptIDsAdded.has(selection.id)) {
                        alt.logWarning('ScriptID 3: ' + selection.id);
                        if (!createdObject) {
                            break;
                        }

                        const combinedType = CombinedObjectMap.get(createdObject.hash);
                        if (combinedType) {
                            alt.logWarning('Combined Object: ' + createdObject.hash);
                            //Wait for further objects and create combined menu in the end
                            const combinedObjects = CombinedObjects.get(combinedType);
                            if (combinedObjects) {
                                combinedObjects.push(createdObject);
                            } else {
                                CombinedObjects.set(combinedType, [createdObject]);
                            }
                        } else {     
                        if (Config.HIDE_WHEEL_MENU_FOR_OBJECTS_WITHOUT_OPTIONS) {
                            //Check if the object has options before add it.
                            let options = AthenaClient.menu.object.getOptions(createdObject);
                            if (!options || options.length <= 0) {
                                break;
                            }
                        }

                        let iconReplacement = IconMap.get(createdObject.hash);
                        let nameReplacement = NameMap.get(createdObject.hash);
                        wheelOptions.push({
                            name: nameReplacement ? nameReplacement : 'Object',
                            icon: iconReplacement ? iconReplacement : 'icon-impact-point',
                            data: [createdObject],
                            callback: (_createdObject: AthenaClient.CreatedObject) => {
                                AthenaClient.menu.object.open(_createdObject);
                            },
                        });
                    }
                    }

                    break;
                case 'pos':
                    break;
                case 'interaction':
                    wheelOptions.push({
                        name: 'Interaction',
                        icon: 'icon-lightbulb',
                        data: [],
                        callback: () => {
                            AthenaClient.systems.interaction.invoke();
                        },
                    });

                    break;
            }
        }

        //Add combined object menu
        if (CombinedObjects.size > 0) {
            for (let type of CombinedObjects.keys()) {
                let objects = CombinedObjects.get(type);
                if (!objects) {
                    continue;
                }

                let iconReplacement = IconMap.get(objects[0].hash);
                let nameReplacement = NameMap.get(objects[0].hash);

                if (Config.HIDE_WHEEL_MENU_FOR_OBJECTS_WITHOUT_OPTIONS) {
                    //Check if the object has options before add it.
                    let options = AthenaClient.menu.object.getOptions(objects[0]);
                    if (!options || options.length <= 0) {
                        break;
                    }
                }

                objects[0].combinedHashes = objects.map((x) => x.hash);
                objects[0].combinedPositions = objects.map((x) => x.pos);
                wheelOptions.push({
                    name: nameReplacement ? nameReplacement : 'Object',
                    icon: iconReplacement ? iconReplacement : 'icon-impact-point',
                    data: [objects[0]],
                    callback: (_createdObject: AthenaClient.CreatedObject) => {
                        AthenaClient.menu.object.open(_createdObject);
                    },
                });
            }
        }

        // Force Single Option Invoke
        if (wheelOptions.length === 1) {
            const option = wheelOptions[0];

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

        if (wheelOptions.length <= 0) {
            return;
        }

        AthenaClient.systems.wheelMenu.open('Select', wheelOptions);
    },
    tick() {
        if (AthenaClient.webview.isAnyMenuOpen()) {
            return;
        }

        if (Date.now() > nextUpdate) {
            nextUpdate = Date.now() + timeBetweenUpdates;
            selectionIndex = 0;
            Internal.updateSelectionList();
        }

        if (selections.length <= 0) {
            return;
        }

        if (autoMode) {
            selectionIndex = 0;
        }

        let existingPos: alt.IVector3 = selections[selectionIndex].pos;
        if (native.doesEntityExist(selections[selectionIndex].id)) {
            existingPos = native.getEntityCoords(selections[selectionIndex].id, false);
        }

        const pos = new alt.Vector3(existingPos).add(
            0,
            0,
            isNaN(selections[selectionIndex].height) ? 1 : selections[selectionIndex].height,
        );

        if (!showMarker) {
            return;
        }

        if (selections[selectionIndex].type === 'player' || selections[selectionIndex].type === 'vehicle') {
            const velocity = native.getEntitySpeed(selections[selectionIndex].id);
            if (velocity >= 6) {
                return;
            }
        }

        AthenaClient.screen.marker.drawSimple(
            MARKER_TYPE.CHEVRON_UP,
            pos,
            new alt.Vector3(0, 180, 0),
            size,
            color,
            true,
        );
    },
};

/**
 * Return the currently selected entity.
 *
 * @return {(TargetInfo | undefined)}
 */
export function getSelection(): TargetInfo | undefined {
    if (selections.length <= 0) {
        return undefined;
    }

    return selections[selectionIndex];
}

/**
 * Get all of the current entities in the player's radius.
 *
 * @return {Array<TargetInfo>}
 */
export function getSelectables(): Array<TargetInfo> {
    return selections;
}

/**
 * Sets an interaction to be pushed into the entity list.
 *
 * @param {(Interaction | undefined)} interaction
 */
export function setInteraction(interaction: Interaction | undefined) {
    latestInteraction = interaction;
}

/**
 * Turn the marker off.
 *
 */
export function setMarkerOff() {
    showMarker = false;
}

/**
 * Change the defualt marker colour.
 *
 * @param {alt.RGBA} customColor
 */
export function setMarkerColor(customColor: alt.RGBA) {
    color = customColor;
}

/**
 * Change the defualt marker size.
 *
 * @param {alt.Vector3} markerSize
 */
export function setMarkerSize(markerSize: alt.Vector3) {
    size = markerSize;
}

/**
 * When this function is called, it automatically will always
 * find the closest entity. It will not allow cycling Targets.
 *
 * @export
 */
export function setToAutoMode() {
    autoMode = true;
}

export function getClosestNearby(dataSet: Array<alt.Entity>, distance?: number) {
    return Internal.getClosestNearby(dataSet, distance);
}

export function addIcon(hash: number, icon: string) {
    IconMap.set(hash, icon);
}

export function addName(hash: number, name: string) {
    NameMap.set(hash, name);
}

export function addCombinedObject(hash: number, type: string) {
    CombinedObjectMap.set(hash, type);
}

alt.onServer(SYSTEM_EVENTS.TICKS_START, Internal.init);