import * as alt from 'alt-server';
import * as Athena from '@AthenaServer/api/index.js';
import { LOCALE_KEYS } from '@AthenaShared/locale/languages/keys.js';
import { LocaleController } from '@AthenaShared/locale/locale.js';

export class DeathCommands {
    static init() {
        Athena.systems.messenger.commands.register(
            'revive',
            [LOCALE_KEYS.COMMAND_REVIVE, '/revive'],
            ['admin'],
            DeathCommands.handleRevive,
        );

        alt.log(`Death Commands Loaded`);
    }

    private static handleRevive(player: alt.Player, id: string | null = null): void {
        const playerData = Athena.document.character.get(player);

        if (id === null || id === undefined) {
            if (!playerData.isDead) {
                return;
            }

            Athena.player.set.respawned(player, player.pos);
            return;
        }

        const target = Athena.systems.identifier.getPlayer(id);
        if (!target) {
            Athena.player.emit.message(player, Athena.locale.get(player, LOCALE_KEYS.CANNOT_FIND_PLAYER));
            return;
        }

        if (!playerData.isDead) {
            return;
        }

        Athena.player.set.respawned(target, target.pos);
    }
}
