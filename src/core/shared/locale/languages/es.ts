import { LOCALE_KEYS } from './keys.js';

/**
 * Locales are written with a key and value type.
 * When you get the key of 'greet-user' from the LocaleController
 * It will return a string of 'Hello someVariableYouPass, welcome to the server.'
 * It's a simple way to create locales without hurting performance too much.
 */
export default {
    // Commands
    [LOCALE_KEYS.COMMAND_ADMIN_CHAT]: `_%_ [message] - Hablar con otros administradores`,
    [LOCALE_KEYS.COMMAND_ACCEPT_DEATH]: `_%_ - Respawn en el hospital tras morir`,
    [LOCALE_KEYS.COMMAND_ACTION_MENU]: `_%_ - Crear un menú de acción de prueba`,
    [LOCALE_KEYS.COMMAND_ADD_VEHICLE]: `_%_ [model] - Añadir un vehículo a tu jugador`,
    [LOCALE_KEYS.COMMAND_ADD_WHITELIST]: `_%_ [discord] - Añadir un jugador a la lista blanca por ID de Discord`,
    [LOCALE_KEYS.COMMAND_OOC]: `_%_ [message] - Hablar fuera de personaje`,
    [LOCALE_KEYS.COMMAND_BROADCAST]: `_%_ [message] - Anunciar mensaje a todo el servidor`,
    [LOCALE_KEYS.COMMAND_COORDS]: `_%_ [x] [y] [z] - Teletransportar a unas coordenadas`,
    [LOCALE_KEYS.COMMAND_DO]: `_%_ [message] - Describir un objeto, sonido, etc.`,
    [LOCALE_KEYS.COMMAND_DUMMY_ITEM]: `_%_ - Obtener algunos objetos de depuración`,
    [LOCALE_KEYS.COMMAND_GET_ITEM]: `_%_ [item-name] [amount] - Obtener objeto/s por dbname/nombre`,
    [LOCALE_KEYS.COMMAND_LOW]: `_%_ [message] - Hablar en voz baja`,
    [LOCALE_KEYS.COMMAND_MOD_CHAT]: `_%_ [message] - Hablar con Administradores & Mods`,
    [LOCALE_KEYS.COMMAND_ME]: `_%_ [message] - Describir una acción de rol`,
    [LOCALE_KEYS.COMMAND_NO_CLIP]: `_%_ - Alternar modo No Clip`,
    [LOCALE_KEYS.COMMAND_QUIT_JOB]: `_%_ - Dejar un trabajo`,
    [LOCALE_KEYS.COMMAND_REMOVE_ALL_WEAPONS]: `_%_ - Eliminar todas las armas`,
    [LOCALE_KEYS.COMMAND_REMOVE_WHITELIST]: `_%_ [discord] - Eliminar ID de Discord de la lista blanca`,
    [LOCALE_KEYS.COMMAND_REVIVE]: `_%_ [player_id]* - Revivir a uno mismo u otros`,
    [LOCALE_KEYS.COMMAND_SEATBELT]: `_%_ - Ponerse el cinturón de seguridad o el casco`,
    [LOCALE_KEYS.COMMAND_SET_ARMOUR]: `_%_ [0-100][player_id]* - Establecer armadura para uno mismo u otros`,
    [LOCALE_KEYS.COMMAND_SET_CASH]: `_%_ [value] - Establecer tu efectivo en mano`,
    [LOCALE_KEYS.COMMAND_SET_FOOD]: `_%_ [0-100] - Establecer tu nivel de hambre`,
    [LOCALE_KEYS.COMMAND_SET_HEALTH]: `_%_ [99-199][player_id]* - Establecer salud para uno mismo u otros`,
    [LOCALE_KEYS.COMMAND_SET_WATER]: `_%_ [0-100] - Establecer tu nivel de sed`,
    [LOCALE_KEYS.COMMAND_SPAWN_VEHICLE]: `_%_ [index] - Hacer aparecer vehículo personal por índice`,
    [LOCALE_KEYS.COMMAND_TELEPORTER]: `_%_ - Teletransportar de regreso a tu ubicación actual con un objeto`,
    [LOCALE_KEYS.COMMAND_TELEPORT_WAYPOINT]: `_%_ - Teletransportar a un punto de ruta. Crea el punto de ruta primero`,
    [LOCALE_KEYS.COMMAND_TOGGLE_VEH_LOCK]: `_%_ - Alternar el bloqueo del vehículo`,
    [LOCALE_KEYS.COMMAND_TOGGLE_VEH_DOOR]: `_%_ - [0-5] - Alternar una puerta del vehículo`,
    [LOCALE_KEYS.COMMAND_GIVE_VEH_KEY]: `_%_ [id] - Dar llave del vehículo a un jugador`,
    [LOCALE_KEYS.COMMAND_TOGGLE_ENGINE]: `_%_ - Alternar el motor del vehículo`,
    [LOCALE_KEYS.COMMAND_VEHICLE]: `_%_ [model] - Hacer aparecer un vehículo de administrador`,
    [LOCALE_KEYS.COMMAND_WANTED]: `_%_ [player_id] [stars] - Establecer nivel de búsqueda de un jugador`,
    [LOCALE_KEYS.COMMAND_WHISPER]: `_%_ [player_id][message] - Susurrar privadamente a un jugador cercano`,
    [LOCALE_KEYS.COMMAND_WEAPON]: `_%_ [name] - Obtener un arma por nombre`,
    [LOCALE_KEYS.COMMAND_CLEAR_INVENTORY]: `_%_ - Limpiar tu Inventario`,
    [LOCALE_KEYS.COMMAND_CLEAR_TOOLBAR]: `_%_ - Limpiar tu barra de herramientas`,
    [LOCALE_KEYS.COMMAND_CLEAR_EQUIPMENT]: `_%_ - Limpiar tu equipo`,
    [LOCALE_KEYS.COMMAND_NOT_PERMITTED_CHARACTER]: `Comando no permitido para tu personaje.`,
    [LOCALE_KEYS.COMMAND_NOT_PERMITTED_ADMIN]: `Comando no permitido para tu cuenta.`,
    [LOCALE_KEYS.COMMAND_NOT_VALID]: `_%_ no es un comando válido.`,
    [LOCALE_KEYS.COMMAND_SET_WEATHER]: `_%_ [weather name] - Anular todos los climas regionales`,
    [LOCALE_KEYS.COMMAND_CLEAR_WEATHER]: `_%_ - Desactivar la anulación del clima`,
    [LOCALE_KEYS.COMMAND_SET_TIME]: `_%_ [hour] - Anular la hora a esta hora`,
    [LOCALE_KEYS.COMMAND_CLEAR_TIME]: `_%_ - Borrar la anulación de la hora`,
    [LOCALE_KEYS.COMMAND_REFILL_VEHICLE]: `_%_ - Rellenar combustible de un vehículo por poder administrativo`,
    [LOCALE_KEYS.COMMAND_REPAIR_VEHICLE]: `_%_ - Reparar un vehículo por poder administrativo`,
    [LOCALE_KEYS.COMMAND_TEMP_VEHICLE]: `_%_ [model] - Hacer aparecer un vehículo temporal`,
    [LOCALE_KEYS.COMMAND_SET_VEHICLE_HANDLING]: `_%_ [value] - Establecer el manejo del vehículo`,
    [LOCALE_KEYS.COMMAND_SET_VEHICLE_LIVERY]: `_%_ [nummer] - Establecer la librea del vehículo`,
    [LOCALE_KEYS.COMMAND_SESSION_VEHICLE]: `_%_ [model] - Hacer aparecer un vehículo de sesión`,
    [LOCALE_KEYS.COMMAND_TOGGLE_VEH_NEON_LIGHTS]: `_%_ - Alternar las luces de neón del vehículo`,
    [LOCALE_KEYS.COMMAND_SET_VEH_NEON_LIGHTS]: `_%_ [<] [>] [ᐱ] [V] - Establecer las luces de neón del vehículo`,
    [LOCALE_KEYS.COMMAND_FULL_TUNE_VEHICLE]: `_%_ - Ajuste completo de un vehículo`,
    [LOCALE_KEYS.COMMAND_ADD_VEHICLE_KEY]: `_%_ - Añadir una llave para un vehículo`,
    [LOCALE_KEYS.COMMAND_SET_VEH_DIRT_LEVEL]: `_%_ [level] - Establecer el nivel de suciedad del vehículo`,
    // Cannot
    [LOCALE_KEYS.CANNOT_CHAT_WHILE_DEAD]: `No se puede chatear estando muerto.`,
    [LOCALE_KEYS.CANNOT_FIND_PLAYER]: `No se pudo encontrar ese jugador.`,
    [LOCALE_KEYS.CANNOT_PERFORM_WHILE_DEAD]: `No se puede realizar este comando estando muerto.`,
    [LOCALE_KEYS.CANNOT_FIND_PERSONAL_VEHICLES]: `No se pueden encontrar vehículos personales.`,
    [LOCALE_KEYS.CANNOT_FIND_THAT_PERSONAL_VEHICLE]: `No se puede localizar ese vehículo personal.`,
    // Clothing
    [LOCALE_KEYS.CLOTHING_ITEM_IN_INVENTORY]: `Un artículo de ropa fue enviado a tu inventario.`,
    // Discord
    [LOCALE_KEYS.DISCORD_ID_NOT_LONG_ENOUGH]: `El ID de Discord debe tener al menos 18 caracteres.`,
    [LOCALE_KEYS.DISCORD_ALREADY_WHITELISTED]: `_%_ ya está en la lista blanca.`,
    [LOCALE_KEYS.DISCORD_NOT_WHITELISTED]: `_%_ no está en la lista blanca.`,
    [LOCALE_KEYS.DISCORD_ADDED_WHITELIST]: `_%_ fue añadido a la lista blanca.`,
    [LOCALE_KEYS.DISCORD_REMOVED_WHITELIST]: `_%_ fue eliminado de la lista blanca.`,
    // FUEL
    [LOCALE_KEYS.FUEL_EXIT_VEHICLE_FIRST]: `Debes salir de tu vehículo antes de repostar.`,
    [LOCALE_KEYS.FUEL_UPDATE_VEHICLE_FIRST]: `Debes entrar y salir de un vehículo primero para repostar.`,
    [LOCALE_KEYS.FUEL_VEHICLE_NOT_CLOSE]: `El vehículo no está lo suficientemente cerca para repostar.`,
    [LOCALE_KEYS.FUEL_ALREADY_FULL]: `El vehículo ya tiene suficiente combustible.`,
    [LOCALE_KEYS.FUEL_TOO_FAR_FROM_PUMP]: `La bomba está demasiado lejos del vehículo.`,
    [LOCALE_KEYS.FUEL_HAS_UNLIMITED]: `El vehículo tiene combustible ilimitado. No es necesario repostar.`,
    [LOCALE_KEYS.FUEL_CANNOT_AFFORD]: `No puedes permitirte comprar combustible.`,
    [LOCALE_KEYS.FUEL_PAYMENT]: `Pagarás $_%_ por _%_ unidades de combustible. Ejecuta este menú de nuevo para cancelar el repostaje.`,
    [LOCALE_KEYS.FUEL_PAID]: `Has pagado $_%_ por _%_ unidades de combustible.`,
    // House
    [LOCALE_KEYS.INTERIOR_INTERACT]: `Interactuar con Casa`,
    //Translations related to interiors
    [LOCALE_KEYS.INTERIOR_TOO_FAR_FROM_ENTRANCE]: `Demasiado lejos de la entrada.`,
    [LOCALE_KEYS.INTERIOR_TOO_FAR_FROM_EXIT]: `Demasiado lejos de la salida.`,
    [LOCALE_KEYS.INTERIOR_NOT_ENOUGH_CURRENCY]: `No hay suficiente moneda`,
    [LOCALE_KEYS.INTERIOR_DOOR_LOCKED]: `La puerta está cerrada con llave`,
    [LOCALE_KEYS.INTERIOR_PURCHASED]: `Propiedad comprada con id _%_ por $_%_.`,
    [LOCALE_KEYS.INTERIOR_SOLD]: `Propiedad vendida con id _%_ por $_%_.`,
    [LOCALE_KEYS.INTERIOR_NO_STORAGE]: `El interior no tiene almacenamiento.`,
    // Invalid
    [LOCALE_KEYS.INVALID_VEHICLE_MODEL]: `El modelo del vehículo no es válido.`,
    // Interaction
    [LOCALE_KEYS.INTERACTION_TOO_FAR_AWAY]: `Estás demasiado lejos para interactuar. Acércate.`,
    [LOCALE_KEYS.INTERACTION_INVALID_OBJECT]: `Este objeto no tiene interacción.`,
    [LOCALE_KEYS.INTERACTION_INTERACT_WITH_OBJECT]: `Interactuar con Objeto`,
    [LOCALE_KEYS.INTERACTION_INTERACT_VEHICLE]: `Interactuar con Vehículo`,
    [LOCALE_KEYS.INTERACTION_VIEW_OPTIONS]: `Ver Opciones`,
    // Item
    [LOCALE_KEYS.ITEM_ARGUMENTS_MISSING]: `Faltan argumentos.`,
    [LOCALE_KEYS.ITEM_NOT_EQUIPPED]: `No hay un objeto equipado en ese slot.`,
    [LOCALE_KEYS.ITEM_DOES_NOT_EXIST]: `_%_ no existe.`,
    [LOCALE_KEYS.ITEM_WAS_ADDED_INVENTORY]: `_%_ fue añadido a tu inventario.`,
    [LOCALE_KEYS.ITEM_WAS_ADDED_EQUIPMENT]: `_%_ fue añadido a tu equipo.`,
    [LOCALE_KEYS.ITEM_WAS_ADDED_TOOLBAR]: `_%_ fue añadido a tu barra de herramientas.`,
    [LOCALE_KEYS.ITEM_WAS_DESTROYED_ON_DROP]: `_%_ fue destruido al soltar.`,
    // Job
    [LOCALE_KEYS.JOB_ALREADY_WORKING]: `Ya estás trabajando en un trabajo.`,
    [LOCALE_KEYS.JOB_NOT_WORKING]: `Actualmente no estás trabajando.`,
    [LOCALE_KEYS.JOB_QUIT]: `Has dejado tu trabajo actual.`,
    // Labels
    [LOCALE_KEYS.LABEL_ON]: `ENCENDIDO`,
    [LOCALE_KEYS.LABEL_OFF]: `APAGADO`,
    [LOCALE_KEYS.LABEL_BROADCAST]: `Transmisión`,
    [LOCALE_KEYS.LABEL_ENGINE]: `Motor`,
    [LOCALE_KEYS.LABEL_HOSPITAL]: `Hospital`,
    [LOCALE_KEYS.LABEL_BANNED]: `[Prohibido]`,
    // Player
    [LOCALE_KEYS.PLAYER_IS_TOO_FAR]: `Ese jugador está demasiado lejos.`,
    [LOCALE_KEYS.PLAYER_IS_TOO_CLOSE]: `Ese jugador está demasiado cerca.`,
    [LOCALE_KEYS.PLAYER_IS_NOT_DEAD]: `Ese jugador no está muerto.`,
    [LOCALE_KEYS.PLAYER_ARMOUR_SET_TO]: `Tu armadura se ha establecido en: _%_`,
    [LOCALE_KEYS.PLAYER_HEALTH_SET_TO]: `Tu salud se ha establecido en: _%_`,
    [LOCALE_KEYS.PLAYER_SEATBELT_ON]: `Te has puesto el cinturón de seguridad.`,
    [LOCALE_KEYS.PLAYER_SEATBELT_OFF]: `Te has quitado el cinturón de seguridad.`,
    [LOCALE_KEYS.PLAYER_RECEIVED_BLANK]: `Has recibido _%_ de _%_`,
    // Use
    [LOCALE_KEYS.USE_FUEL_PUMP]: 'Usar Bomba de Combustible',
    [LOCALE_KEYS.USE_ATM]: 'Usar Cajero Automático',
    [LOCALE_KEYS.USE_VENDING_MACHINE]: 'Usar Máquina Expendedora',
    [LOCALE_KEYS.USE_CLOTHING_STORE]: 'Explorar Ropa',
    // Weapon
    [LOCALE_KEYS.WEAPON_NO_HASH]: `El arma no tiene hash.`,
    // Vehicle
    [LOCALE_KEYS.VEHICLE_NO_FUEL]: `El vehículo no tiene combustible.`,
    [LOCALE_KEYS.VEHICLE_LOCK_SET_TO]: `El bloqueo del vehículo se ha establecido en: _%_`,
    [LOCALE_KEYS.VEHICLE_TOGGLE_LOCK]: `Alternar Bloqueo`,
    [LOCALE_KEYS.VEHICLE_TOGGLE_ENGINE]: `Alternar Motor`,
    [LOCALE_KEYS.VEHICLE_IS_LOCKED]: `El vehículo más cercano está bloqueado.`,
    [LOCALE_KEYS.VEHICLE_ENTER_VEHICLE]: `Entrar/Salir del Vehículo`,
    [LOCALE_KEYS.VEHICLE_TOO_FAR]: `El vehículo está demasiado lejos.`,
    [LOCALE_KEYS.VEHICLE_NO_VEHICLES_IN_GARAGE]: `No hay vehículos en este garaje.`,
    [LOCALE_KEYS.VEHICLE_NO_PARKING_SPOTS]: `No hay plazas de aparcamiento en este garaje.`,
    [LOCALE_KEYS.VEHICLE_ALREADY_SPAWNED]: `Ese vehículo ya ha aparecido.`,
    [LOCALE_KEYS.VEHICLE_COUNT_EXCEEDED]: `Solo puedes tener _%_ vehículos aparecidos a la vez. Has excedido el límite de aparición de vehículos.`,
    [LOCALE_KEYS.VEHICLE_LOCKED]: `Bloqueado`,
    [LOCALE_KEYS.VEHICLE_UNLOCKED]: `Desbloqueado`,
    [LOCALE_KEYS.VEHICLE_FUEL]: `Combustible`,
    [LOCALE_KEYS.VEHICLE_NO_KEYS]: `No tienes llaves para este vehículo.`,
    [LOCALE_KEYS.VEHICLE_NO_STORAGE]: `Este vehículo no tiene almacenamiento.`,
    [LOCALE_KEYS.VEHICLE_NO_TRUNK_ACCESS]: `No tienes acceso al maletero.`,
    [LOCALE_KEYS.VEHICLE_NOT_UNLOCKED]: `El vehículo actualmente no está desbloqueado.`,
    [LOCALE_KEYS.VEHICLE_NO_OPEN_SEAT]: `No se pudo encontrar un asiento libre.`,
    [LOCALE_KEYS.VEHICLE_REFUEL_INCOMPLETE]: `Repostaje de Vehículo Incompleto`,
    [LOCALE_KEYS.VEHICLE_NO_LONGER_NEAR_VEHICLE]: `Ya no estás cerca de este vehículo.`,
    [LOCALE_KEYS.VEHICLE_NOT_RIGHT_SIDE_UP]: `El vehículo no está derecho.`,
    [LOCALE_KEYS.VEHICLE_IS_ALREADY_BEING_PUSHED]: `El vehículo ya está siendo empujado.`,
    [LOCALE_KEYS.VEHICLE_STORAGE_VIEW_NAME]: `Vehículo - _%_ - Almacenamiento`,
    [LOCALE_KEYS.VEHICLE_KEY_NAME]: `Llave para _%_`,
    [LOCALE_KEYS.VEHICLE_KEY_DESCRIPTION]: `Una llave para el modelo de vehículo _%_`,
    [LOCALE_KEYS.VEHICLE_MODEL_INVALID]: `Modelo de vehículo inválido.`,
    [LOCALE_KEYS.VEHICLE_CREATED]: `Vehículo creado.`,
    [LOCALE_KEYS.VEHICLE_REFILLED]: `Vehículo rellenado.`,
    [LOCALE_KEYS.VEHICLE_REPAIRED]: `Vehículo reparado con éxito.`,
    [LOCALE_KEYS.VEHICLE_HAS_NO_MOD_KIT]: `El vehículo no tiene kit de modificación.`,
    [LOCALE_KEYS.VEHICLE_NOT_OWN_BY_YOU]: `Debe estar en un vehículo que poseas.`,
    [LOCALE_KEYS.VEHICLE_KEY_GIVEN_TO]: `Llave de Vehículo Creada para`,
    // Faction
    [LOCALE_KEYS.FACTION_PLAYER_IS_ALREADY_IN_FACTION]: `_%_ ya está en una facción o no existe.`,
    [LOCALE_KEYS.FACTION_CANNOT_CHANGE_OWNERSHIP]: `No puedes cambiar la propiedad de la facción.`,
    [LOCALE_KEYS.FACTION_STORAGE_NOT_ACCESSIBLE]: `Almacenamiento No Accesible`,
    [LOCALE_KEYS.FACTION_STORAGE_NO_ACCESS]: `No tienes acceso a esto.`,
    [LOCALE_KEYS.FACTION_ONLY_OWNER_IS_ALLOWED]: `Solo el propietario puede añadir permisos de rango o la bandera de super admin a un rango.`,
    [LOCALE_KEYS.FACTION_UNABLE_TO_DISBAND]: `No puedes disolver la facción.`,
    [LOCALE_KEYS.FACTION_NAME_DOESNT_MATCH]: `El nombre de facción pasado no coincide con el nombre real de la facción.`,
    [LOCALE_KEYS.FACTION_NOT_THE_OWNER]: `No eres el propietario de esta facción.`,
    [LOCALE_KEYS.FACTION_COULD_NOT_FIND]: `No se pudo encontrar tu facción.`,
    [LOCALE_KEYS.FACTION_DISABNDED]: `Facción disuelta.`,
    [LOCALE_KEYS.FACTION_BANK_COULD_NOT_WITHDRAW]: `No se pudo retirar $_%_.`,
    [LOCALE_KEYS.FACTION_BANK_COULD_NOT_DEPOSIT]: `No se pudo depositar $_%_`,
    [LOCALE_KEYS.FACTION_BANK_WITHDREW]: `Retirado $_%_`,
    [LOCALE_KEYS.FACTION_PLAYER_QUITTED]: `_%_ dejó la facción.`,
    [LOCALE_KEYS.FACTION_COULDNT_QUIT]: `No puedes dejar la facción porque eres el líder.`,
    // World
    [LOCALE_KEYS.WORLD_TIME_IS]: `La Hora Mundial Actual es _%_:_%_`,
    // Storage
    [LOCALE_KEYS.STORAGE_NOT_AVAILABLE]: `No hay Almacenamiento Disponible`,
    [LOCALE_KEYS.STORAGE_IN_USE]: `Almacenamiento en Uso`,
    [LOCALE_KEYS.INVENTORY_IS_FULL]: `El inventario está Lleno`,
    // No Clip
    [LOCALE_KEYS.NOCLIP_SPEED_INFO]: `Mayús Izq. (Velocidad de Sprint) | Scroll (Cambiar Velocidad de Sprint)`,
    [LOCALE_KEYS.NOCLIP_SPEED]: `Velocidad`,
    // ============================
    // WebView Locales Start Here
    // ============================
    [LOCALE_KEYS.WEBVIEW_JOB]: {
        LABEL_DECLINE: 'Rechazar',
        LABEL_ACCEPT: 'Aceptar',
    },
    [LOCALE_KEYS.WEBVIEW_STORAGE]: {
        LABEL_SPLIT_TEXT: '¿Mover una pila de esta cantidad?',
    },
    [LOCALE_KEYS.WEBVIEW_INVENTORY]: {
        ITEM_SLOTS: [
            'Sombrero',
            'Máscara',
            'Camisa',
            'Pantalones',
            'Pies',
            'Gafas',
            'Oídos',
            'Bolsa',
            'Armadura',
            'Relojes',
            'Pulseras',
            'Accesorio',
        ],
        LABEL_SPLIT: 'dividir',
        LABEL_CANCEL: 'cancelar',
        LABEL_DROP_ITEM: 'Soltar Objeto',
        LABEL_WEIGHT: 'Peso',
        LABEL_SPLIT_TEXT: '¿Hacer una pila de esta cantidad?',
    },
};