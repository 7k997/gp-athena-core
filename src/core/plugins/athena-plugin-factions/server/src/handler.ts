import Database from '@stuyk/ezmongodb';
import * as alt from 'alt-server';
import { Collections } from '@AthenaServer/database/collections.js';
import { sha256Random } from '@AthenaServer/utility/hash.js';
import { DefaultRanks } from '../../shared/defaultData.js';
import { Faction, FactionCore, FactionRank } from '../../shared/interfaces.js';
import { Character } from '../../../../shared/interfaces/character.js';
import { deepCloneObject } from '../../../../shared/utility/deepCopy.js';
import * as Athena from '@AthenaServer/api/index.js';
import { LOCALE_KEYS } from '@AthenaShared/locale/languages/keys.js';
import { FactionPlayerFuncs } from './playerFuncs.js';
import { LocaleController } from '@AthenaShared/locale/locale.js';
import { FACTION_EVENTS } from '@AthenaPlugins/athena-plugin-factions/shared/factionEvents.js';
import { InventoryView } from '@AthenaPlugins/core-inventory/server/src/view.js';

export const FACTION_COLLECTION = 'factions';
const factions: { [key: string]: Faction } = {};

export type UpdateSettingsInjection = (faction: Faction) => void;

const UpdateSettingsInjections: Array<UpdateSettingsInjection> = [];

class InternalFunctions {
    /**
     * Create the faction and add cache it to memory.
     *
     * @static
     * @param {Faction} faction
     * @memberof InternalFunctions
     */
    static create(faction: Faction) {
        faction._id = faction._id.toString();
        factions[faction._id as string] = faction;

        if (!faction.settings) {
            faction.settings = {};
        }
        FactionHandler.updateSettings(faction);
    }
}

export class FactionHandler {
    /**
     * Faction Types.
     * Gang can do crime actions.
     * Neutral is Neutral.
     * State can do state actions ( arrest, cuff people, etc. )
     */
    static factionTypes = {
        gang: 'GANG',
        neutral: 'NEUTRAL',
        state: 'STATE',
        police: 'POLICE',
        medical: 'MEDICAL',
        fire: 'FIRE',
        government: 'GOVERNMENT',
        dmv: 'DMV', // Department of Motor Vehicles or KFZ-Zulassungsstelle
        hospital: 'HOSPITAL',
        military: 'MILITARY',
        civilian: 'CIVILIAN',
        shop: 'SHOP',
        vehicledealer: 'VEHICLEDEALER',
        vehiclerent: 'VEHICLERENT',
        hairdresser: 'HAIRDRESSER',
        tattoostudio: 'TATTOOSTUDIO',
        restaurant: 'RESTAURANT',
        service: 'SERVICE',
        cinema: 'CINEMA',
        ammonation: 'AMMONATION',
        vehicletuning: 'VEHICLETUNING',
        repairshop: 'REPAIRSHOP',
        radiostation: 'RADIOSTATION',
        lifeinvader: 'LIFEINVADER',
        post: 'POST',
        disco: 'DISCO',
        bar: 'BAR',
        animalhome: 'ANIMALHOME',
        other: 'OTHER',
    };

    /**
     * Initialize Factions on Startup
     *
     * @static
     * @memberof FactionCore
     */
    static async init() {
        const factions = await Database.fetchAllData<Faction>(FACTION_COLLECTION);

        if (factions.length <= 0) {
            alt.logWarning(`No Factions have been Created`);
            return;
        }

        for (let i = 0; i < factions.length; i++) {
            InternalFunctions.create(factions[i]);
        }

        // Used to initialize internal functions for factions.
        // factionFuncs.init();
    }

    /**
     * Add a faction and return a _id if created successfully added.
     *
     * @static
     * @param {alt.Player} player
     * @param {FactionCore} _faction
     * @return {Promise<IGenericResponse>} _id
     * @memberof FactionHandler
     */
    static async add(owner: alt.Player, _faction: FactionCore): Promise<any> {
        if (!_faction.name) {
            alt.logWarning(`Cannot create faction, missing faction name.`);
            return { status: false, response: `Cannot create faction, missing faction name.` };
        }

        if (!this.factionTypes[_faction.type]) {
            alt.logWarning(
                'Cannot find faction-type ' + _faction.type + '! Type will be now ' + this.factionTypes.neutral,
            );
            _faction.type = this.factionTypes.neutral;
        } else {
            _faction.type = this.factionTypes[_faction.type];
        }

        if (_faction.bank === null || _faction.bank === undefined) {
            _faction.bank = 0;
        }

        const character = Athena.document.character.get(owner);
        if (character.faction) {
            return { status: false, response: `Character is already in a faction.` };
        }

        const defaultRanks = deepCloneObject<Array<FactionRank>>(DefaultRanks);
        for (let i = 0; i < defaultRanks.length; i++) {
            defaultRanks[i].uid = sha256Random(JSON.stringify(defaultRanks[i]));
        }

        const faction: Faction = {
            ..._faction,
            members: {
                [character._id]: {
                    id: character._id,
                    name: character.name,
                    rank: defaultRanks[0].uid,
                    hasOwnership: true,
                },
            },
            ranks: defaultRanks,
            vehicles: [],
            storages: [],
            actions: {},
            tickActions: [],
        };

        const existingFaction = await Database.fetchAllByField<Faction>(FACTION_COLLECTION, 'name', _faction.name);
        if (existingFaction.length > 0) {
            alt.logWarning(`Cannot create faction, name already exists.`);
            return { status: false, response: `Cannot create faction, name already exists.` };
        }

        const document = await Database.insertData<Faction>(faction, FACTION_COLLECTION, true);
        if (!document) {
            alt.logWarning(`Cannot insert faction into database.`);
            return { status: false, response: `Cannot insert faction into database.` };
        }

        Athena.document.character.set(owner, 'faction', document._id.toString());
        InternalFunctions.create(document);

        return { status: true, response: `Created Faction ${document.name}` };
    }

    /**
     * Deletes the faction forever
     * Remove all players from the faction
     * Remove all vehicles from the faction (deleted)
     * Remove all storages from the faction (deleted)
     * Faction Bank is sent to owner of faction
     *
     * @static
     * @param {string} _id
     * @memberof FactionCore
     */
    static async remove(_id: string): Promise<any> {
        // Find the faction...
        const faction = factions[_id];
        if (!faction) {
            return { status: false, response: `Faction was not found with id: ${_id}` };
        }

        // Remove the faction outright...
        const factionClone = deepCloneObject<Faction>(faction);
        delete factions[_id];

        // Fetch faction owner...
        const ownerIdentifier = await new Promise((resolve: Function) => {
            Object.keys(factionClone.members).forEach((key) => {
                if (!factionClone.members[key].hasOwnership) {
                    return;
                }

                return resolve(factionClone.members[key].id);
            });
        });

        // Clear all members...
        const members = await Database.fetchAllByField<Character>('faction', factionClone._id, Collections.Characters);
        let onlinePlayers: Array<alt.Player> = [];
        for (let i = 0; i < members.length; i++) {
            const member = members[i];
            member.faction = null;

            const xPlayer = alt.Player.all.find((p) => p && p.id === members[i]._id);
            const playerData = Athena.document.character.get(xPlayer);
            if (playerData && playerData.valid) {
                Athena.document.character.set(xPlayer, 'faction', null);

                // Add bank balance to owner character
                if (playerData._id === ownerIdentifier) {
                    Athena.document.character.set(xPlayer, 'bank', playerData.bank + factionClone.bank, true);
                    Athena.player.sync.currencyData(xPlayer);
                    Athena.player.emit.notification(xPlayer, `+$${factionClone.bank}`);
                }

                onlinePlayers.push(xPlayer);
            }

            // For non-logged in character owner add bank balance
            if (!xPlayer && member._id === ownerIdentifier) {
                member.bank += factionClone.bank;
                await Database.updatePartialData(
                    member._id.toString(),
                    { faction: null, bank: member.bank },
                    Collections.Characters,
                );
                continue;
            }

            // Remove faction from character
            await Database.updatePartialData(member._id.toString(), { faction: null }, Collections.Characters);
        }

        // Clear all vehicles...
        for (let i = 0; i < factionClone.vehicles.length; i++) {
            const vehicleId = factionClone.vehicles[i].id;
            const vehicle = alt.Vehicle.all.find((v) => v && v.valid && v && v.id.toString() === vehicleId);

            if (vehicle) {
                vehicle.destroy();
            }

            await Database.deleteById(vehicleId, Collections.Vehicles);
        }

        // Force close storage...
        for (let i = 0; i < onlinePlayers.length; i++) {
            if (!onlinePlayers[i] || !onlinePlayers[i].valid) {
                continue;
            }

            Athena.systems.storage.closeOnDisconnect(onlinePlayers[i], onlinePlayers[i].id.toString());
        }

        // Delete storage...
        if (factionClone.storages && Array.isArray(factionClone.storages)) {
            for (let i = 0; i < factionClone.storages.length; i++) {
                const storageId = factionClone.storages[i];
                Database.deleteById(storageId, Collections.Storage);
            }
        }

        return { status: true, response: `Deleted faction successfully` };
    }

    /**
     * Used to update faction data, and automatically propogate changes for
     * users with faction panel open.
     *
     * @static
     * @param {string} _id
     * @param {Partial<Faction>} partialObject
     * @return {Promise<IGenericResponse<string>>}
     * @memberof FactionCore
     */
    static async update(_id: string, partialObject: Partial<Faction>): Promise<any> {
        const faction = factions[_id];
        if (!faction) {
            return { status: false, response: `Faction was not found with id: ${_id}` };
        }

        Object.keys(faction).forEach((key) => {
            if (!partialObject[key]) {
                return;
            }

            faction[key] = partialObject[key];
        });

        await Database.updatePartialData(faction._id, partialObject, FACTION_COLLECTION);
        return { status: true, response: `Updated Faction Data` };
    }

    /**
     * Get faction data by identifier...
     *
     * @static
     * @param {string} _id
     * @return {Faction}
     * @memberof FactionCore
     */
    static get(_id: string): Faction {
        return factions[_id];
    }

    /**
     * Find a faction by name.
     *
     * @static
     * @param {string} nameOrPartialName
     * @return {*}  {(Faction | null)}
     * @memberof FactionCore
     */
    static find(nameOrPartialName: string): Faction | null {
        nameOrPartialName = nameOrPartialName.replace(/ /g, '').toLowerCase();

        const factionsList = Object.values(factions) as Array<Faction>;
        const index = factionsList.findIndex((f) => {
            const adjustedName = f.name.replace(/ /g, '').toLowerCase();
            if (adjustedName.includes(nameOrPartialName)) {
                return true;
            }

            return false;
        });

        if (index === -1) {
            return null;
        }

        return factionsList[index];
    }

    /**
     * Return an array of all factions
     *
     * @static
     * @return {*}
     * @memberof FactionCore
     */
    static getAllFactions() {
        return Object.values(factions) as Array<Faction>;
    }

    // /**
    //  * Get Faction from DB and update cache.
    //  * @param faction
    //  * @returns
    //  */
    // static async getFactionAndUpdateCache(faction): Promise<Faction> {
    //     const factionData = await Database.fetchAllByField<Faction>('_id', faction._id, FACTION_COLLECTION);
    //     if (!factionData) {
    //         return null;
    //     }

    //     factions[faction._id] = faction;

    //     return faction;
    // }

    static addUpdateSettingsInjection(callback: UpdateSettingsInjection) {
        UpdateSettingsInjections.push(callback);
    }

    /**
     * Reloads blips, markers, parking spots, etc.
     *
     * @static
     * @param {Faction} faction
     * @memberof FactionFuncs
     */
    static updateSettings(faction: Faction) {
        alt.logWarning('Faction updateSettings...');
        if (faction.settings && faction.settings.blip) {
            Athena.controllers.blip.append({
                uid: faction._id.toString(),
                color: faction.settings.blipColor,
                sprite: faction.settings.blip,
                pos: faction.settings.position,
                scale: 1,
                text: faction.name,
                shortRange: true,
            });

            Athena.controllers.interaction.append({
                description: faction.name,
                uid: faction._id.toString(),
                position: new alt.Vector3(
                    faction.settings.position.x,
                    faction.settings.position.y,
                    faction.settings.position.z - 0.5,
                ),
                data: [faction._id.toString()],
                callback: FactionHandler.openFactionMenu,
            });

            Athena.controllers.marker.append({
                uid: faction._id.toString(),
                pos: new alt.Vector3(
                    faction.settings.position.x,
                    faction.settings.position.y,
                    faction.settings.position.z,
                ),
                type: 31,
                color: new alt.RGBA(255, 255, 255, 100),
            });
        } else {
            Athena.controllers.blip.remove(faction._id.toString());
        }

        //Add parking spots
        // if (faction.settings && faction.settings.parkingSpots) {
        //     for (let i = 0; i < faction.settings.parkingSpots.length; i++) {
        //         let parkingSpot = faction.settings.parkingSpots[i];
        //         let parkingSpotID = `${faction._id.toString()}-parking-${i}`;
        //         let parkingSpotPos = new alt.Vector3(parkingSpot.pos.x, parkingSpot.pos.y, parkingSpot.pos.z - 1);
        //         Athena.controllers.interaction.append({
        //             description: `Use Faction Garage`,
        //             uid: parkingSpotID,
        //             position: parkingSpotPos,
        //             data: [parkingSpotID],
        //             isVehicleOnly: true,
        //             callback: FactionHandler.useParkingSpot,
        //         });

        //         Athena.controllers.marker..append({
        //             uid: parkingSpotID,
        //             pos: parkingSpotPos,
        //             type: 36,
        //             color: new alt.RGBA(255, 255, 255, 100),
        //         });
        //     }
        // }

        //Execute Update Settings Injections - faction plugins
        for (let i = 0; i < UpdateSettingsInjections.length; i++) {
            UpdateSettingsInjections[i](faction);
        }

        alt.logWarning('Faction updateSettings...end');
    }

    static async openFactionMenu(player: alt.Player, factionID: string): Promise<Boolean> {
        const playerData = Athena.document.character.get(player);
        if (!playerData.faction) {
            Athena.player.emit.message(player, 'You have no access to this faction');
            return false;
        }

        const faction = FactionHandler.get(playerData.faction);
        if (!faction) {
            Athena.player.emit.message(player, 'You have no access to this faction');
            return false;
        }

        if (faction._id.toString() !== factionID) {
            Athena.player.emit.message(player, 'You have no access to this faction');
            return false;
        }

        alt.emitClient(player, FACTION_EVENTS.PROTOCOL.OPEN, faction);
        return true;
    }
}
