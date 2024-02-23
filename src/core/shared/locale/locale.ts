import { LocaleFormat } from '../interfaces/localeFormat.js';
import en from './languages/en.js'; // Importing the English Locale
import de from './languages/de.js'; // Importing the German Locale
export const placeholder = `_%_`;

/**
 * All locales have a base language in ISO-639-1.
 * Example for English is: 'en'.
 *
 * Variables are replaced in their respective orders.
 * Variable placeholders are written with: _%_
 *
 * //Corechange - Real multi-language support, the next sentence is not true anymore
 * 
 * This file cannot be injected into during runtime.
 * Locales must be written and present at the time of bootup.
 *
 * `setLanguage` function must be used on `client-side` in order to change the language.
 */

export enum LOCALE {
    English = 'en',
    German = 'de',
    French = 'fr',
    Spanish = 'es',
    Italian = 'it',
    Portuguese = 'pt',
    Russian = 'ru',
    // Additional languages can be added here...
}

const translations: LocaleFormat = {
    [LOCALE.English]: en,
    [LOCALE.German]: de,
// de,
    // Additional languages can be added here...
};

let defaultLanguage = LOCALE.English; // Change to your default language. Make sure that all keys are present for the default language!

export class LocaleController {
    /**
     * The ISO-639-1 Code to Utilize for Language
     * @static
     * @param {string} [iso639='en']
     *
     */
    static setLanguage(iso639: LOCALE) {
        defaultLanguage = iso639;
    }

    /**
     * Register locale keys on runtime. This method can be called by plugins to add new keys.
     * Attention: You have to call this method twice, once for the server and once for the client. 
     **/
    static registerLocaleKey(key: string, value: string, iso639: LOCALE) {
        if (!translations[iso639]) {
            translations[iso639] = {};
        }

        translations[iso639][key] = value;
    }

    /**
     * Get a locale based on its key value.
     * @static
     * @param {string} key
     * @param {...any[]} args
     * @return {string}
     *
     */
    static get(key: string, iso639?: LOCALE, ...args: any[]): string {
        if (!iso639) {
            iso639 = defaultLanguage;
        }

        if (!translations[iso639][key]) {
            if (iso639 !== defaultLanguage) {
                // Key not find in the requested language, try to find it in the default language
                return this.get(key, defaultLanguage, ...args);
            }
            console.log(`Translation for ${key} was not found`);
            return key;
        }

        let message = translations[iso639][key];
        for (let i = 0; i < args.length; i++) {
            message = message.replace(placeholder, args[i]);
        }

        return message;
    }

    /**
     * Returns an object of strings with labels for WebViews.
     * @static
     * @param {string} key
     * @return {Object}
     *
     */
    static getWebviewLocale(key: string, iso639?: string): Object {
        if (!iso639) {
            iso639 = defaultLanguage;
        }
        if (!translations[iso639][key]) {
            if (iso639 !== defaultLanguage) {
                // Key not find in the requested language, try to find it in the default language
                return this.getWebviewLocale(key, defaultLanguage);
            }
            console.log(`Translation for ${key} was not found`);
            return key;
        }

        return translations[iso639][key];
    }
}
