import * as alt from 'alt-server';
import * as Athena from '@AthenaServer/api/index.js';

import { BankAccountNumber } from './src/bankAccountNumber.js';
import { AtmFunctions } from './src/view.js';

const PLUGIN_NAME = 'Athena ATM';

Athena.systems.plugins.registerPlugin(PLUGIN_NAME, () => {
    AtmFunctions.init();
    BankAccountNumber.init();
    alt.log(`~lg~CORE ==> ${PLUGIN_NAME} was Loaded`);
});
