import * as alt from 'alt-client';
import { FactionView } from '../../athena-plugin-factions/client/views/factionView.js';
import { Faction } from '../../athena-plugin-factions/shared/interfaces.js';
import { GP_FACTIONS_STORAGE_VIEW_EVENTS } from '../shared/events.js';

let _view: alt.WebView;

class InternalFunctions {
    static init() {
        FactionView.onOpen(InternalFunctions.open);
        FactionView.onClose(InternalFunctions.close);
        // alt.onServer(F_PAYCHECK_EVENTS.GET_PAYCHECK_TIME_LEFT, InternalFunctions.setPaycheckTimeLeft);
    }

    /**
     * It opens a webview and sets the event listener for the webview to the function
     * `InternalFunctions.requestTime`
     * @param view - alt.WebView - The webview that the event is being called from.
     * @param {Faction} faction - Faction - The faction that the player is in.
     */
    static open(view: alt.WebView, faction: Faction) {
        _view = view;
        view.on(GP_FACTIONS_STORAGE_VIEW_EVENTS.WEBVIEW.ACTION, InternalFunctions.action);
    }

    /**
     * It's a static function that closes a webview and removes an event listener.
     * @param view - alt.WebView - The webview that is being closed.
     * @param {Faction} faction - Faction - The faction that the player is in.
     */
    static close(view: alt.WebView, faction: Faction) {
        _view = null;
        view.off(GP_FACTIONS_STORAGE_VIEW_EVENTS.WEBVIEW.ACTION, InternalFunctions.action);
    }

    static action(functionName: string, ...args: any[]) {
        alt.emitServer(GP_FACTIONS_STORAGE_VIEW_EVENTS.PROTOCOL.INVOKE, functionName, ...args);
    }
}

InternalFunctions.init();
