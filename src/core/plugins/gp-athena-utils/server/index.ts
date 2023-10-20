import * as alt from 'alt-server';
import * as Athena from '@AthenaServer/api/index.js';
import { addAPI } from '@AthenaServer/systems/plugins.js';
import { getClosestPlayers } from './utility/closest.js';
import { InventoryUtil } from './utility/inventory.js';
import { emitAll } from './utility/emitHelper.js';
import { PlayerExtension } from './overrides/player.js';
import { MenuUtil } from './utility/menuUtil.js';

const PLUGIN_NAME = 'gpAthenaUtils';

declare global {
    export interface ServerPluginAPI {
        ['gputils']: typeof funcs;
    }
}

const InventoryUtilInstance = new InventoryUtil();
InventoryUtilInstance.init();

const MenuUtilInstance = new MenuUtil();
MenuUtilInstance.init();

const funcs = {
    emitAll,
    getClosestPlayers,
    getToolBarItem: InventoryUtilInstance.getToolBarItem,
    getInventoryItem: InventoryUtilInstance.getInventoryItem,
    getAllInventoryItems: InventoryUtilInstance.getAllInventoryItems,
    getAllToolbarItems: InventoryUtilInstance.getAllToolbarItems,
    dropItem: InventoryUtilInstance.dropItem,
    isInToolbar: InventoryUtilInstance.isInToolbar,
    isInInventory: InventoryUtilInstance.isInInventory,
    createCustomItem: InventoryUtilInstance.createCustomItem,
    addCustomItemToInventory: InventoryUtilInstance.addCustomItemToInventory,
    inputMenu: MenuUtilInstance.inputMenu,
};

Athena.systems.plugins.registerPlugin(PLUGIN_NAME, () => {
    PlayerExtension.init();
    addAPI('gputils', funcs);
    alt.log(`~lg~${PLUGIN_NAME} was Loaded`);
});
