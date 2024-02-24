import * as alt from 'alt-server';
import * as Athena from '@AthenaServer/api/index.js';
import { VEHICLE_EVENTS } from '@AthenaShared/enums/vehicle.js';
import { ANIMATION_FLAGS } from '@AthenaShared/flags/animationFlags.js';

export async function sharedOwnershipChecks(player: alt.Player, vehicle: alt.Vehicle) {
    if (Overrides.sharedOwnershipChecks) {
        return Overrides.sharedOwnershipChecks(player, vehicle);
    }

    if (!vehicle || !vehicle.valid) {
        return false;
    }

    if (Athena.getters.player.isDead(player)) {
        return false;
    }

    if (!Athena.getters.player.isValid(player)) {
        return false;
    }

    const options = {
        includeKeys: true,
        includePermissions: true,
        includeGroupPermissions: true,
    };

    if (!await Athena.vehicle.ownership.isOwner(player, vehicle, options)) {
        return false;
    }

    return true;
}

/**
 * Toggles a vehicle lock as if a player toggled it.
 *
 * @param {alt.Player} player An alt:V Player Entity
 * @param {alt.Vehicle} vehicle An alt:V Vehicle Entity
 */
export async function toggleLock(player: alt.Player, vehicle: alt.Vehicle) {
    if (Overrides.toggleLock) {
        return Overrides.toggleLock(player, vehicle);
    }

    if (!vehicle) {
        vehicle = player.vehicle;
    }

    if (!await sharedOwnershipChecks(player, vehicle)) {
        return;
    }

    const isLocked = await Athena.vehicle.controls.toggleLock(vehicle);
    const soundName = isLocked ? 'car_unlock' : 'car_lock';

    //Corechange: 
    // 1. Different animations for car lock/unlock inside/outside vehicle
    // 2. TODO: No sound for player. React on doors-locked/doors-unlocked events to play sound.

    if (!player.vehicle) Athena.player.emit.animation(player, 'anim@heists@keycard@', 'idle_a', ANIMATION_FLAGS.UPPERBODY_ONLY, 1000);
    if (player.vehicle) Athena.player.emit.animation(player, 'anim@heists@keycard@', 'idle_a', ANIMATION_FLAGS.UPPERBODY_ONLY, 1000); //TODO: Use another animation if in car!

    // Athena.player.emit.sound2D(player, soundName, 0.5, 'vehicle-lock');
    // Athena.player.emit.sound3D(player, soundName, vehicle, 'vehicle-lock')

    Athena.systems.sound.playSoundInArea({
        audioName: soundName,
        pos: vehicle.pos,
        vehicle: player.vehicle,
        volume: 0.15,
    });

    const eventToEmit = isLocked ? 'doors-locked' : 'doors-unlocked';
    Athena.vehicle.events.trigger(eventToEmit, vehicle, player);
    Athena.vehicle.events.trigger('doors-lock-changed', vehicle, player);
}

/**
 * Toggles an engine lock as if a player toggled it.
 *
 * @param {alt.Player} player An alt:V Player Entity
 * @param {alt.Vehicle} vehicle An alt:V Vehicle Entity
 * @return {void}
 */
export async function toggleEngine(player: alt.Player, vehicle: alt.Vehicle) {
    if (Overrides.toggleEngine) {
        return Overrides.toggleEngine(player, vehicle);
    }

    if (!vehicle) {
        vehicle = player.vehicle;
    }

    if (!await sharedOwnershipChecks(player, vehicle)) {
        return;
    }

    const newState = await Athena.vehicle.controls.toggleEngine(vehicle);
    const eventToEmit = newState ? 'engine-started' : 'engine-stopped';
    Athena.vehicle.events.trigger(eventToEmit, vehicle, player);
}

/**
 * Toggles a door lock as if a player toggled it.
 *
 * @param {alt.Player} player An alt:V Player Entity
 * @param {alt.Vehicle} vehicle An alt:V Vehicle Entity
 * @param {number} door
 */
export async function toggleDoor(player: alt.Player, vehicle: alt.Vehicle, door: 0 | 1 | 2 | 3 | 4 | 5) {
    if (Overrides.toggleDoor) {
        return Overrides.toggleDoor(player, vehicle, door);
    }

    if (!vehicle) {
        vehicle = player.vehicle;
    }

    if (typeof door !== 'number') {
        return;
    }

    if (!await sharedOwnershipChecks(player, vehicle)) {
        return;
    }

    if (Athena.vehicle.controls.isLocked(vehicle)) {
        return;
    }

    const newState = await Athena.vehicle.controls.toggleDoor(vehicle, door);
    alt.logWarning(`[Athena] Vehicle Door Toggled: ${newState}, door: ${door}`);
    const eventToEmit = newState ? 'door-opened' : 'door-closed';
    Athena.vehicle.events.trigger(eventToEmit, vehicle, door, player);
}

/**
 * Opens a door lock as if a player toggled it.
 *
 * @param {alt.Player} player An alt:V Player Entity
 * @param {alt.Vehicle} vehicle An alt:V Vehicle Entity
 * @param {number} door
 */
export async function openDoor(player: alt.Player, vehicle: alt.Vehicle, door: 0 | 1 | 2 | 3 | 4 | 5) {
    if (Overrides.openDoor) {
        return Overrides.openDoor(player, vehicle, door);
    }

    if (!vehicle) {
        vehicle = player.vehicle;
    }

    if (typeof door !== 'number') {
        return;
    }

    if (!await sharedOwnershipChecks(player, vehicle)) {
        return;
    }

    if (Athena.vehicle.controls.isLocked(vehicle)) {
        return;
    }

    const eventToEmit = 'door-opened'
    await Athena.vehicle.controls.openDoor(vehicle, door);
    Athena.vehicle.events.trigger(eventToEmit, vehicle, door, player);
}

/**
 * Closes a door lock as if a player toggled it.
 *
 * @param {alt.Player} player An alt:V Player Entity
 * @param {alt.Vehicle} vehicle An alt:V Vehicle Entity
 * @param {number} door
 */
export async function closeDoor(player: alt.Player, vehicle: alt.Vehicle, door: 0 | 1 | 2 | 3 | 4 | 5) {
    if (Overrides.closeDoor) {
        return Overrides.closeDoor(player, vehicle, door);
    }

    if (!vehicle) {
        vehicle = player.vehicle;
    }

    if (typeof door !== 'number') {
        return;
    }

    if (!await sharedOwnershipChecks(player, vehicle)) {
        return;
    }

    const eventToEmit = 'door-closed'
    await Athena.vehicle.controls.closeDoor(vehicle, door);
    Athena.vehicle.events.trigger(eventToEmit, vehicle, door, player);
}

alt.onClient(VEHICLE_EVENTS.SET_LOCK, toggleLock);
alt.onClient(VEHICLE_EVENTS.SET_ENGINE, toggleEngine);
alt.onClient(VEHICLE_EVENTS.SET_DOOR, toggleDoor);
alt.onClient(VEHICLE_EVENTS.CLOSE_DOOR, closeDoor);
alt.onClient(VEHICLE_EVENTS.OPEN_DOOR, openDoor);

interface VehicleAsPlayerFuncs {
    toggleLock: typeof toggleLock;
    toggleDoor: typeof toggleDoor;
    openDoor: typeof openDoor;
    closeDoor: typeof closeDoor;
    toggleEngine: typeof toggleEngine;
    sharedOwnershipChecks: typeof sharedOwnershipChecks;
}

const Overrides: Partial<VehicleAsPlayerFuncs> = {};

export function override(functionName: 'toggleLock', callback: typeof toggleLock);
export function override(functionName: 'toggleDoor', callback: typeof toggleDoor);
export function override(functionName: 'closeDoor', callback: typeof closeDoor);
export function override(functionName: 'openDoor', callback: typeof openDoor);
export function override(functionName: 'toggleEngine', callback: typeof toggleEngine);
export function override(functionName: 'sharedOwnershipChecks', callback: typeof sharedOwnershipChecks);
/**
 * Used to override vehicle control as a player functionality
 *
 *
 * @param {keyof VehicleAsPlayerFuncs} functionName
 * @param {*} callback
 */
export function override(functionName: keyof VehicleAsPlayerFuncs, callback: any): void {
    Overrides[functionName] = callback;
}
