import * as iObjectRef from '../../../../../shared/interfaces/iObject.js';
import * as alt from 'alt-client';

declare module '@AthenaClient/api/index.js' {
    export type CreatedObject = iObjectRef.IObject & { createdObject?: alt.Object };
}
