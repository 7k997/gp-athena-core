import * as alt from 'alt-client';
import * as native from 'natives';
import * as AthenaClient from '@AthenaClient/api/index.js';

import { SYSTEM_EVENTS } from '@AthenaShared/enums/system.js';
import { IPed } from '@AthenaShared/interfaces/iPed.js';
import { Animation } from '@AthenaShared/interfaces/animation.js';
import { playPedAnimation } from '@AthenaClient/systems/animations.js';

let localPeds: Array<IPed> = [];
let addedPeds: Array<IPed> = [];
let pedInfo: { [uid: string]: number } = {};
let isRemoving = false;
let interval;

/**
 * Do Not Export Internal Only
 */
const PedController = {
    init() {
        localPeds = [];
        addedPeds = [];
        pedInfo = {};
    },

    populate(peds: Array<IPed>) {
        addedPeds = peds;

        if (!interval) {
            interval = alt.setInterval(handleDrawPeds, 500);
        }
    },

    removeGlobalPed(uid: string) {
        isRemoving = true;

        let index = addedPeds.findIndex((ped) => ped.uid === uid);
        if (index >= 0) {
            addedPeds.splice(index, 1);
        }

        if (pedInfo[uid] !== null && pedInfo[uid] !== undefined) {
            native.deleteEntity(pedInfo[uid]);
            delete pedInfo[uid];
        }

        isRemoving = false;
    },

    playAnimation(uid: string, animation: Animation) {
        if (pedInfo[uid] !== null && pedInfo[uid] !== undefined) {
            playPedAnimation(pedInfo[uid], animation.dict, animation.name, animation.flags, animation.duration);
        }
    },

    removeAll() {
        const peds = addedPeds.concat(localPeds);
        while (peds.length >= 1) {
            const ped = peds.pop();
            const id = pedInfo[ped.uid];

            if (id === undefined || id === null) {
                return;
            }

            native.deletePed(id);
        }
    },
};

function handleDrawPeds() {
    if (isRemoving) {
        return;
    }

    const peds = addedPeds.concat(localPeds);

    if (peds.length <= 0) {
        return;
    }

    if (alt.Player.local.isMenuOpen) {
        return;
    }

    if (alt.Player.local.meta.isDead) {
        return;
    }

    for (let i = 0; i < peds.length; i++) {
        const pedData = peds[i];
        if (!pedData.maxDistance) {
            pedData.maxDistance = 25;
        }

        if (AthenaClient.utility.vector.distance2d(alt.Player.local.pos, pedData.pos) > pedData.maxDistance) {
            if (pedInfo[pedData.uid] === -1) {
                continue;
            }

            if (pedInfo[pedData.uid] !== undefined && pedInfo[pedData.uid] !== null) {
                native.deleteEntity(pedInfo[pedData.uid]);
                pedInfo[pedData.uid] = null;
            }
            continue;
        }

        if (pedInfo[pedData.uid] !== undefined && pedInfo[pedData.uid] !== null) {
            continue;
        }

        pedInfo[pedData.uid] = -1;

        const hash = alt.hash(pedData.model);
        AthenaClient.utility.model.load(hash).then((res) => {
            if (!res) {
                pedInfo[pedData.uid] = null;
                throw new Error(`${pedData.model} is not a valid model.`);
            }

            pedInfo[pedData.uid] = native.createPed(
                1,
                hash,
                pedData.pos.x,
                pedData.pos.y,
                pedData.pos.z,
                0,
                false,
                false,
            );

            native.setEntityNoCollisionEntity(pedInfo[pedData.uid], alt.Player.local.scriptID, false);
            native.setEntityAsMissionEntity(pedInfo[pedData.uid], true, false); // make sure its not despawned by game engine
            native.setBlockingOfNonTemporaryEvents(pedInfo[pedData.uid], true); // make sure ped doesnt flee etc only do what its told
            native.setPedCanBeTargetted(pedInfo[pedData.uid], false);
            native.setPedCanBeKnockedOffVehicle(pedInfo[pedData.uid], 1);
            native.setPedCanBeDraggedOut(pedInfo[pedData.uid], false);
            native.setPedSuffersCriticalHits(pedInfo[pedData.uid], false);
            native.setPedDropsWeaponsWhenDead(pedInfo[pedData.uid], false);
            native.setPedDiesInstantlyInWater(pedInfo[pedData.uid], false);
            native.setPedCanRagdoll(pedInfo[pedData.uid], false);
            native.setPedDiesWhenInjured(pedInfo[pedData.uid], false);
            native.taskSetBlockingOfNonTemporaryEvents(pedInfo[pedData.uid], true);
            native.setPedFleeAttributes(pedInfo[pedData.uid], 0, false);
            native.setPedConfigFlag(pedInfo[pedData.uid], 32, true); // ped can fly thru windscreen
            native.setPedConfigFlag(pedInfo[pedData.uid], 281, true); // ped no writhe
            native.setPedGetOutUpsideDownVehicle(pedInfo[pedData.uid], false);
            native.setPedCanEvasiveDive(pedInfo[pedData.uid], false);

            native.taskSetBlockingOfNonTemporaryEvents(pedInfo[pedData.uid], true);
            native.setBlockingOfNonTemporaryEvents(pedInfo[pedData.uid], true);
            native.setPedFleeAttributes(pedInfo[pedData.uid], 0, true);
            native.setPedCombatAttributes(pedInfo[pedData.uid], 17, true);
            native.setPedAsEnemy(pedInfo[pedData.uid], false);
            native.setEntityInvincible(pedInfo[pedData.uid], true);

            //Corechange: peacefull peds
            alt.logWarning(`Ped: ${pedData.uid} is peaceful: ${pedData.isPeaceful}`);
            if (pedData.isPeaceful) {
                alt.logWarning(`Ped: ${pedData.uid} is peaceful`);
                const ped = getPedById(pedInfo[pedData.uid]);
                alt.logWarning(`Ped: ${ped} is peaceful`);
                if (ped) setupPeacefulPed(ped);
            }

            alt.nextTick(() => {
                native.setEntityRotation(
                    pedInfo[pedData.uid],
                    pedData.rotation.x,
                    pedData.rotation.y,
                    pedData.rotation.z,
                    0,
                    true,
                );

                if (pedData.randomizeAppearance) {
                    native.setPedRandomProps(pedInfo[pedData.uid]);
                    native.setPedRandomComponentVariation(pedInfo[pedData.uid], 0);
                }

                native.freezeEntityPosition(pedInfo[pedData.uid], true);
                native.setEntityNoCollisionEntity(pedInfo[pedData.uid], alt.Player.local.scriptID, true);

                if (pedData.animations && pedData.animations.length > 0) {
                    let randomAnimation = pedData.animations[Math.floor(Math.random() * pedData.animations.length)];
                    PedController.playAnimation(pedData.uid, randomAnimation);
                }
            });
        });
    }
}

export function getPedById(id: number) {
    let filtered = alt.Ped.all.filter((v) => id == v.id);
    if (filtered.length == 0) return null;
    return filtered[0];
}

export function setupPeacefulPed(ped: alt.Ped) {
    alt.logWarning(`Ped: ${ped.scriptID} is peaceful`);
    native.stopPedSpeaking(ped.scriptID, true);
    native.taskSetBlockingOfNonTemporaryEvents(ped.scriptID, true);
    native.setEntityProofs(
        ped.scriptID,
        true, // bullet
        true, // fire
        true, // explosion
        true, // collision
        true, // melee
        true, // steam
        true, // DontResetDamageFlagsOnCleanupMissionState (?)
        true, // water
    );
    native.setPedTreatedAsFriendly(ped.scriptID, 1, 0);

    enum eRagdollBlockingFlags {
        RBF_ALL = 262143,
        RBF_BULLET_IMPACT = 0,
        RBF_VEHICLE_IMPACT = 1,
        RBF_FIRE = 2,
        RBF_ELECTROCUTION = 3,
        RBF_PLAYER_IMPACT = 4,
        RBF_EXPLOSION = 5,
        RBF_IMPACT_OBJECT = 6,
        RBF_MELEE = 7,
        RBF_RUBBER_BULLET = 8,
        RBF_FALLING = 9,
        RBF_WATER_JET = 10,
        RBF_DROWNING = 11,
        _0x9F52E2C4 = 12,
        RBF_PLAYER_BUMP = 13,
        RBF_PLAYER_RAGDOLL_BUMP = 14,
        RBF_PED_RAGDOLL_BUMP = 15,
        RBF_VEHICLE_GRAB = 16,
        RBF_SMOKE_GRENADE = 17,
    }

    enum PED_RESET_FLAG {
        // PreventLockonToFriendlyPlayers = 1,
        BlockFallTaskFromExplosionDamage = 458,
        BlockWeaponReactionsUnlessDead = 64,
        DisablePotentialBlastReactions = 249,
        DisableVehicleDamageReactions = 248,
    }

    native.setRagdollBlockingFlags(ped.scriptID, eRagdollBlockingFlags.RBF_ALL);

    everyTickWhile(
        () => ped.valid,
        () => {
            alt.logWarning(`Ped: ${ped.scriptID} is peaceful`);
            // native.setPedResetFlag(alt.Player.local, PED_RESET_FLAG.PreventLockonToFriendlyPlayers, true);
            native.setPedResetFlag(ped.scriptID, PED_RESET_FLAG.BlockFallTaskFromExplosionDamage, true);
            native.setPedResetFlag(ped.scriptID, PED_RESET_FLAG.BlockWeaponReactionsUnlessDead, true);
            native.setPedResetFlag(ped.scriptID, PED_RESET_FLAG.DisablePotentialBlastReactions, true);
            native.setPedResetFlag(ped.scriptID, PED_RESET_FLAG.DisableVehicleDamageReactions, true);
        },
    );
}

export function everyTickWhile(whileFunc: () => boolean, doFunc: () => void) {
    alt.everyTick(() => {
        if (whileFunc()) {
            doFunc();
        }
    });
}
  
/**
 * Gets an NPC based on their scriptID if present.
 * Gets only NPC which are created by athena API. If u need also peds created from other scripts use getGlobal.
 *
 * @static
 * @param {number} scriptId
 *
 */
export function get(scriptId: number): IPed | undefined {
    const keys = Object.keys(pedInfo);

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (`${pedInfo[key]}` !== `${scriptId}`) {
            continue;
        }

        const localPedIndex = localPeds.findIndex((x) => x.uid === key);
        const addedPedIndex = addedPeds.findIndex((x) => x.uid === key);

        if (localPedIndex <= -1 && addedPedIndex <= -1) {
            continue;
        }

        if (localPedIndex >= 0) {
            return localPeds[localPedIndex];
        }

        if (addedPedIndex >= 0) {
            return addedPeds[addedPedIndex];
        }

        continue;
    }

    return undefined;
}

/**
 * Gets an Global NPC based on their scriptID if present.
 * @beta
 *
 * @static
 * @param {number} scriptId
 *
 */
export function getGlobal(scriptId: number): IPed | undefined {
    let ped = get(scriptId);
    if(ped) return ped;

    // let filtered = alt.Ped.all.filter((v) => scriptId == v.id);
    // alt.logWarning(`Filtered: ${JSON.stringify(filtered)}`);
    // alt.logWarning(`ScriptID: ${scriptId}`);
    // if (filtered.length === 0) return undefined;

    ped = {
        uid: 'global-' + scriptId,
        model: native.getEntityModel(scriptId) + "",
        pos: native.getEntityCoords(scriptId, true),
        rotation: native.getEntityRotation(scriptId, 2),
        maxDistance: 25,
        animations: [],
        randomizeAppearance: false,
    };

    return ped;
}


/**
 * Create a client-only static pedestrian.
 *
 *
 * @param {IPed} pedData
 * @return {void}
 */
export function append(pedData: IPed) {
    if (!pedData.uid) {
        alt.logError(`(${JSON.stringify(pedData.pos)}) Ped is missing uid.`);
        return;
    }

    const index = localPeds.findIndex((ped) => ped.uid === pedData.uid);
    if (index <= -1) {
        localPeds.push(pedData);
    } else {
        alt.logWarning(`${pedData.uid} was not a unique identifier. Replaced Ped in PedController.`);
        localPeds[index] = pedData;
    }

    localPeds.push(pedData);
    if (!interval) {
        interval = alt.setInterval(handleDrawPeds, 500);
    }
}

/**
 * Remove a client ped by uid
 *
 *
 * @param {string} uid A unique string
 * @return {void}
 */
export function remove(uid: string) {
    isRemoving = true;

    let index = -1;

    if (pedInfo[uid] !== null && pedInfo[uid] !== undefined) {
        native.deleteEntity(pedInfo[uid]);
        delete pedInfo[uid];
    }

    index = localPeds.findIndex((ped) => ped.uid === uid);

    if (index <= -1) {
        isRemoving = false;
        return;
    }

    const pedData = localPeds[index];
    if (!pedData) {
        isRemoving = false;
        return;
    }

    localPeds.splice(index, 1);
    isRemoving = false;
}

alt.on('connectionComplete', PedController.init);
alt.on('disconnect', PedController.removeAll);
alt.onServer(SYSTEM_EVENTS.REMOVE_GLOBAL_PED, PedController.removeGlobalPed);
alt.onServer(SYSTEM_EVENTS.POPULATE_PEDS, PedController.populate);
alt.onServer(SYSTEM_EVENTS.PLAY_ANIMATION_FOR_PED, PedController.playAnimation);
alt.onServer(SYSTEM_EVENTS.APPEND_PED, append);
alt.onServer(SYSTEM_EVENTS.REMOVE_PED, remove);
