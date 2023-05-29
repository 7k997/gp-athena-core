import * as alt from 'alt-server';
import * as Athena from '@AthenaServer/api';
import { Config } from '@AthenaPlugins/gp-athena-overrides/shared/config';
import Database from '@stuyk/ezmongodb';
import { OwnedVehicle } from '@AthenaShared/interfaces/vehicleOwned';

export class VehiclesSpawn {
    static init() {
        if (Config.DISABLE_VEHICLE_SPAWN_DESPAWN) {
            VehiclesSpawn.spawnVehiclesOnStart();
        }
    }

    static async spawnVehiclesOnStart() {
        Athena.getters.player.ownedVehicleDocuments;

        const vehicles = await Database.fetchAllData<OwnedVehicle>(Athena.database.collections.Vehicles);

        let count = 0;

        for (let vehicle of vehicles) {
            if (vehicle.garageInfo) {
                continue;
            }

            const veh = Athena.vehicle.spawn.persistent(vehicle);
            if (typeof veh === 'undefined') {
                continue;
            }

            count += 1;
        }

        alt.log(`~y~${count} vehicles spawned.`);
    }
}
