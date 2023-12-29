import * as metaRef from '../../../../../client/extensions/meta.js';

declare module 'alt-client' {
    export interface Meta extends Partial<metaRef.Meta> {
        id: number;
        faction: number;
        isAdmin: boolean;
        activeToolIndex: number;
    }
}
