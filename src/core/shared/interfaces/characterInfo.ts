import { LOCALE } from "@AthenaShared/locale/locale.js";

/**
 * Used for supplying general character information to the Database.
 *
 *
 * @interface CharacterInfo
 */
export interface CharacterInfo {
    /**
     * A custom field for character information about gender.
     * Yes Athena is a progressive framework.
     * @type {string}
     *
     */
    gender?: string;

    /**
     * This is normally an actual age number value.
     * Set as any just in case externals are changed for age.
     * @type {*}
     *
     */
    age?: any;

    /**
     * A custom field for character information about language.
     * Will not used for display language.
     * @type {string}
     *
     */
    language?: LOCALE;

    /**
     * The display language for the character. This is the language which is choosen before char select.
     * It can be differs from the language of the character and be changed any time.
     * @type {string}
     *
     */
    displayLanguage?: LOCALE;
}
