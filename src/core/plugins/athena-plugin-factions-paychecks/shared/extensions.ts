import * as interfaces from '../../athena-plugin-factions/shared/interfaces.js';

export interface FactionRank extends Partial<interfaces.FactionRank> {
    paycheck?: number;
}

export interface FactionCharacter extends Partial<interfaces.FactionCharacter> {
    nextPaycheck?: number;
}
