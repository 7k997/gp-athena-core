import * as alt from 'alt-client';
import * as AthenaClient from '@AthenaClient/api/index.js';
import { Config } from '@AthenaPlugins/gp-athena-overrides/shared/config.js';
let openedMenuCount: number;

openedMenuCount = 0;

export class MenuHelper {
    static isMenuOpened(): boolean {
        return openedMenuCount > 0;
    }

    static openMenu(isAllowToolbarKeys: boolean = true) {
        openedMenuCount++;
        if (Config.DEBUG) alt.log('Open menu, count: ' + openedMenuCount);
        AthenaClient.webview.focus();
        AthenaClient.webview.showCursor(true);
        alt.toggleGameControls(false);

        alt.Player.local.isMenuOpen = true;
        alt.Player.local.isAllowToolbarKeys = isAllowToolbarKeys;
    }

    static closeMenu(doNotCount: boolean = false) {
        if (!doNotCount) openedMenuCount--;
        if (Config.DEBUG) alt.log('Close menu, count: ' + openedMenuCount);
        if (!MenuHelper.isMenuOpened()) {
            if (Config.DEBUG) alt.log('Close last menu');
            alt.toggleGameControls(true);
            AthenaClient.webview.unfocus();
            AthenaClient.webview.showCursor(false);
            AthenaClient.webview.setOverlaysVisible(true);
            alt.Player.local.isMenuOpen = false;
            alt.Player.local.isAllowToolbarKeys = false;
        }
    }
}
