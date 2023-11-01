/**
 * The current Vehicle Door Lock States
 * The lock state KIDNAP_MODE is for locking players in the car.
 * Use with care.
 *
 * @ignore
 *
 * @enum {number}
 */
export const VEHICLE_LOCK_STATE = {
    NO_LOCK: 0,
    UNLOCKED: 1,
    LOCKED: 2,
    LOCKOUT_PLAYER: 3,
    KIDNAP_MODE: 4,
    INITIALLY_LOCKED: 5,
    FORCE_DOORS_SHUT: 6,
    LOCKED_CAN_BE_DAMAGED: 7,
};

/**
 *
 * @ignore
 *
 */
export const VEHICLE_EVENTS = {
    ACTION: 'Vehicle-Action',
    INVOKE: 'Vehicle-Invoke',
    SET_INTO: 'Vehicle-Set-Into',
    SET_LOCK: 'Vehicle-Set-Lock',
    SET_DOOR: 'Vehicle-Set-Door',
    CLOSE_DOOR: 'Vehicle-Close-Door',
    OPEN_DOOR: 'Vehicle-Open-Door',
    SET_ENGINE: 'Vehicle-Set-Engine',
    SET_SEATBELT: 'Vehicle-Seatbelt',
    PUSH: 'Vehicle-Push',
    STOP_PUSH: 'Vehicle-Stop-Push',
};
