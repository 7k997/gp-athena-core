// Extends the player interface.
declare module 'alt-server' {
    export interface Vehicle {
        /**
         * Is this vehicle currently being refueled.
         * @type {boolean}
         * @memberof Vehicle
         */
        isRefueling?: boolean;
    }
}
