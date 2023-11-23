import * as alt from 'alt-shared';
import { VEHICLE_TYPE } from '@AthenaShared/enums/vehicleTypeFlags.js';
import { types } from 'sass';

export default interface IGarage {
    position: alt.IVector3;
    types: Array<VEHICLE_TYPE>; //Leave empty for all types
    typesExcluded?: Array<VEHICLE_TYPE>; //Add types which not allowed
    index: string | number;
    parking: Array<{ position: alt.IVector3; rotation: alt.IVector3 }>;
}
