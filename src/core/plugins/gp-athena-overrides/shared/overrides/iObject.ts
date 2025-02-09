import * as alt from 'alt-shared';

declare module '@AthenaShared/interfaces/iObject.js' {
    export interface IObject {
        /**
         * A unique identifier for this object.
         * @type {string}
         *
         */
        uid?: string;

        /**
         * Use this parameter to help you identify what this item does on client-side.
         *
         * Useful for wheel menu based functionality.
         *
         * @type {string}
         *
         */
        subType?: string;

        /**
         * Position of the Object in a 3D space.
         * @type {alt.IVector3}
         *
         */
        pos: alt.IVector3;

        /**
         * The model name or hash this object.
         * @type {string}
         *
         */
        model: string;

        /**
         * The rotation of this object.
         * @type {alt.IVector3}
         *
         */
        rot?: alt.IVector3;

        /**
         * The max distance this object should render at.
         * @type {number}
         *
         */
        maxDistance?: number;

        /**
         * Corechange
         * Is this object interior only.
         * Will only show in a matching interior dimension.
         * @type {boolean}
         * @memberof IObject
         */
        isInterior?: boolean;

        /**
         * Will show across all dimensions.
         * @type {number}
         *
         */
        dimension?: number;

        /**
         * Should this object have no collision?
         * @type {boolean}
         *
         */
        noCollision?: boolean;

        //Corechanges
        noFreeze?: boolean;
        hash?: number;
        combinedHashes?: number[];
        combinedPositions?: alt.IVector3[];
        //scriptID?: number;
        //item?: ItemEx<ISharedItem>;
    }
}
