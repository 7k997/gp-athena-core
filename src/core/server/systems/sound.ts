import * as alt from 'alt-server';
import { SYSTEM_EVENTS } from '../../shared/enums/system.js';
import { distance2d } from '../../shared/utility/vector.js';

export interface CustomSoundInfo {
    /**
     * A custom `.ogg` file name for an audio clip.
     *
     * @type {string}
     *
     */
    audioName: string;

    /**
     * A positional Vector3 on where to play the sound from.
     *
     * @type {alt.IVector3}
     *
     */
    pos?: alt.IVector3;

    /**
     * Play sound also for all players in the vehicle.
     * You can leave the pos empty if you want to play the sound only for players in the vehicle.
     * If you set also the pos, the sound will be played for all players in the vehicle and in the area.
     *
     * @type {alt.IVector3}
     *
     */
    vehicle?: alt.Vehicle;

    /**
     * The volume between `0.0` - `1.0`.
     *
     * Recommended: `0.35`.
     *
     * @type {number}
     *
     */
    volume?: number;

    /**
     * If you want the audio 3D specify a target to play this audio from.
     *
     * @type {alt.Entity}
     *
     */
    target?: alt.Entity;
}

const MAX_AUDIO_AREA_DISTANCE = 25;

/**
 * Play a single sound for a player.
 *
 * @static
 * @param {alt.Player} player An alt:V Player Entity
 * @param {CustomSoundInfo} soundInfo
 *
 */
export function playSound(player: alt.Player, soundInfo: CustomSoundInfo) {
    if (Overrides.playSound) {
        return Overrides.playSound(player, soundInfo);
    }

    if (soundInfo.target) {
        alt.emitClient(player, SYSTEM_EVENTS.PLAYER_EMIT_SOUND_3D, soundInfo.target, soundInfo.audioName);
        return;
    }

    alt.emitClient(player, SYSTEM_EVENTS.PLAYER_EMIT_SOUND_2D, soundInfo.audioName, soundInfo.volume);
}

/**
 * Play a custom non-frontend sound in a dimension.
 * Specify an entity to make the sound play from that specific entity.
 *
 * @static
 * @param {number} dimension
 * @param {alt.Entity} [entity=null]
 *
 */
export function playSoundInDimension(dimension: number, soundInfo: Omit<CustomSoundInfo, 'pos'>) {
    if (Overrides.playSoundInDimension) {
        return Overrides.playSoundInDimension(dimension, soundInfo);
    }

    const players = [...alt.Player.all].filter((t) => t.dimension === dimension);

    if (players.length <= 0) {
        return;
    }

    if (soundInfo.target) {
        alt.emitClient(players, SYSTEM_EVENTS.PLAYER_EMIT_SOUND_3D, soundInfo.target, soundInfo.audioName);
        return;
    }

    alt.emitClient(players, SYSTEM_EVENTS.PLAYER_EMIT_SOUND_2D, soundInfo.audioName, soundInfo.volume);
}

/**
 * Play a custom sound in a 3D position for all players in the area.
 *
 * @static
 * @param {(Required<Omit<CustomSoundInfo, 'target' | 'volume'>>)} soundInfo
 * @return {void}
 *
 */
export function playSoundInArea(soundInfo: CustomSoundInfo, maxDistance?: number, soundInstantID?: string) {
    if (Overrides.playSoundInArea) {
        return Overrides.playSoundInArea(soundInfo);
    }

    let pos = soundInfo.pos;
    const playersMap = new Map<alt.Player, boolean>();
    if (soundInfo.vehicle) {
        Object.values(soundInfo.vehicle.passengers).forEach(player => playersMap.set(player, true));

        if (!pos) {
            pos = soundInfo.vehicle.pos;
            }
        }

    if (soundInfo.pos) {
        [...alt.Player.all].forEach(player => {
            const dist = distance2d(player.pos, soundInfo.pos);

            if ((maxDistance && dist <= maxDistance) || (!maxDistance && dist <= MAX_AUDIO_AREA_DISTANCE)) {
                playersMap.set(player, true);
            }
    });
    }

    const players = Array.from(playersMap.keys());
    if (!players || players.length <= 0) {
        return;
    }

    const volume = soundInfo.volume;

    alt.emitClient(players, SYSTEM_EVENTS.PLAYER_EMIT_SOUND_3D_POSITIONAL, pos, soundInfo.audioName, volume, soundInstantID);
}

interface SoundFuncs {
    playSound: typeof playSound;
    playSoundInDimension: typeof playSoundInDimension;
    playSoundInArea: typeof playSoundInArea;
}

const Overrides: Partial<SoundFuncs> = {};

export function override(functionName: 'playSound', callback: typeof playSound);
export function override(functionName: 'playSoundInDimension', callback: typeof playSoundInDimension);
export function override(functionName: 'playSoundInArea', callback: typeof playSoundInArea);
/**
 * Used to override sound trigger functions.
 *
 *
 * @param {keyof SoundFuncs} functionName
 * @param {*} callback
 */
export function override(functionName: keyof SoundFuncs, callback: any): void {
    Overrides[functionName] = callback;
}
