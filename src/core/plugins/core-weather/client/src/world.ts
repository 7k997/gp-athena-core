import * as alt from 'alt-client';
import * as native from 'natives';
import { WEATHER_EVENTS } from '@AthenaPlugins/core-weather/shared/events.js';
import { WORLD_WEATHER } from '@AthenaPlugins/core-weather/shared/weather.js';
import { Config } from '@AthenaPlugins/gp-athena-overrides/shared/config.js';
import { SYSTEM_EVENTS } from '@AthenaShared/enums/system.js';

let isTransitioning = false;
let isFrozen = false;

// Weather types:

// EXTRASUNNY
// CLEAR
// NEUTRAL
// SMOG
// FOGGY
// OVERCAST
// CLOUDS
// CLEARING
// RAIN
// THUNDER
// SNOW
// BLIZZARD
// SNOWLIGHT
// XMAS
// HALLOWEEN

export class World {
    static hasPausedClock = false;
    static prevWeather = 'Overcast';
    static weather: string;
    static hour: number = 0;
    static minute: number = 0;

    static init() {
        if (!Config.DISABLE_CORE_WEATHER_UPDATE_METHOD) {
        alt.onServer(WEATHER_EVENTS.UPDATE_WEATHER, World.updateWeather);
        }

        if (!Config.DISABLE_CORE_WEATHER_SYNC_INTERVAL) {
        alt.setInterval(World.getWeatherUpdate, Config.WEATHER_SYNC_INTERVAL);
        }
    }

    static getWeatherUpdate() {
        alt.log(`[Athena] Requesting weather update.`);
        alt.emitServer(WEATHER_EVENTS.GET_WEATHER_UPDATE);
    }

    /**
     * When the weather changes, update the weather and play the appropriate audio.
     * @param {string} name - The name of the weather.
     */
    static async updateWeather(nextWeather: string, timeInSeconds: number = 60) {
        if (isFrozen) {
            return;
        }

        if (timeInSeconds > 60) {
            timeInSeconds = 60;
        }

        const timeInMs = timeInSeconds * 1000;
        
        try {
            await alt.Utils.waitFor(() => isTransitioning === false, timeInMs);
        } catch (error) {
            alt.logError(`[Athena] Weather transition timed out.`);
        }

        isTransitioning = true;

        World.weather = nextWeather;

        if (World.weather !== World.prevWeather) {
            native.clearOverrideWeather();
            native.clearWeatherTypePersist();
            native.setWeatherTypeOvertimePersist(nextWeather, timeInSeconds);
            native.setWeatherTypePersist(nextWeather);

            World.prevWeather = World.weather;

            alt.setTimeout(() => {
                native.setWeatherTypeNow(nextWeather);
                native.setWeatherTypeNowPersist(nextWeather);
                isTransitioning = false;
            }, timeInMs - 500);

            if (World.weather === WORLD_WEATHER.XMAS) {
                native.useSnowWheelVfxWhenUnsheltered(true);
                native.useSnowFootVfxWhenUnsheltered(true);
                native.setPedFootstepsEventsEnabled(alt.Player.local, true);
                native.requestScriptAudioBank('ICE_FOOTSTEPS', true, 0);
                native.requestScriptAudioBank('SNOW_FOOTSTEPS', true, 0);
                return;
            }

            native.releaseNamedScriptAudioBank('ICE_FOOTSTEPS');
            native.releaseNamedScriptAudioBank('SNOW_FOOTSTEPS');
            native.useSnowWheelVfxWhenUnsheltered(false);
            native.useSnowFootVfxWhenUnsheltered(false);
        }
    }
}
