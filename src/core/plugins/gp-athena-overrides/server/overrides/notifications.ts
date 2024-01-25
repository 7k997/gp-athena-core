import * as Athena from '@AthenaServer/api/index.js';
import * as alt from 'alt-server';
import { Config } from "@AthenaPlugins/gp-athena-overrides/shared/config.js";

let Notify = null;

const defaultNotification = {
    icon: '',
    title: '',
    subTitle: '',
    message: '',
    oggFile: Config.DEFAULT_NOTIFICATION_SOUND,
};

export class Notifications {
    static async init() {
        if (Config.ACTIVATE_NOTIFICATION_REPLACEMENT) {
            Athena.player.emit.override('notification', Notifications.notify);
            Notify = await Athena.systems.plugins.useAPI('notification-api');
        }
    }

    static notify(player: alt.Player, message: string) {
        if (!Notify) {
            return;
        }

        const notificationParams = message.includes('|')
            ? message.split('|').reduce((acc, val, index) => ({ ...acc, [Object.keys(defaultNotification)[index]]: val }), {})
            : { message };

        Notify.addNotification(player, { ...defaultNotification, ...notificationParams, duration: Config.DEFAULT_NOTIFICATION_DURATION });
    }
}