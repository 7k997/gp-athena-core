import * as alt from 'alt-client';
import * as native from 'natives';

import * as AthenaClient from '@AthenaClient/api/index.js';
import { Door } from '@AthenaShared/interfaces/door.js';
import { Config } from '@AthenaPlugins/gp-athena-overrides/shared/config.js';

let doors: Array<Door & { entity }> = [];
let interval: number;

function draw() {
    if (alt.Player.local.isWheelMenuOpen) {
        return;
    }

    if (alt.Player.local.isMenuOpen) {
        return;
    }

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

        native.setStateOfClosestDoorOfType(door.model, door.pos.x, door.pos.y, door.pos.z, !door.isUnlocked, 0, false);
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

    console.log(doors[index]);
    doors[index] = { ...data, entity };
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
    const doorsByDistance = doors.filter((x) => x.model === hash && AthenaClient.utility.vector.distance2d(pos, x.pos) < 5);
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

export function getDoor(hash: number, pos: alt.Vector3): Door {
    const doorsByDistance = doors.filter((x) => x.model === hash && AthenaClient.utility.vector.distance2d(pos, x.pos) < 5);
    if (!doorsByDistance || doorsByDistance.length === 0) {
        return undefined;
    }

    const nearestDoors = doorsByDistance.sort((a, b) => {
        const distA = AthenaClient.utility.vector.distance2d(pos, a.pos);
        const distB = AthenaClient.utility.vector.distance2d(pos, b.pos);

        return distA - distB;
    });

    return nearestDoors[0] ? nearestDoors[0] : undefined;
}

alt.on('worldObjectStreamIn', onStreamEnter);
alt.on('worldObjectStreamOut', onStreamExit);
alt.on('streamSyncedMetaChange', onStreamSyncedMetaChanged);
