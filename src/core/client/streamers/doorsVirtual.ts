import * as alt from 'alt-client';
import * as native from 'natives';

import * as AthenaClient from '@AthenaClient/api/index.js';
import { Door } from '@AthenaShared/interfaces/door.js';
import { Config } from '@AthenaPlugins/gp-athena-overrides/shared/config.js';

let doors: Array<Door & { entity }> = [];
let interval: number;

export type DoorOnStreamEnterEvent = (door: Door) => void;

const DoorOnStreamEnterEvents: Array<DoorOnStreamEnterEvent> = [];

function draw() {
    //Corechange:
    //this here is not just drawing. Also the door state is set here.
    //So this must also be set if a menu is open!!! if not you can sometimes run
    //through closed doors.
    // if (alt.Player.local.isWheelMenuOpen) {
    //     return;
    // }

    // if (alt.Player.local.isMenuOpen) {
    //     return;
    // }

    if (doors.length <= 0) {
        return;
    }

    for (let door of doors) {
        if (alt.debug && !Config.ALT_DEBUG_OVERRIDE) {
            const dist = AthenaClient.utility.vector.distance2d(alt.Player.local.pos, door.pos);
            if (dist > 5) {
                continue;
            }

            AthenaClient.screen.text.drawText3D(
                `UID: ${door.uid} - Unlocked: ${door.isUnlocked}`,
                door.pos,
                0.5,
                new alt.RGBA(255, 255, 255, 255),
            );
        }
        //TODO: Maybe replace through native doorsystem.
        native.setStateOfClosestDoorOfType(door.model, door.pos.x, door.pos.y, door.pos.z, !door.isUnlocked, 0, false);
        //native.addDoorToSystem(door.lockID, door.model, door.pos.x, door.pos.y, door.pos.z, false, false, false);
        //native.doorSystemSetDoorState(door.lockID, door.isUnlocked ? 0 : 1, true, false);
        // native.doorSystemSetAutomaticDistance

    }
}

function onStreamEnter(entity: alt.Object) {
    if (!isDoor(entity)) {
        return;
    }

    if (!interval) {
        interval = alt.setInterval(draw, 0);
    }

    const data = getData(entity);
    if (!data) {
        return;
    }

    for (let i = 0; i < DoorOnStreamEnterEvents.length; i++) {
        DoorOnStreamEnterEvents[i](data);
    }

    const index = doors.findIndex((x) => x.uid === data.uid);
    if (index !== -1) {
        doors[index] = { ...data, entity };
    } else {
        doors.push({ ...data, entity });
    }
}

function onStreamExit(entity: alt.Object) {
    if (!isDoor(entity)) {
        return;
    }

    const data = getData(entity);
    if (!data) {
        return;
    }

    for (let i = doors.length - 1; i >= 0; i--) {
        if (doors[i].uid !== data.uid) {
            continue;
        }

        doors.splice(i, 1);
    }

    if (doors.length <= 0) {
        alt.clearInterval(interval);
        interval = undefined;
    }
}

function onStreamSyncedMetaChanged(entity: alt.Object, key: string, value: any) {
    if (!isDoor(entity)) {
        return;
    }

    const data = getData(entity);
    if (!data) {
        return;
    }

    const index = doors.findIndex((x) => x.uid === data.uid);
    if (index <= -1) {
        return;
    }

    doors[index] = { ...data, entity };
    console.log(doors[index]);
}

export function getData(object: alt.Object): Door {
    return object.getStreamSyncedMeta('door') as Door;
}

export function isDoor(object: alt.Object) {
    if (!(object instanceof alt.VirtualEntity)) {
        return false;
    }

    return object.getStreamSyncedMeta('type') === 'door';
}

export function getVirtualEntity(hash: number, pos: alt.Vector3): alt.Object {
    const doorsByDistance = doors.filter((x) => x.model === hash && AthenaClient.utility.vector.distance2d(pos, x.pos) < Config.MAX_INTERACTION_DISTANCE_VIRTUAL_ENTITY);
    if (!doorsByDistance || doorsByDistance.length === 0) {
        return undefined;
    }

    const nearestDoors = doorsByDistance.sort((a, b) => {
        const distA = AthenaClient.utility.vector.distance2d(pos, a.pos);
        const distB = AthenaClient.utility.vector.distance2d(pos, b.pos);

        return distA - distB;
    });

    return nearestDoors[0] ? nearestDoors[0].entity : undefined;
}

export function getNearestDoorByHash(hash: number, pos: alt.Vector3): Door {
    const doorsByDistance = doors.filter((x) => x.model === hash && AthenaClient.utility.vector.distance(pos, x.pos) < Config.MAX_INTERACTION_DISTANCE_SINGLE_DOOR);
    if (!doorsByDistance || doorsByDistance.length === 0) {
        return undefined;
    }

    const nearestDoors = doorsByDistance.sort((a, b) => {
        const distA = AthenaClient.utility.vector.distance(pos, a.pos);
        const distB = AthenaClient.utility.vector.distance(pos, b.pos);

        return distA - distB;
    });

    return nearestDoors[0] ? nearestDoors[0] : undefined;
}

export function getDoorByHash(hash: number, pos: alt.Vector3): Door {
    const explicitDoor = doors.filter((x) => x.model === hash && x.pos.x === pos.x && x.pos.y === pos.y && x.pos.z === pos.z);
    if (!explicitDoor || explicitDoor.length === 0) {
        return undefined;
    }

    return explicitDoor[0] ? explicitDoor[0] : undefined;
}

export function getDoubleDoorsByHashes(combinedHashes: Array<number>, combinedPositions: Array<alt.Vector3>, _pos: alt.Vector3): Array<Door> {
    let pos = _pos;

    //Check for correct position for overlapping doors
    // Verify if the first door is the correct one
    // Very special case for 2 double doors beside each other.
    // In some MLOs the doors are overlapping. So we will get the wrong door.
    if (combinedPositions && combinedPositions.length > 0) {
        for (let i = 0; i < combinedPositions.length; i++) {
            if (combinedPositions[i].x === pos.x && combinedPositions[i].y === pos.y && combinedPositions[i].z === pos.z) {
                continue;
            }

            const distance = AthenaClient.utility.vector.distance(_pos, combinedPositions[i]);
            if (distance < Config.MIN_INTERACTION_DISTANCE_DOUBLE_DOOR) {
                pos = combinedPositions[i];
                break;
            }
        }
    }

    alt.logWarning('Getting double doors by combined hash: ' + combinedHashes.join(', ') + ' at ' + pos + ' with max distance: ' + Config.MAX_INTERACTION_DISTANCE_DOUBLE_DOOR);
    alt.logWarning('Combined Positions: ' + JSON.stringify(combinedPositions));
    const doorsByDistance = doors.filter((door) => combinedHashes.includes(door.model) && AthenaClient.utility.vector.distance(pos, door.pos) < Config.MAX_INTERACTION_DISTANCE_DOUBLE_DOOR);

    const sortedDoors = doorsByDistance.sort((a, b) => {
        const distA = AthenaClient.utility.vector.distance(pos, a.pos);
        const distB = AthenaClient.utility.vector.distance(pos, b.pos);

        return distA - distB;
    });


    let filteredDoors: Array<Door> = [];
    alt.logWarning('Sorted Doors: ' + sortedDoors.length);
    alt.logWarning('Sorted Doors: ' + JSON.stringify(sortedDoors));

    for (let i = 0; i < sortedDoors.length; i++) {
        const door = sortedDoors[i];
        if (door.pos.x === pos.x && door.pos.y === pos.y && door.pos.z === pos.z) {
            filteredDoors.push(door);
        }
    }

    if (filteredDoors.length === 0) {
        return null;
    }

    let detectedOverlappingDoor = null;
    let lastDistance = null;
    for (let i = 0; i < sortedDoors.length; i++) {
        const door = sortedDoors[i];
        if (door.pos.x === pos.x && door.pos.y === pos.y && door.pos.z === pos.z) {
            continue;
        }

        const distance = AthenaClient.utility.vector.distance(pos, door.pos);

        if (distance < Config.MIN_INTERACTION_DISTANCE_DOUBLE_DOOR) {
            //Do not add overlapping doors
            detectedOverlappingDoor = door;
            continue;
        }

        if (lastDistance && (lastDistance - distance < Config.MIN_INTERACTION_DISTANCE_DOUBLE_DOOR)) {
            //Do not add overlapping doors
            detectedOverlappingDoor = door;
            continue;
        }

        lastDistance = distance;

        if (distance < Config.MAX_INTERACTION_DISTANCE_DOUBLE_DOOR) {
            //check which door is closer
            //if the overlapping door is closer, do not add the other door
            if (detectedOverlappingDoor) {
                const distA = AthenaClient.utility.vector.distance(detectedOverlappingDoor.pos, door.pos);
                const distB = AthenaClient.utility.vector.distance(pos, door.pos);
                if (distA < distB) {
                    continue;
                }
            }
            filteredDoors.push(door);
        }
    }

    return filteredDoors;
}

export function registerOnStreamEnter(callback: DoorOnStreamEnterEvent) {
    DoorOnStreamEnterEvents.push(callback);
}

alt.on('worldObjectStreamIn', onStreamEnter);
alt.on('worldObjectStreamOut', onStreamExit);
alt.on('streamSyncedMetaChange', onStreamSyncedMetaChanged);
