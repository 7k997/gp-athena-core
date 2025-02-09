import { LOCALE_KEYS } from './keys.js';

/**
 * Locales are written with a key and value type.
 * When you get the key of 'greet-user' from the LocaleController
 * It will return a string of 'Hello someVariableYouPass, welcome to the server.'
 * It's a simple way to create locales without hurting performance too much.
 */
export default {
    // Commands
    [LOCALE_KEYS.COMMAND_ADMIN_CHAT]: `_%_ [message] - Falar com outros administradores`,
    [LOCALE_KEYS.COMMAND_ACCEPT_DEATH]: `_%_ - Renascer no hospital após a morte`,
    [LOCALE_KEYS.COMMAND_ACTION_MENU]: `_%_ - Criar um menu de ação de teste`,
    [LOCALE_KEYS.COMMAND_ADD_VEHICLE]: `_%_ [model] - Adicionar um veículo ao seu jogador`,
    [LOCALE_KEYS.COMMAND_ADD_WHITELIST]: `_%_ [discord] - Adicionar um jogador à lista branca pelo ID do Discord`,
    [LOCALE_KEYS.COMMAND_OOC]: `_%_ [message] - Falar fora do personagem`,
    [LOCALE_KEYS.COMMAND_BROADCAST]: `_%_ [message] - Anunciar mensagem para todo o servidor`,
    [LOCALE_KEYS.COMMAND_COORDS]: `_%_ [x] [y] [z] - Teletransportar para coordenadas específicas`,
    [LOCALE_KEYS.COMMAND_DO]: `_%_ [message] - Descrever um objeto, som, etc.`,
    [LOCALE_KEYS.COMMAND_DUMMY_ITEM]: `_%_ - Obter alguns itens de depuração`,
    [LOCALE_KEYS.COMMAND_GET_ITEM]: `_%_ [item-name] [amount] - Obter item/itens pelo dbname/nome`,
    [LOCALE_KEYS.COMMAND_LOW]: `_%_ [message] - Falar baixo`,
    [LOCALE_KEYS.COMMAND_MOD_CHAT]: `_%_ [message] - Falar com Admins & Mods`,
    [LOCALE_KEYS.COMMAND_ME]: `_%_ [message] - Descrever uma ação de roleplay`,
    [LOCALE_KEYS.COMMAND_NO_CLIP]: `_%_ - Alternar modo No Clip`,
    [LOCALE_KEYS.COMMAND_QUIT_JOB]: `_%_ - Sair de um emprego`,
    [LOCALE_KEYS.COMMAND_REMOVE_ALL_WEAPONS]: `_%_ - Remover todas as armas`,
    [LOCALE_KEYS.COMMAND_REMOVE_WHITELIST]: `_%_ [discord] - Remover ID do Discord da lista branca`,
    [LOCALE_KEYS.COMMAND_REVIVE]: `_%_ [player_id]* - Reviver a si mesmo ou a outros`,
    [LOCALE_KEYS.COMMAND_SEATBELT]: `_%_ - Colocar cinto de segurança ou capacete`,
    [LOCALE_KEYS.COMMAND_SET_ARMOUR]: `_%_ [0-100][player_id]* - Definir armadura para si ou para outros`,
    [LOCALE_KEYS.COMMAND_SET_CASH]: `_%_ [value] - Definir seu dinheiro em mãos`,
    [LOCALE_KEYS.COMMAND_SET_FOOD]: `_%_ [0-100] - Definir seu nível de fome`,
    [LOCALE_KEYS.COMMAND_SET_HEALTH]: `_%_ [99-199][player_id]* - Definir saúde para si ou para outros`,
    [LOCALE_KEYS.COMMAND_SET_WATER]: `_%_ [0-100] - Definir seu nível de sede`,
    [LOCALE_KEYS.COMMAND_SPAWN_VEHICLE]: `_%_ [index] - Gerar veículo pessoal por índice`,
    [LOCALE_KEYS.COMMAND_TELEPORTER]: `_%_ - Teletransportar de volta para a localização atual com um item`,
    [LOCALE_KEYS.COMMAND_TELEPORT_WAYPOINT]: `_%_ - Teletransportar para um waypoint. Crie o waypoint primeiro`,
    [LOCALE_KEYS.COMMAND_TOGGLE_VEH_LOCK]: `_%_ - Alternar o bloqueio do veículo`,
    [LOCALE_KEYS.COMMAND_TOGGLE_VEH_DOOR]: `_%_ - [0-5] - Alternar porta do veículo`,
    [LOCALE_KEYS.COMMAND_GIVE_VEH_KEY]: `_%_ [id] - Dar chave do veículo a um jogador`,
    [LOCALE_KEYS.COMMAND_TOGGLE_ENGINE]: `_%_ - Alternar o motor do veículo`,
    [LOCALE_KEYS.COMMAND_VEHICLE]: `_%_ [model] - Gerar um veículo de administrador`,
    [LOCALE_KEYS.COMMAND_WANTED]: `_%_ [player_id] [stars] - Definir nível de procurado de um jogador`,
    [LOCALE_KEYS.COMMAND_WHISPER]: `_%_ [player_id][message] - Sussurrar privadamente para um jogador próximo`,
    [LOCALE_KEYS.COMMAND_WEAPON]: `_%_ [name] - Obter uma arma pelo nome`,
    [LOCALE_KEYS.COMMAND_CLEAR_INVENTORY]: `_%_ - Limpar seu Inventário`,
    [LOCALE_KEYS.COMMAND_CLEAR_TOOLBAR]: `_%_ - Limpar sua Barra de Ferramentas`,
    [LOCALE_KEYS.COMMAND_CLEAR_EQUIPMENT]: `_%_ - Limpar seu Equipamento`,
    [LOCALE_KEYS.COMMAND_NOT_PERMITTED_CHARACTER]: `Comando não permitido para o seu personagem.`,
    [LOCALE_KEYS.COMMAND_NOT_PERMITTED_ADMIN]: `Comando não permitido para a sua conta.`,
    [LOCALE_KEYS.COMMAND_NOT_VALID]: `_%_ não é um comando válido.`,
    [LOCALE_KEYS.COMMAND_SET_WEATHER]: `_%_ [weather name] - Sobrescrever todos os climas da região`,
    [LOCALE_KEYS.COMMAND_CLEAR_WEATHER]: `_%_ - Desligar a sobrescrita do clima`,
    [LOCALE_KEYS.COMMAND_SET_TIME]: `_%_ [hour] - Sobrescrever a hora para esta hora`,
    [LOCALE_KEYS.COMMAND_CLEAR_TIME]: `_%_ - Limpar a sobrescrita da hora`,
    [LOCALE_KEYS.COMMAND_REFILL_VEHICLE]: `_%_ - Reabastecer combustível de um veículo por poder administrativo`,
    [LOCALE_KEYS.COMMAND_REPAIR_VEHICLE]: `_%_ - Reparar um veículo por poder administrativo`,
    [LOCALE_KEYS.COMMAND_TEMP_VEHICLE]: `_%_ [model] - Gerar um veículo temporário`,
    [LOCALE_KEYS.COMMAND_SET_VEHICLE_HANDLING]: `_%_ [value] - Definir valor de manipulação do veículo`,
    [LOCALE_KEYS.COMMAND_SET_VEHICLE_LIVERY]: `_%_ [nummer] - Definir a livre do veículo`,
    [LOCALE_KEYS.COMMAND_SESSION_VEHICLE]: `_%_ [model] - Gerar um veículo de sessão`,
    [LOCALE_KEYS.COMMAND_TOGGLE_VEH_NEON_LIGHTS]: `_%_ - Alternar luzes de néon do veículo`,
    [LOCALE_KEYS.COMMAND_SET_VEH_NEON_LIGHTS]: `_%_ [<] [>] [ᐱ] [V] - Definir luzes de néon do veículo`,
    [LOCALE_KEYS.COMMAND_FULL_TUNE_VEHICLE]: `_%_ - Ajustar completamente um veículo`,
    [LOCALE_KEYS.COMMAND_ADD_VEHICLE_KEY]: `_%_ - Adicionar uma chave para um veículo`,
    [LOCALE_KEYS.COMMAND_SET_VEH_DIRT_LEVEL]: `_%_ [level] - Definir nível de sujeira do veículo`,
    // Cannot
    [LOCALE_KEYS.CANNOT_CHAT_WHILE_DEAD]: `Não pode conversar enquanto está morto.`,
    [LOCALE_KEYS.CANNOT_FIND_PLAYER]: `Não foi possível encontrar esse jogador.`,
    [LOCALE_KEYS.CANNOT_PERFORM_WHILE_DEAD]: `Não pode executar este comando enquanto está morto.`,
    [LOCALE_KEYS.CANNOT_FIND_PERSONAL_VEHICLES]: `Não é possível encontrar veículos pessoais.`,
    [LOCALE_KEYS.CANNOT_FIND_THAT_PERSONAL_VEHICLE]: `Não é possível localizar esse veículo pessoal.`,
    // Clothing
    [LOCALE_KEYS.CLOTHING_ITEM_IN_INVENTORY]: `Um item de vestuário foi enviado para o seu inventário.`,
    // Discord
    [LOCALE_KEYS.DISCORD_ID_NOT_LONG_ENOUGH]: `O ID do Discord deve ter pelo menos 18 caracteres.`,
    [LOCALE_KEYS.DISCORD_ALREADY_WHITELISTED]: `_%_ já está na lista branca.`,
    [LOCALE_KEYS.DISCORD_NOT_WHITELISTED]: `_%_ não está na lista branca.`,
    [LOCALE_KEYS.DISCORD_ADDED_WHITELIST]: `_%_ foi adicionado à lista branca.`,
    [LOCALE_KEYS.DISCORD_REMOVED_WHITELIST]: `_%_ foi removido da lista branca.`,
    // FUEL
    [LOCALE_KEYS.FUEL_EXIT_VEHICLE_FIRST]: `Você deve sair do seu veículo antes de abastecer.`,
    [LOCALE_KEYS.FUEL_UPDATE_VEHICLE_FIRST]: `Você deve entrar e sair de um veículo primeiro para abastecer.`,
    [LOCALE_KEYS.FUEL_VEHICLE_NOT_CLOSE]: `Veículo não está próximo o suficiente para abastecer.`,
    [LOCALE_KEYS.FUEL_ALREADY_FULL]: `Veículo já tem combustível suficiente.`,
    [LOCALE_KEYS.FUEL_TOO_FAR_FROM_PUMP]: `Bomba está muito longe do veículo.`,
    [LOCALE_KEYS.FUEL_HAS_UNLIMITED]: `Veículo tem combustível ilimitado. Não é necessário reabastecer.`,
    [LOCALE_KEYS.FUEL_CANNOT_AFFORD]: `Você não pode pagar por combustível.`,
    [LOCALE_KEYS.FUEL_PAYMENT]: `Você pagará $_%_ por _%_ unidades de combustível. Execute este menu novamente para cancelar o abastecimento.`,
    [LOCALE_KEYS.FUEL_PAID]: `Você pagou $_%_ por _%_ unidades de combustível.`,
    // House
    [LOCALE_KEYS.INTERIOR_INTERACT]: `Interagir com Casa`,
    //Translations related to interiors
    [LOCALE_KEYS.INTERIOR_TOO_FAR_FROM_ENTRANCE]: `Muito longe da entrada.`,
    [LOCALE_KEYS.INTERIOR_TOO_FAR_FROM_EXIT]: `Muito longe da saída.`,
    [LOCALE_KEYS.INTERIOR_NOT_ENOUGH_CURRENCY]: `Moeda insuficiente`,
    [LOCALE_KEYS.INTERIOR_DOOR_LOCKED]: `Porta está trancada`,
    [LOCALE_KEYS.INTERIOR_PURCHASED]: `Propriedade comprada com id _%_ por $_%_.`,
    [LOCALE_KEYS.INTERIOR_SOLD]: `Propriedade vendida com id _%_ por $_%_.`,
    [LOCALE_KEYS.INTERIOR_NO_STORAGE]: `Interior não tem armazenamento.`,
    // Invalid
    [LOCALE_KEYS.INVALID_VEHICLE_MODEL]: `Modelo de veículo inválido.`,
    // Interaction
    [LOCALE_KEYS.INTERACTION_TOO_FAR_AWAY]: `Você está muito longe para interagir. Aproxime-se.`,
    [LOCALE_KEYS.INTERACTION_INVALID_OBJECT]: `Este objeto não tem interação.`,
    [LOCALE_KEYS.INTERACTION_INTERACT_WITH_OBJECT]: `Interagir com Objeto`,
    [LOCALE_KEYS.INTERACTION_INTERACT_VEHICLE]: `Interagir com Veículo`,
    [LOCALE_KEYS.INTERACTION_VIEW_OPTIONS]: `Ver Opções`,
    // Item
    [LOCALE_KEYS.ITEM_ARGUMENTS_MISSING]: `Argumentos faltando.`,
    [LOCALE_KEYS.ITEM_NOT_EQUIPPED]: `Nenhum item está equipado nesse slot.`,
    [LOCALE_KEYS.ITEM_DOES_NOT_EXIST]: `_%_ não existe.`,
    [LOCALE_KEYS.ITEM_WAS_ADDED_INVENTORY]: `_%_ foi adicionado ao seu inventário.`,
    [LOCALE_KEYS.ITEM_WAS_ADDED_EQUIPMENT]: `_%_ foi adicionado ao seu equipamento.`,
    [LOCALE_KEYS.ITEM_WAS_ADDED_TOOLBAR]: `_%_ foi adicionado à sua barra de ferramentas.`,
    [LOCALE_KEYS.ITEM_WAS_DESTROYED_ON_DROP]: `_%_ foi destruído ao cair.`,
    // Job
    [LOCALE_KEYS.JOB_ALREADY_WORKING]: `Você já está trabalhando em um emprego.`,
    [LOCALE_KEYS.JOB_NOT_WORKING]: `Você não está trabalhando atualmente.`,
    [LOCALE_KEYS.JOB_QUIT]: `Você saiu do seu emprego atual.`,
    // Labels
    [LOCALE_KEYS.LABEL_ON]: `LIGADO`,
    [LOCALE_KEYS.LABEL_OFF]: `DESLIGADO`,
    [LOCALE_KEYS.LABEL_BROADCAST]: `Transmissão`,
    [LOCALE_KEYS.LABEL_ENGINE]: `Motor`,
    [LOCALE_KEYS.LABEL_HOSPITAL]: `Hospital`,
    [LOCALE_KEYS.LABEL_BANNED]: `[Banido]`,
    // Player
    [LOCALE_KEYS.PLAYER_IS_TOO_FAR]: `Esse jogador está muito longe.`,
    [LOCALE_KEYS.PLAYER_IS_TOO_CLOSE]: `Esse jogador está muito perto.`,
    [LOCALE_KEYS.PLAYER_IS_NOT_DEAD]: `Esse jogador não está morto.`,
    [LOCALE_KEYS.PLAYER_ARMOUR_SET_TO]: `Sua armadura foi definida para: _%_`,
    [LOCALE_KEYS.PLAYER_HEALTH_SET_TO]: `Sua saúde foi definida para: _%_`,
    [LOCALE_KEYS.PLAYER_SEATBELT_ON]: `Você colocou o cinto de segurança.`,
    [LOCALE_KEYS.PLAYER_SEATBELT_OFF]: `Você tirou o cinto de segurança.`,
    [LOCALE_KEYS.PLAYER_RECEIVED_BLANK]: `Você recebeu _%_ de _%_`,
    // Use
    [LOCALE_KEYS.USE_FUEL_PUMP]: 'Usar Bomba de Combustível',
    [LOCALE_KEYS.USE_ATM]: 'Usar Caixa Eletrônico',
    [LOCALE_KEYS.USE_VENDING_MACHINE]: 'Usar Máquina de Vendas',
    [LOCALE_KEYS.USE_CLOTHING_STORE]: 'Navegar por Roupas',
    // Weapon
    [LOCALE_KEYS.WEAPON_NO_HASH]: `A arma não tem hash.`,
    // Vehicle
    [LOCALE_KEYS.VEHICLE_NO_FUEL]: `O veículo não tem combustível.`,
    [LOCALE_KEYS.VEHICLE_LOCK_SET_TO]: `O bloqueio do veículo foi definido para: _%_`,
    [LOCALE_KEYS.VEHICLE_TOGGLE_LOCK]: `Alternar Trava`,
    [LOCALE_KEYS.VEHICLE_TOGGLE_ENGINE]: `Alternar Motor`,
    [LOCALE_KEYS.VEHICLE_IS_LOCKED]: `O veículo mais próximo está trancado.`,
    [LOCALE_KEYS.VEHICLE_ENTER_VEHICLE]: `Entrar/Sair do Veículo`,
    [LOCALE_KEYS.VEHICLE_TOO_FAR]: `O veículo está muito longe.`,
    [LOCALE_KEYS.VEHICLE_NO_VEHICLES_IN_GARAGE]: `Não há veículos neste garagem.`,
    [LOCALE_KEYS.VEHICLE_NO_PARKING_SPOTS]: `Não há vagas de estacionamento neste garagem.`,
    [LOCALE_KEYS.VEHICLE_ALREADY_SPAWNED]: `Esse veículo já foi gerado.`,
    [LOCALE_KEYS.VEHICLE_COUNT_EXCEEDED]: `Você só pode ter _%_ veículos gerados por vez. Você excedeu o limite de geração de veículos.`,
    [LOCALE_KEYS.VEHICLE_LOCKED]: `Trancado`,
    [LOCALE_KEYS.VEHICLE_UNLOCKED]: `Destrancado`,
    [LOCALE_KEYS.VEHICLE_FUEL]: `Combustível`,
    [LOCALE_KEYS.VEHICLE_NO_KEYS]: `Você não tem as chaves deste veículo.`,
    [LOCALE_KEYS.VEHICLE_NO_STORAGE]: `Este veículo não tem armazenamento.`,
    [LOCALE_KEYS.VEHICLE_NO_TRUNK_ACCESS]: `Você não tem acesso ao porta-malas.`,
    [LOCALE_KEYS.VEHICLE_NOT_UNLOCKED]: `O veículo não está atualmente destrancado.`,
    [LOCALE_KEYS.VEHICLE_NO_OPEN_SEAT]: `Não foi possível encontrar um assento livre.`,
    [LOCALE_KEYS.VEHICLE_REFUEL_INCOMPLETE]: `Reabastecimento do Veículo Incompleto`,
    [LOCALE_KEYS.VEHICLE_NO_LONGER_NEAR_VEHICLE]: `Você não está mais perto deste veículo.`,
    [LOCALE_KEYS.VEHICLE_NOT_RIGHT_SIDE_UP]: `O veículo não está na posição correta.`,
    [LOCALE_KEYS.VEHICLE_IS_ALREADY_BEING_PUSHED]: `O veículo já está sendo empurrado.`,
    [LOCALE_KEYS.VEHICLE_STORAGE_VIEW_NAME]: `Veículo - _%_ - Armazenamento`,
    [LOCALE_KEYS.VEHICLE_KEY_NAME]: `Chave para _%_`,
    [LOCALE_KEYS.VEHICLE_KEY_DESCRIPTION]: `Uma chave para o modelo de veículo _%_`,
    [LOCALE_KEYS.VEHICLE_MODEL_INVALID]: `Modelo de veículo inválido.`,
    [LOCALE_KEYS.VEHICLE_CREATED]: `Veículo criado.`,
    [LOCALE_KEYS.VEHICLE_REFILLED]: `Veículo reabastecido.`,
    [LOCALE_KEYS.VEHICLE_REPAIRED]: `Veículo reparado com sucesso.`,
    [LOCALE_KEYS.VEHICLE_HAS_NO_MOD_KIT]: `O veículo não tem kit de modificação.`,
    [LOCALE_KEYS.VEHICLE_NOT_OWN_BY_YOU]: `Deve estar em um veículo de sua propriedade.`,
    [LOCALE_KEYS.VEHICLE_KEY_GIVEN_TO]: `Chave do Veículo Criada para`,
    // Faction
    [LOCALE_KEYS.FACTION_PLAYER_IS_ALREADY_IN_FACTION]: `_%_ já está em uma facção ou não existe.`,
    [LOCALE_KEYS.FACTION_CANNOT_CHANGE_OWNERSHIP]: `Você não pode mudar a propriedade da facção.`,
    [LOCALE_KEYS.FACTION_STORAGE_NOT_ACCESSIBLE]: `Armazenamento Não Acessível`,
    [LOCALE_KEYS.FACTION_STORAGE_NO_ACCESS]: `Você não tem acesso a isso.`,
    [LOCALE_KEYS.FACTION_ONLY_OWNER_IS_ALLOWED]: `Somente o proprietário pode adicionar permissões de classificação ou a bandeira de super administrador a um rank.`,
    [LOCALE_KEYS.FACTION_UNABLE_TO_DISBAND]: `Você não pode dissolver a facção.`,
    [LOCALE_KEYS.FACTION_NAME_DOESNT_MATCH]: `O nome da facção passado não corresponde ao nome real da facção.`,
    [LOCALE_KEYS.FACTION_NOT_THE_OWNER]: `Você não é o proprietário desta facção.`,
    [LOCALE_KEYS.FACTION_COULD_NOT_FIND]: `Não foi possível encontrar a sua facção.`,
    [LOCALE_KEYS.FACTION_DISABNDED]: `Facção dissolvida.`,
    [LOCALE_KEYS.FACTION_BANK_COULD_NOT_WITHDRAW]: `Não foi possível retirar $_%_.`,
    [LOCALE_KEYS.FACTION_BANK_COULD_NOT_DEPOSIT]: `Não foi possível depositar $_%_`,
    [LOCALE_KEYS.FACTION_BANK_WITHDREW]: `Retirado $_%_`,
    [LOCALE_KEYS.FACTION_PLAYER_QUITTED]: `_%_ saiu da facção.`,
    [LOCALE_KEYS.FACTION_COULDNT_QUIT]: `Você não pode sair da facção porque você é o líder.`,
    // World
    [LOCALE_KEYS.WORLD_TIME_IS]: `A Hora Mundial Atual é _%_:_%_`,
    // Storage
    [LOCALE_KEYS.STORAGE_NOT_AVAILABLE]: `Nenhum Armazenamento Disponível`,
    [LOCALE_KEYS.STORAGE_IN_USE]: `Armazenamento em Uso`,
    [LOCALE_KEYS.INVENTORY_IS_FULL]: `O inventário está Cheio`,
    // No Clip
    [LOCALE_KEYS.NOCLIP_SPEED_INFO]: `Shift Esquerdo (Velocidade de Sprint) | Scroll (Mudar Velocidade de Sprint)`,
    [LOCALE_KEYS.NOCLIP_SPEED]: `Velocidade`,
    // ============================
    // WebView Locales Start Here
    // ============================
    [LOCALE_KEYS.WEBVIEW_JOB]: {
        LABEL_DECLINE: 'Recusar',
        LABEL_ACCEPT: 'Aceitar',
    },
    [LOCALE_KEYS.WEBVIEW_STORAGE]: {
        LABEL_SPLIT_TEXT: 'Mover uma pilha desta quantidade?',
    },
    [LOCALE_KEYS.WEBVIEW_INVENTORY]: {
        ITEM_SLOTS: [
            'Chapéu',
            'Máscara',
            'Camisa',
            'Calças',
            'Pés',
            'Óculos',
            'Orelhas',
            'Bolsa',
            'Armadura',
            'Relógios',
            'Pulseiras',
            'Acessório',
        ],
        LABEL_SPLIT: 'dividir',
        LABEL_CANCEL: 'cancelar',
        LABEL_DROP_ITEM: 'Largar Item',
        LABEL_WEIGHT: 'Peso',
        LABEL_SPLIT_TEXT: 'Criar uma pilha desta quantidade?',
    },
};
