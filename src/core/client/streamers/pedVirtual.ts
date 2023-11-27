import * as alt from 'alt-client';
import * as native from 'natives';

import { playPedAnimation } from '@AthenaClient/systems/animations.js';
import { NET_OWNER_PED } from '@AthenaShared/enums/netOwner.js';
import { Animation } from '@AthenaShared/interfaces/animation.js';
import { IPed } from '@AthenaShared/interfaces/iPed.js';

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

function gameEntityCreate(entity: alt.Entity) {
    if (!(entity instanceof alt.Ped)) {
        return;
    }

    if (entity.getStreamSyncedMeta('type') === 'ped') {
        const data = getData(entity);
        if (!data) {
            return;
        }

        initPed(entity, data);
    }
}

function onStreamSyncedMetaChanged(entity: alt.Entity, key: string, value: any) {
    if (!(entity instanceof alt.Ped)) {
        return;
    }

    if (entity.getStreamSyncedMeta('type') === 'ped') {
        const data = getData(entity);
        if (!data) {
            return;
        }

        // initPed(entity, data); // on create! To verify!
    }
}

function initPed(ped: alt.Ped, pedData: IPed) {
    alt.logWarning(`Ped: ${ped.scriptID} is being initialized. JSON pedData: ${JSON.stringify(pedData)}`);

    const id = ped.scriptID;
    alt.nextTick(() => {
        native.setEntityAsMissionEntity(ped.scriptID, true, false); // make sure its not despawned by game engine
        native.setPedDiesWhenInjured(ped.scriptID, false);

        native.setEntityNoCollisionEntity(id, alt.Player.local.scriptID, false);
        native.taskSetBlockingOfNonTemporaryEvents(id, true);
        native.setBlockingOfNonTemporaryEvents(id, true); // make sure ped doesnt flee etc only do what its told
        native.setPedFleeAttributes(id, 0, true);
        native.setPedCombatAttributes(id, 17, true);
        native.setPedAsEnemy(id, false);
        native.setEntityInvincible(id, true);
        native.freezeEntityPosition(id, true);

        native.setPedCanBeTargetted(ped.scriptID, false);
        native.setPedCanBeKnockedOffVehicle(ped.scriptID, 1);
        native.setPedCanBeDraggedOut(ped.scriptID, false);
        native.setPedSuffersCriticalHits(ped.scriptID, false);
        native.setPedDropsWeaponsWhenDead(ped.scriptID, false);
        native.setPedDiesInstantlyInWater(ped.scriptID, false);
        native.setPedCanRagdoll(ped.scriptID, false);
        native.setPedConfigFlag(ped.scriptID, 32, true); // ped can fly thru windscreen
        native.setPedConfigFlag(ped.scriptID, 281, true); // ped no writhe
        native.setPedGetOutUpsideDownVehicle(ped.scriptID, false);
        native.setPedCanEvasiveDive(ped.scriptID, false);

        if (pedData.randomizeAppearance) {
            native.setPedRandomProps(ped.scriptID);
            native.setPedRandomComponentVariation(ped.scriptID, 0);
        }

        native.setEntityNoCollisionEntity(ped.scriptID, alt.Player.local.scriptID, true);

        if (pedData.animations && pedData.animations.length > 0) {
            let randomAnimation = pedData.animations[Math.floor(Math.random() * pedData.animations.length)];
            playPedAnimation(
                ped.scriptID,
                randomAnimation.dict,
                randomAnimation.name,
                randomAnimation.flags,
                randomAnimation.duration,
            );
        }
    });

    // if (pedData.isPeaceful) {
    //     if (ped) setupPeacefulPed(ped);
    // }
}

// function setupPeacefulPed(ped: alt.Ped) {
//     alt.logWarning(`Ped: ${ped.scriptID} is peaceful`);
//     native.stopPedSpeaking(ped.scriptID, true);
//     // native.taskSetBlockingOfNonTemporaryEvents(ped.scriptID, true); already done above
//     native.setEntityProofs(
//         ped.scriptID,
//         true, // bullet
//         true, // fire
//         true, // explosion
//         true, // collision
//         true, // melee
//         true, // steam
//         true, // DontResetDamageFlagsOnCleanupMissionState (?)
//         true, // water
//     );
//     native.setPedTreatedAsFriendly(ped.scriptID, 1, 0);

//     native.setRagdollBlockingFlags(ped.scriptID, eRagdollBlockingFlags.RBF_ALL);

//     // everyTickWhile(
//     //     () => ped.valid,
//     //     () => {
//     //         // native.setPedResetFlag(alt.Player.local, PED_RESET_FLAG.PreventLockonToFriendlyPlayers, true);
//     //         native.setPedResetFlag(ped.scriptID, PED_RESET_FLAG.BlockFallTaskFromExplosionDamage, true);
//     //         native.setPedResetFlag(ped.scriptID, PED_RESET_FLAG.BlockWeaponReactionsUnlessDead, true);
//     //         native.setPedResetFlag(ped.scriptID, PED_RESET_FLAG.DisablePotentialBlastReactions, true);
//     //         native.setPedResetFlag(ped.scriptID, PED_RESET_FLAG.DisableVehicleDamageReactions, true);
//     //     },
//     // );
// }

function everyTickWhile(whileFunc: () => boolean, doFunc: () => void) {
    alt.everyTick(() => {
        if (whileFunc()) {
            doFunc();
        }
    });
}

function getData(object: alt.Entity): IPed {
    return object.getStreamSyncedMeta('ped') as IPed;
}

alt.onServer(NET_OWNER_PED.ANIMATE, (ped: alt.Ped, animation: Animation) => {
    playPedAnimation(ped.scriptID, animation.dict, animation.name, animation.flags, animation.duration);
});

alt.onServer(NET_OWNER_PED.GOTO, (ped: alt.Ped, pos: alt.Vector3) => {
    native.taskGoStraightToCoord(ped.scriptID, pos.x, pos.y, pos.z, 10, -1, 0, 0);
});

alt.onServer(NET_OWNER_PED.FOLLOW, (ped: alt.Ped, target: alt.Player) => {
    native.taskGoToEntity(ped.scriptID, target.scriptID, -1, 1, 10, 1073741824.0, 0);
    native.setPedKeepTask(ped.scriptID, true);
});

alt.onServer(NET_OWNER_PED.UNFOLLOW, (ped: alt.Ped, target: alt.Player) => {
    native.clearPedTasksImmediately(ped.scriptID);
});

alt.onServer(NET_OWNER_PED.ENTER_VEHICLE, async (ped: alt.Ped, vehicle: alt.Vehicle, seat: number) => {
    await alt.Utils.waitFor(() => native.isPedInAnyVehicle(ped.scriptID, false) == false, 10000);
    native.taskEnterVehicle(ped.scriptID, vehicle.scriptID, -1, seat, 2, 1, '');
});

alt.onServer(NET_OWNER_PED.LEAVE_VEHICLE, (ped: alt.Ped) => {
    if (!native.isPedInAnyVehicle(ped.scriptID, false)) {
        return;
    }

    native.taskLeaveAnyVehicle(ped.scriptID, 0, 1);
});

alt.on('streamSyncedMetaChange', onStreamSyncedMetaChanged);
alt.on('gameEntityCreate', gameEntityCreate);
