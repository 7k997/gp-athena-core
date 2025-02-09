import { LOCALE_KEYS } from './keys.js';

export default {
    // Commands
    [LOCALE_KEYS.COMMAND_ADMIN_CHAT]: `_%_ [message] - Alloquere cum aliis administratoribus`,
    [LOCALE_KEYS.COMMAND_ACCEPT_DEATH]: `_%_ - Reviviscere in nosocomio post mortem`,
    [LOCALE_KEYS.COMMAND_ACTION_MENU]: `_%_ - Crea actionis indicem probatorum`,
    [LOCALE_KEYS.COMMAND_ADD_VEHICLE]: `_%_ [model] - Addere vehiculum lusori tuo`,
    [LOCALE_KEYS.COMMAND_ADD_WHITELIST]: `_%_ [discord] - Albus catalogus lusoris per Discord ID`,
    [LOCALE_KEYS.COMMAND_OOC]: `_%_ [message] - Loquere extra personam`,
    [LOCALE_KEYS.COMMAND_BROADCAST]: `_%_ [message] - Nuntia latissime diffunde`,
    [LOCALE_KEYS.COMMAND_COORDS]: `_%_ [x] [y] [z] - Teleportare ad coordinatas`,
    [LOCALE_KEYS.COMMAND_DO]: `_%_ [message] - Describe objectum, sonum, etc.`,
    [LOCALE_KEYS.COMMAND_DUMMY_ITEM]: `_%_ - Accipe res fictas pro depuratione`,
    [LOCALE_KEYS.COMMAND_GET_ITEM]: `_%_ [item-name] [amount] - Accipe rem/res per nomen database/nomen`,
    [LOCALE_KEYS.COMMAND_LOW]: `_%_ [message] - Blande loquere`,
    [LOCALE_KEYS.COMMAND_MOD_CHAT]: `_%_ [message] - Alloquere cum Administratoribus & Moderatoribus`,
    [LOCALE_KEYS.COMMAND_ME]: `_%_ [message] - Describe actionem roleplay`,
    [LOCALE_KEYS.COMMAND_NO_CLIP]: `_%_ - Modum No Clip commuta`,
    [LOCALE_KEYS.COMMAND_QUIT_JOB]: `_%_ - Desere Munus`,
    [LOCALE_KEYS.COMMAND_REMOVE_ALL_WEAPONS]: `_%_ - Aufer omnia arma`,
    [LOCALE_KEYS.COMMAND_REMOVE_WHITELIST]: `_%_ [discord] - Remove Discord ID ex albo catalogo`,
    [LOCALE_KEYS.COMMAND_REVIVE]: `_%_ [player_id]* - Revive te aut alios`,
    [LOCALE_KEYS.COMMAND_SEATBELT]: `_%_ - Indue cingulum sedis vel galeam`,
    [LOCALE_KEYS.COMMAND_SET_ARMOUR]: `_%_ [0-100][player_id]* - Constitue armaturam tibi vel aliis`,
    [LOCALE_KEYS.COMMAND_SET_CASH]: `_%_ [value] - Constitue pecuniam manu`,
    [LOCALE_KEYS.COMMAND_SET_FOOD]: `_%_ [0-100] - Constitue gradum famis`,
    [LOCALE_KEYS.COMMAND_SET_HEALTH]: `_%_ [99-199][player_id]* - Constitue salutem tibi vel aliis`,
    [LOCALE_KEYS.COMMAND_SET_WATER]: `_%_ [0-100] - Constitue gradum sitis`,
    [LOCALE_KEYS.COMMAND_SPAWN_VEHICLE]: `_%_ [index] - Genera vehiculum personale per indicem`,
    [LOCALE_KEYS.COMMAND_TELEPORTER]: `_%_ - Teleportare retro ad locum praesentem cum re`,
    [LOCALE_KEYS.COMMAND_TELEPORT_WAYPOINT]: `_%_ - Teleportare ad viam punctum. Primum crea viam punctum`,
    [LOCALE_KEYS.COMMAND_TOGGLE_VEH_LOCK]: `_%_ - Commuta claustrum vehiculi`,
    [LOCALE_KEYS.COMMAND_TOGGLE_VEH_DOOR]: `_%_ - [0-5] - Commuta ostium vehiculi`,
    [LOCALE_KEYS.COMMAND_GIVE_VEH_KEY]: `_%_ [id] - Da clavem vehiculi lusori`,
    [LOCALE_KEYS.COMMAND_TOGGLE_ENGINE]: `_%_ - Commuta machinam vehiculi`,
    [LOCALE_KEYS.COMMAND_VEHICLE]: `_%_ [model] - Genera vehiculum administratoris`,
    [LOCALE_KEYS.COMMAND_WANTED]: `_%_ [player_id] [stars] - Constitue gradum quaesiti lusori`,
    [LOCALE_KEYS.COMMAND_WHISPER]: `_%_ [player_id][message] - Susurra privatim lusori propinquo`,
    [LOCALE_KEYS.COMMAND_WEAPON]: `_%_ [name] - Accipe arma per nomen`,
    [LOCALE_KEYS.COMMAND_CLEAR_INVENTORY]: `_%_ - Purga Inventarium`,
    [LOCALE_KEYS.COMMAND_CLEAR_TOOLBAR]: `_%_ - Purga Toolbar`,
    [LOCALE_KEYS.COMMAND_CLEAR_EQUIPMENT]: `_%_ - Purga Apparatum`,
    [LOCALE_KEYS.COMMAND_NOT_PERMITTED_CHARACTER]: `Imperium non licet pro persona tua.`,
    [LOCALE_KEYS.COMMAND_NOT_PERMITTED_ADMIN]: `Imperium non licet pro ratione tua.`,
    [LOCALE_KEYS.COMMAND_NOT_VALID]: `_%_ non est imperium validum.`,
    [LOCALE_KEYS.COMMAND_SET_WEATHER]: `_%_ [weather name] - Praeteri omnes tempestates regionis`,
    [LOCALE_KEYS.COMMAND_CLEAR_WEATHER]: `_%_ - Extingue praepotentiam tempestatis`,
    [LOCALE_KEYS.COMMAND_SET_TIME]: `_%_ [hour] - Praeteri tempus ad hanc horam`,
    [LOCALE_KEYS.COMMAND_CLEAR_TIME]: `_%_ - Extingue praepotentiam temporis`,
    [LOCALE_KEYS.COMMAND_REFILL_VEHICLE]: `_%_ - Reple vehiculum combustibili per potestatem administrativam`,
    [LOCALE_KEYS.COMMAND_REPAIR_VEHICLE]: `_%_ - Repara vehiculum per potestatem administrativam`,
    [LOCALE_KEYS.COMMAND_TEMP_VEHICLE]: `_%_ [model] - Genera vehiculum temporarium`,
    [LOCALE_KEYS.COMMAND_SET_VEHICLE_HANDLING]: `_%_ [value] - Constitue tractationem vehiculi`,
    [LOCALE_KEYS.COMMAND_SET_VEHICLE_LIVERY]: `_%_ [nummer] - Constitue livream vehiculi`,
    [LOCALE_KEYS.COMMAND_SESSION_VEHICLE]: `_%_ [model] - Genera vehiculum sessionis`,
    [LOCALE_KEYS.COMMAND_TOGGLE_VEH_NEON_LIGHTS]: `_%_ - Commuta lucis neon vehiculi`,
    [LOCALE_KEYS.COMMAND_SET_VEH_NEON_LIGHTS]: `_%_ [<] [>] [ᐱ] [V] - Constitue lucis neon vehiculi`,
    [LOCALE_KEYS.COMMAND_FULL_TUNE_VEHICLE]: `_%_ - Plene concinna vehiculum`,
    [LOCALE_KEYS.COMMAND_ADD_VEHICLE_KEY]: `_%_ - Addere clavem vehiculo`,
    [LOCALE_KEYS.COMMAND_SET_VEH_DIRT_LEVEL]: `_%_ [level] - Constitue gradum sordium vehiculi`,
    // Cannot
    [LOCALE_KEYS.CANNOT_CHAT_WHILE_DEAD]: `Non potest alloqui mortuus.`,
    [LOCALE_KEYS.CANNOT_FIND_PLAYER]: `Lusor non invenitur.`,
    [LOCALE_KEYS.CANNOT_PERFORM_WHILE_DEAD]: `Imperium hoc mortuus exsequi non potes.`,
    [LOCALE_KEYS.CANNOT_FIND_PERSONAL_VEHICLES]: `Vehicula personalia non inveniuntur.`,
    [LOCALE_KEYS.CANNOT_FIND_THAT_PERSONAL_VEHICLE]: 'Vehiculum personale non invenitur.',
    // Clothing
    [LOCALE_KEYS.CLOTHING_ITEM_IN_INVENTORY]: `Vestimentum in armario missum est.`,
    // Discord
    [LOCALE_KEYS.DISCORD_ID_NOT_LONG_ENOUGH]: `Discord ID saltem 18 characteres longum esse debet.`,
    [LOCALE_KEYS.DISCORD_ALREADY_WHITELISTED]: `_%_ iam in albo catalogo est.`,
    [LOCALE_KEYS.DISCORD_NOT_WHITELISTED]: `_%_ non est in albo catalogo.`,
    [LOCALE_KEYS.DISCORD_ADDED_WHITELIST]: `_%_ albo catalogo additus est.`,
    [LOCALE_KEYS.DISCORD_REMOVED_WHITELIST]: `_%_ ex albo catalogo removetus est.`,
    // FUEL
    [LOCALE_KEYS.FUEL_EXIT_VEHICLE_FIRST]: `Exire vehiculum debes ante quam reficis.`,
    [LOCALE_KEYS.FUEL_UPDATE_VEHICLE_FIRST]: `Intrare et exire vehiculum debes primo ad reficiendum.`,
    [LOCALE_KEYS.FUEL_VEHICLE_NOT_CLOSE]: `Vehiculum non satis prope ad reficiendum est.`,
    [LOCALE_KEYS.FUEL_ALREADY_FULL]: `Vehiculum iam plenum combustibili est.`,
    [LOCALE_KEYS.FUEL_TOO_FAR_FROM_PUMP]: `Pump longe a vehiculo est.`,
    [LOCALE_KEYS.FUEL_HAS_UNLIMITED]: `Vehiculum habet combustibile infinitum. Non necesse est reficere.`,
    [LOCALE_KEYS.FUEL_CANNOT_AFFORD]: `Combustibile emere non potes.`,
    [LOCALE_KEYS.FUEL_PAYMENT]: `Solvis $_%_ pro _%_ unitatibus combustibilis. Cursum hunc iterum curre ad reficiendum cancellandum.`,
    [LOCALE_KEYS.FUEL_PAID]: `Solvis $_%_ pro _%_ unitatibus combustibilis.`,
    // House
    [LOCALE_KEYS.INTERIOR_INTERACT]: `Interage cum Domo`,
    //Translations related to interiors
    [LOCALE_KEYS.INTERIOR_TOO_FAR_FROM_ENTRANCE]: `Longe ab introitu.`,
    [LOCALE_KEYS.INTERIOR_TOO_FAR_FROM_EXIT]: `Longe ab exitu.`,
    [LOCALE_KEYS.INTERIOR_NOT_ENOUGH_CURRENCY]: `Nummus non satis est`,
    [LOCALE_KEYS.INTERIOR_DOOR_LOCKED]: `Ostium clausum est`,
    [LOCALE_KEYS.INTERIOR_PURCHASED]: `Proprietas empta cum id _%_ pro $_%_.`,
    [LOCALE_KEYS.INTERIOR_SOLD]: `Proprietas vendita cum id _%_ pro $_%_.`,
    [LOCALE_KEYS.INTERIOR_NO_STORAGE]: `Interior repono non habet.`,
    // Invalid
    [LOCALE_KEYS.INVALID_VEHICLE_MODEL]: `Modello vehiculi non vehiculum est.`,
    // Interaction
    [LOCALE_KEYS.INTERACTION_TOO_FAR_AWAY]: `Longe es ad interagendum. Prope move.`,
    [LOCALE_KEYS.INTERACTION_INVALID_OBJECT]: `Hoc objectum interactionem non habet.`,
    [LOCALE_KEYS.INTERACTION_INTERACT_WITH_OBJECT]: `Interage cum Objecto`,
    [LOCALE_KEYS.INTERACTION_INTERACT_VEHICLE]: `Interage cum Vehiculo`,
    [LOCALE_KEYS.INTERACTION_VIEW_OPTIONS]: `Optiones Visum`,
    // Item
    [LOCALE_KEYS.ITEM_ARGUMENTS_MISSING]: `Argumenta desunt.`,
    [LOCALE_KEYS.ITEM_NOT_EQUIPPED]: `Nullum rei in illo loco armatur.`,
    [LOCALE_KEYS.ITEM_DOES_NOT_EXIST]: `_%_ non existit.`,
    [LOCALE_KEYS.ITEM_WAS_ADDED_INVENTORY]: `_%_ armario additus est.`,
    [LOCALE_KEYS.ITEM_WAS_ADDED_EQUIPMENT]: `_%_ apparatui additus est.`,
    [LOCALE_KEYS.ITEM_WAS_ADDED_TOOLBAR]: `_%_ toolbar additus est.`,
    [LOCALE_KEYS.ITEM_WAS_DESTROYED_ON_DROP]: `_%_ delendus est cum deponitur.`,
    // Job
    [LOCALE_KEYS.JOB_ALREADY_WORKING]: `Iam in opere laboras.`,
    [LOCALE_KEYS.JOB_NOT_WORKING]: `Nunc non laboras.`,
    [LOCALE_KEYS.JOB_QUIT]: `Munus tuum reliquisti.`,
    // Labels
    [LOCALE_KEYS.LABEL_ON]: `Inclusus`,
    [LOCALE_KEYS.LABEL_OFF]: `Exclusus`,
    [LOCALE_KEYS.LABEL_BROADCAST]: `Diffusio`,
    [LOCALE_KEYS.LABEL_ENGINE]: `Machina`,
    [LOCALE_KEYS.LABEL_HOSPITAL]: `Nosocomium`,
    [LOCALE_KEYS.LABEL_BANNED]: `[Prohibitus]`,
    // Player
    [LOCALE_KEYS.PLAYER_IS_TOO_FAR]: `Lusor longe abest.`,
    [LOCALE_KEYS.PLAYER_IS_TOO_CLOSE]: `Lusor nimis prope est.`,
    [LOCALE_KEYS.PLAYER_IS_NOT_DEAD]: `Lusor non mortuus est.`,
    [LOCALE_KEYS.PLAYER_ARMOUR_SET_TO]: `Lorica tua constituta est ad: _%_`,
    [LOCALE_KEYS.PLAYER_HEALTH_SET_TO]: `Salus tua constituta est ad: _%_`,
    [LOCALE_KEYS.PLAYER_SEATBELT_ON]: `Cingulum sedis induisti.`,
    [LOCALE_KEYS.PLAYER_SEATBELT_OFF]: `Cingulum sedis exuisti.`,
    [LOCALE_KEYS.PLAYER_RECEIVED_BLANK]: `_%_ accepisti ex _%_`,
    // Use
    [LOCALE_KEYS.USE_FUEL_PUMP]: 'Utere Suctu Combustibilis',
    [LOCALE_KEYS.USE_ATM]: 'Utere ATM',
    [LOCALE_KEYS.USE_VENDING_MACHINE]: 'Utere Machina Venditionis',
    [LOCALE_KEYS.USE_CLOTHING_STORE]: 'Veste Prospice',
    // Weapon
    [LOCALE_KEYS.WEAPON_NO_HASH]: `Arma signum non habet.`,
    // Vehicle
    [LOCALE_KEYS.VEHICLE_NO_FUEL]: `Vehiculum combustibile non habet.`,
    [LOCALE_KEYS.VEHICLE_LOCK_SET_TO]: `Seratio vehiculi constituta est ad: _%_`,
    [LOCALE_KEYS.VEHICLE_TOGGLE_LOCK]: `Seratio Commuta`,
    [LOCALE_KEYS.VEHICLE_TOGGLE_ENGINE]: `Machinam Commuta`,
    [LOCALE_KEYS.VEHICLE_IS_LOCKED]: `Vehiculum proximum clausum est.`,
    [LOCALE_KEYS.VEHICLE_ENTER_VEHICLE]: `Ingredere / Exi Vehiculum`,
    [LOCALE_KEYS.VEHICLE_TOO_FAR]: `Vehiculum longe abest.`,
    [LOCALE_KEYS.VEHICLE_NO_VEHICLES_IN_GARAGE]: `Nulla vehicula in cochleario sunt.`,
    [LOCALE_KEYS.VEHICLE_NO_PARKING_SPOTS]: `Nulla stativa in cochleario sunt.`,
    [LOCALE_KEYS.VEHICLE_ALREADY_SPAWNED]: `Vehiculum iam generatum est.`,
    [LOCALE_KEYS.VEHICLE_COUNT_EXCEEDED]: `_Tantum %_ vehicula uno tempore generari possunt. Numerum vehiculorum generandorum superasti.`,
    [LOCALE_KEYS.VEHICLE_LOCKED]: `Clausum`,
    [LOCALE_KEYS.VEHICLE_UNLOCKED]: `Apertum`,
    [LOCALE_KEYS.VEHICLE_FUEL]: `Combustibile`,
    [LOCALE_KEYS.VEHICLE_NO_KEYS]: `Claves huius vehiculi non habes.`,
    [LOCALE_KEYS.VEHICLE_NO_STORAGE]: `Hoc vehiculum repono non habet.`,
    [LOCALE_KEYS.VEHICLE_NO_TRUNK_ACCESS]: `Accessum ad arcum non habes.`,
    [LOCALE_KEYS.VEHICLE_NOT_UNLOCKED]: `Vehiculum nunc non apertum est.`,
    [LOCALE_KEYS.VEHICLE_NO_OPEN_SEAT]: `Sedes aperta non invenitur.`,
    [LOCALE_KEYS.VEHICLE_REFUEL_INCOMPLETE]: `Vehiculum Reficere Non Completum`,
    [LOCALE_KEYS.VEHICLE_NO_LONGER_NEAR_VEHICLE]: `Iam non prope hoc vehiculum es.`,
    [LOCALE_KEYS.VEHICLE_NOT_RIGHT_SIDE_UP]: `Vehiculum non recte supinum est.`,
    [LOCALE_KEYS.VEHICLE_IS_ALREADY_BEING_PUSHED]: `Vehiculum iam impellitur.`,
    [LOCALE_KEYS.VEHICLE_STORAGE_VIEW_NAME]: `Vehiculum - _%_ - Repono`,
    [LOCALE_KEYS.VEHICLE_KEY_NAME]: `Clavis ad _%_`,
    [LOCALE_KEYS.VEHICLE_KEY_DESCRIPTION]: `Clavis ad exemplar vehiculi _%_`,
    [LOCALE_KEYS.VEHICLE_MODEL_INVALID]: `Exemplar vehiculi invalidum.`,
    [LOCALE_KEYS.VEHICLE_CREATED]: `Vehiculum Creatum.`,
    [LOCALE_KEYS.VEHICLE_REFILLED]: `Vehiculum repletum.`,
    [LOCALE_KEYS.VEHICLE_REPAIRED]: `Vehiculum feliciter reparatum.`,
    [LOCALE_KEYS.VEHICLE_HAS_NO_MOD_KIT]: `Vehiculum modum kit non habet.`,
    [LOCALE_KEYS.VEHICLE_NOT_OWN_BY_YOU]: `In vehiculo esse debes quod possides.`,
    [LOCALE_KEYS.VEHICLE_KEY_GIVEN_TO]: `Vehiculi Clavis Data`,
    // Faction
    [LOCALE_KEYS.FACTION_PLAYER_IS_ALREADY_IN_FACTION]: `_%_ iam in factione est vel non existit.`,
    [LOCALE_KEYS.FACTION_CANNOT_CHANGE_OWNERSHIP]: `Dominium factionis mutare non potes.`,
    [LOCALE_KEYS.FACTION_STORAGE_NOT_ACCESSIBLE]: `Repono Non Accessibilis`,
    [LOCALE_KEYS.FACTION_STORAGE_NO_ACCESS]: `Ad hoc accessum non habes.`,
    [LOCALE_KEYS.FACTION_ONLY_OWNER_IS_ALLOWED]: `Tantum dominus permissiones ordinis adiungere potest vel vexillum super administrum.`,
    [LOCALE_KEYS.FACTION_UNABLE_TO_DISBAND]: `Factionem dissolvere non potes.`,
    [LOCALE_KEYS.FACTION_NAME_DOESNT_MATCH]: `Nomen factionis traditum cum vero factionis nomine non congruit.`,
    [LOCALE_KEYS.FACTION_NOT_THE_OWNER]: `Non es dominus huius factionis.`,
    [LOCALE_KEYS.FACTION_COULD_NOT_FIND]: `Factionem tuam invenire non potui.`,
    [LOCALE_KEYS.FACTION_DISABNDED]: `Faction dissoluta.`,
    [LOCALE_KEYS.FACTION_BANK_COULD_NOT_WITHDRAW]: `Extrahere $_%_ non potui.`,
    [LOCALE_KEYS.FACTION_BANK_COULD_NOT_DEPOSIT]: `Deposere $_%_ non potui`,
    [LOCALE_KEYS.FACTION_BANK_WITHDREW]: `Extraxit $_%_`,
    [LOCALE_KEYS.FACTION_PLAYER_QUITTED]: `_%_ factionem reliquit.`,
    [LOCALE_KEYS.FACTION_COULDNT_QUIT]: `Factionem relinquere non potes quia dux es.`,
    // World
    [LOCALE_KEYS.WORLD_TIME_IS]: `Tempus Mundi Nunc Est _%_:_%_`,
    // Storage
    [LOCALE_KEYS.STORAGE_NOT_AVAILABLE]: `Repono Non Praesto`,
    [LOCALE_KEYS.STORAGE_IN_USE]: `Repono In Usu`,
    [LOCALE_KEYS.INVENTORY_IS_FULL]: `Armarius Plenus Est`,
    // No Clip
    [LOCALE_KEYS.NOCLIP_SPEED_INFO]: `Sinistra Maiuscula (Celeritas Cursus) | Volumen (Mutare Celeritatem Cursus)`,
    [LOCALE_KEYS.NOCLIP_SPEED]: `Celeritas`,
    // WebView Locales
    [LOCALE_KEYS.WEBVIEW_JOB]: {
        LABEL_DECLINE: 'Recusa',
        LABEL_ACCEPT: 'Accipe',
    },
    [LOCALE_KEYS.WEBVIEW_STORAGE]: {
        LABEL_SPLIT_TEXT: 'Movere acervum huius quantitatis?',
    },
    [LOCALE_KEYS.WEBVIEW_INVENTORY]: {
        ITEM_SLOTS: [
            'Pileus',
            'Persona',
            'Tunica',
            'Bracae',
            'Pedes',
            'Oculi Vitrea',
            'Aures',
            'Saccus',
            'Armatura',
            'Horologia',
            'Armilla',
            'Accessorium',
        ],
        LABEL_SPLIT: 'divide',
        LABEL_CANCEL: 'cancella',
        LABEL_DROP_ITEM: 'Item Deponere',
        LABEL_WEIGHT: 'Pondus',
        LABEL_SPLIT_TEXT: 'Facere acervum huius quantitatis?',
    },
};
