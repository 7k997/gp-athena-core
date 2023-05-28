import * as alt from 'alt-server';
import * as Athena from '@AthenaServer/api';
import { AllowListConfig } from './config';
import axios from 'axios';
import { DiscordUser } from './interfaces';

const PLUGIN_NAME = 'discord-allow-list';
const AXIOS_REQUEST = 'https://discord.com/api/guilds/$GUILD_ID/members/$MEMBER_ID';

let isEnabled = true;

/**
 * Turn the allow list on / off.
 *
 * @param {boolean} isAllowListEnabled
 */
function enableAllowList(isAllowListEnabled: boolean) {
    isEnabled = isAllowListEnabled;
    alt.logWarning(isEnabled ? 'Allow List Turned On' : 'Allow List Turned Off');
}

/**
 * This function retrieves a Discord user's information using their ID and an authorization token.
 *
 * @param {string} discord - The Discord ID of the member whose information is being retrieved.
 * @returns a Promise that resolves to a DiscordUser object. If there is an error or the result is
 * undefined, it will return undefined.
 */
async function getMember(discord: string): Promise<DiscordUser> {
    const options = {
        headers: {
            Authorization: `Bot ${AllowListConfig.token}`,
        },
    };

    const result = await axios
        .get(AXIOS_REQUEST.replace('$GUILD_ID', AllowListConfig.guild).replace('$MEMBER_ID', discord), options)
        .catch((err) => {
            return undefined;
        });

    if (typeof result === 'undefined' || !result || !result.data) {
        return undefined;
    }

    return result.data as DiscordUser;
}

/**
 * This function checks if a player is on an allow list by verifying their Discord membership.
 *
 * If they have the correct role as well; then they are permitted in the server.
 */
async function checkAllowList(player: alt.Player) {
    if (!isEnabled) {
        return;
    }

    const account = Athena.document.account.get(player);
    if (typeof account === 'undefined') {
        player.kick(AllowListConfig.responses.notOnList);
        return;
    }

    const discord = account.discord;
    if (typeof discord === 'undefined') {
        player.kick(AllowListConfig.responses.noDiscordForAccount);
        return;
    }

    const guildMember = await getMember(discord);
    if (typeof guildMember === 'undefined') {
        player.kick(AllowListConfig.responses.notInDiscordServer);
        return;
    }

    const roleIndex = guildMember.roles.findIndex((x) => x === AllowListConfig.role);
    if (roleIndex <= -1) {
        alt.log(`Kicked ${guildMember.user.username}#${guildMember.user.discriminator}, not allow listed.`);
        player.kick(AllowListConfig.responses.notAllowListed);
        return;
    }

    alt.log(`Allow Listed ${guildMember.user.username}#${guildMember.user.discriminator}`);
}

const API = {
    enableAllowList,
    getMember,
};

Athena.systems.plugins.registerPlugin(PLUGIN_NAME, async () => {
    let failed = false;
    if (AllowListConfig.guild === '') {
        alt.logWarning(`Could not start allow list, missing guild id`);
        failed = true;
    }

    if (AllowListConfig.role === '') {
        alt.logWarning(`Could not start allow list, missing role id`);
        failed = true;
    }

    if (AllowListConfig.token === '') {
        alt.logWarning(`Could not start allow list, missing bot secret token`);
        failed = true;
    }

    if (failed) {
        return;
    }

    Athena.systems.plugins.addAPI(PLUGIN_NAME, API);
    Athena.player.events.on('set-account-data', checkAllowList);
});

declare global {
    export interface ServerPluginAPI {
        [PLUGIN_NAME]: typeof API;
    }
}


