import * as alt from 'alt-client';
import { LOCALE, LocaleController } from "@AthenaShared/locale/locale.js";

export function get(key: string, ...args: any[]): string {
    return LocaleController.get(key, alt.Player.local.meta.displayLanguage, ...args);
}

export function registerLocaleKey(key: string, value: string, iso639: LOCALE) {
    LocaleController.registerLocaleKey(key, value, iso639);
}