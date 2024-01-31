import { ORIENTATION } from "@AthenaPlugins/athena-plugin-clothing/shared/enums.js";
import { ClothingComponent } from "@AthenaShared/interfaces/item.js";

export type ComplexLanguage = {
    [key: string]: {
        dbName: string;
        name: string;
        description: string;
    };
};

export interface ISharedItem {
    id?: string; //ID of the item, to identify custom unique items
    type: string;

    //Wallets Attributes
    storageid?: string; //Storage ID for equipment
    size?: number; //Wallet size in slots
    max_weight?: number; //Wallet max weight, not implemented yet
    wallettype?: string; //The type of Wallet type e.g. wallet, bag, keychain, ringbox
    walletcontenttype?: number; //The content type for wallet items e.g. money, paper, cards, keys, jewelry
    cardtype?: string; //Card type e.g. credit, debit, prepaid
    papertype?: string; //Paper type e.g. id, notes, recipe
    content?: number; //Wallet supported content types e.g. money, bitcoin, ethereum

    //Clothing Attributes
    sex?: ORIENTATION;
    components?: Array<ClothingComponent>;
    equipment?: number; //Equipment type e.g. bag, vest, helmet
}
