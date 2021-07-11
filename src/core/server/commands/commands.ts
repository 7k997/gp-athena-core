import * as alt from 'alt-server';

import { SYSTEM_EVENTS } from '../../shared/enums/system';

import './adminChat';
import './audioStream';
import './currency';
import './death';
import './debugVehicle';
import './interior';
import './item';
import './job';
import './noclip';
import './position';
import './revive';
import './roleplay';
import './seatbelt';
import './setArmour';
import './setFood';
import './setHealth';
import './setWater';
import './updateweather';
import './vehicle';
import './weapon';
import './whitelist';

alt.emit(SYSTEM_EVENTS.COMMANDS_LOADED);
