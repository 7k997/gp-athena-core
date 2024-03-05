
export interface I18n {
    [key: string]: any;
}

export interface I18nItem {
    [key: string]: string[];
}

export interface LocaleFormat {
    [key: string]: I18n;
}
export interface LocaleFormatItem {
    [key: string]: I18nItem
}
