import * as alt from 'alt-server';
import * as Athena from '@AthenaServer/api/index.js';
import { LOCALE, LocaleController } from "@AthenaShared/locale/locale.js";

export function get(player: alt.Player, key: string, ...args: any[]): string {
    const data = Athena.document.character.get(player);
    return LocaleController.get(key, data.info.displayLanguage, ...args);
}

export function registerLocaleKey(key: string, value: string, iso639: LOCALE) {
    LocaleController.registerLocaleKey(key, value, iso639);
}