import { LocaleFormat } from '../interfaces/localeFormat.js';
import ar from './languages/ar.js'; // Importing the Arabic Locale
import cs from './languages/cs.js'; // Importing the Czech Locale
import da from './languages/da.js'; // Importing the Danish Locale
import de from './languages/de.js'; // Importing the German Locale
import de_bar from './languages/de-bar.js'; // Importing the Bavarian Locale
import de_frr from './languages/de-frr.js'; // Importing the Frisian Locale
import de_gsw from './languages/de-gsw.js'; // Importing the Alemannic Locale
import de_hsb from './languages/de-hsb.js'; // Importing the Sorbian Locale
import de_ksh from './languages/de-ksh.js'; // Importing the Colognian Locale
import de_nds from './languages/de-nds.js'; // Importing the Low German Locale
import el from './languages/el.js'; // Importing the Greek Locale
import el_grc from './languages/el-grc.js'; // Importing the Ancient Greek Locale
import en from './languages/en.js'; // Importing the English Locale
import es from './languages/es.js'; // Importing the Spanish Locale
import fr from './languages/fr.js'; // Importing the French Locale
import hu from './languages/hu.js'; // Importing the Hungarian Locale
import it from './languages/it.js'; // Importing the Italian Locale
import la from './languages/la.js'; // Importing the Latin Locale
import nl from './languages/nl.js'; // Importing the Dutch Locale
import pl from './languages/pl.js'; // Importing the Polish Locale
import pt from './languages/pt.js'; // Importing the Portuguese Locale
import ru from './languages/ru.js'; // Importing the Russian Locale
import tr from './languages/tr.js'; // Importing the Turkish Locale
import uk from './languages/uk.js'; // Importing the Ukrainian Locale
import zh from './languages/zh.js'; // Importing the Chinese Locale
export const placeholder = `_%_`;

/**
 * All locales have a base language in ISO-639-1.
 * Example for English is: 'en'.
 *
 * For dialects, the ISO-639-1 code is extended with a hyphen and the dialect code in ISO-639-3.
 * Example for Bavarian is: 'de-bar'.
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
    Arabic = 'ar',
    Czech = 'cs',
    Danish = 'da',
    German = 'de',
    //German dialects start
    Bavarian = 'de-bar',
    Frisian = 'de-frr',
    Alemannic = "de-gsw",
    Colognian = 'de-ksh',
    LowGerman = 'de-nds',
    Sorbian = "de-hsb",
    //German dialects end
    Greek = 'el',
    AncientGreek = 'el-grc',
    English = 'en',
    Spanish = 'es',
    French = 'fr',
    Hungarian = 'hu', 
    Italian = 'it',
    Latin = 'la',
    Dutch = 'nl',
    Polish = 'pl',    
    Portuguese = 'pt',
    Russian = 'ru',
    Turkish = 'tr',
    Ukrainian = 'uk',
    Chinese = 'zh',

    // Additional languages can be added here...
}

const translations: LocaleFormat = {
    [LOCALE.Arabic]: ar,
    [LOCALE.Czech]: cs,
    [LOCALE.Danish]: da,
    [LOCALE.German]: de,
    [LOCALE.Alemannic]: de_gsw,
    [LOCALE.Bavarian]: de_bar,
    [LOCALE.Frisian]: de_frr,
    [LOCALE.LowGerman]: de_nds,
    [LOCALE.Colognian]: de_ksh,
    [LOCALE.Sorbian]: de_hsb,
    [LOCALE.Greek]: el,
    [LOCALE.AncientGreek]: el_grc,
    [LOCALE.English]: en,
    [LOCALE.Spanish]: es,    
    [LOCALE.French]: fr,    
    [LOCALE.Hungarian]: hu,
    [LOCALE.Italian]: it,
    [LOCALE.Latin]: la,
    [LOCALE.Dutch]: nl,
    [LOCALE.Polish]: pl,    
    [LOCALE.Portuguese]: pt,
    [LOCALE.Russian]: ru,
    [LOCALE.Turkish]: tr,
    [LOCALE.Ukrainian]: uk,
    [LOCALE.Chinese]: zh,

    // Additional languages can be added here...
};

let defaultLanguage = LOCALE.English; // Change to your default language. Make sure that all keys are present for the default language!

export const stringToEnumValue = <T, K extends keyof T>(enumObj: T, value: string): T[keyof T] | undefined =>
    enumObj[Object.keys(enumObj).filter((k) => enumObj[k as K].toString() === value)[0] as keyof typeof enumObj];

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
                // if (iso639.includes('-')) {
                //     // If the requested language is a dialect, try to find the key in the base language

                //     let baseStr = iso639.split('-')[0];
                //     const localeEnumValue = stringToEnumValue(LOCALE, baseStr);
                //     return this.get(key, localeEnumValue, ...args);
                // }
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

    static getDefaultLocale(): LOCALE {
        return defaultLanguage;
    }

    static isLocaleValid(iso639: string): boolean {
        return !!translations[iso639];
    }
}
