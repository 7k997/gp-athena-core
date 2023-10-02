import * as iObjectRef from '../../../../../shared/interfaces/iObject';
import * as alt from 'alt-client';

declare module '@AthenaClient/api' {
    export type CreatedObject = iObjectRef.IObject & { createdObject?: alt.LocalObject };
}
