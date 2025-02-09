import * as alt from 'alt-client';
import * as AthenaClient from '@AthenaClient/api/index.js';
import { PLAYER_SYNCED_META } from '../../../../shared/enums/playerSynced.js';
import { Interior } from '../../shared/interfaces.js';
import { INTERIOR_INTERACTIONS } from '../../shared/enums.js';
import { LOCALE_INTERIOR_VIEW } from '../../shared/locales.js';
import { IWheelOptionExt } from '../../../../shared/interfaces/wheelMenu.js';
import { PushVehicle } from '@AthenaPlugins/gp-athena-utils/client/src/systems/push.js';
import { InputOptionType, InputResult } from '@AthenaPlugins/gp-athena-utils/shared/interfaces/inputMenus.js';
import { InputView } from '@AthenaPlugins/gp-athena-utils/client/src/views/input.js';

function initialCheck(): boolean {
    if (alt.Player.local.vehicle) {
        return false;
    }

    if (AthenaClient.webview.isAnyMenuOpen()) {
        return false;
    }

    if (PushVehicle.isPushing()) {
        return false;
    }

    return true;
}

function showMenu(interior: Interior, isOutside: boolean = true) {
    if (isOutside) {
        enterMenu(interior);
        return;
    }

    exitMenu(interior);
}

function enterMenu(interior: Interior) {
    if (!initialCheck) {
        return;
    }

    const options: IWheelOptionExt[] = [];
    const playerIdentifier = alt.Player.local.getSyncedMeta(PLAYER_SYNCED_META.DATABASE_ID);
    const isOwner = interior.owner === playerIdentifier;

    const toggleLockFunc = () => {
        alt.emitServer(INTERIOR_INTERACTIONS.TOGGLE_LOCK, interior.uid);
    };

    options.push({
        name: interior.isUnlocked
            ? `${LOCALE_INTERIOR_VIEW.LABEL_TRY_LOCK}`
            : `${LOCALE_INTERIOR_VIEW.LABEL_TRY_UNLOCK}`,
        callback: toggleLockFunc,
        color: 'yellow',
    });

    options.push({
        name: 'UID',
        callback: () => {
            console.log(`===> ${interior.name}`);
            console.log(`UID: ${interior.uid}`);
        },
        color: 'blue',
    });

    // Ownership Related Menu Functions
    if (isOwner) {
        options.push({
            name: LOCALE_INTERIOR_VIEW.LABEL_SET_SALE_PRICE,
            callback: () => {
                const InputMenu = {
                    title: LOCALE_INTERIOR_VIEW.LABEL_SALE_PRICE,
                    options: [
                        {
                            id: 'price',
                            desc: LOCALE_INTERIOR_VIEW.LABEL_SALE_PLACHOLDER,
                            type: InputOptionType.NUMBER,
                            placeholder: '25000',
                        },
                    ],
                    callback: (results: InputResult[]) => {
                        // Re-show this menu if it fails to find the value.
                        if (results.length <= 0) {
                            InputView.setMenu(InputMenu);
                            return;
                        }

                        // Check that there is a result.
                        const data = results.find((x) => x && x.id === 'price');
                        if (!data) {
                            InputView.setMenu(InputMenu);
                            return;
                        }

                        alt.emitServer(INTERIOR_INTERACTIONS.SET_PRICE, interior.uid, parseInt(data.value));
                    },
                };

                InputView.setMenu(InputMenu);
            },
        });

        options.push({
            name: LOCALE_INTERIOR_VIEW.LABEL_SET_HOUSE_NAME,
            callback: () => {
                const InputMenu = {
                    title: LOCALE_INTERIOR_VIEW.LABEL_SET_HOUSE_NAME,
                    options: [
                        {
                            id: 'name',
                            desc: LOCALE_INTERIOR_VIEW.LABEL_SET_HOUSE_NAME_PLACEHOLDER,
                            type: InputOptionType.TEXT,
                            placeholder: `Stuyks House`,
                            regex: '^[a-zA-Z0-9 ]{1,24}$', // Matches 3 to 24 Characters
                            error: '3-24 Characters. No Special Characters.',
                        },
                    ],
                    callback: (results: InputResult[]) => {
                        // Re-show this menu if it fails to find the value.
                        if (results.length <= 0) {
                            InputView.setMenu(InputMenu);
                            return;
                        }

                        // Check that there is a result.
                        const data = results.find((x) => x && x.id === 'name');
                        if (!data) {
                            InputView.setMenu(InputMenu);
                            return;
                        }

                        alt.emitServer(INTERIOR_INTERACTIONS.SET_NAME, interior.uid, data.value);
                    },
                };

                InputView.setMenu(InputMenu);
            },
        });
    }

    if (!isOwner && interior.price >= 1) {
        options.push({
            name: `${LOCALE_INTERIOR_VIEW.LABEL_PURCHASE} $${interior.price}`,
            callback: () => {
                alt.emitServer(INTERIOR_INTERACTIONS.PURCHASE, interior.uid);
            },
        });
    }

    if (interior.isUnlocked) {
        options.push({
            name: `${LOCALE_INTERIOR_VIEW.LABEL_ENTER}`,
            callback: () => {
                alt.emitServer(INTERIOR_INTERACTIONS.ENTER, interior.uid);
            },
            color: 'orange',
        });
    }

    AthenaClient.systems.wheelMenu.open(`${interior.name}`, options);
}

function exitMenu(interior: Interior) {
    if (!initialCheck) {
        return;
    }

    const options: IWheelOptionExt[] = [];

    const playerIdentifier = alt.Player.local.getSyncedMeta(PLAYER_SYNCED_META.DATABASE_ID);
    const isOwner = interior.owner === playerIdentifier;
    const toggleLockFunc = () => {
        alt.emitServer(INTERIOR_INTERACTIONS.TOGGLE_LOCK, interior.uid);
    };

    options.push({
        name: interior.isUnlocked
            ? `${LOCALE_INTERIOR_VIEW.LABEL_TRY_LOCK}`
            : `${LOCALE_INTERIOR_VIEW.LABEL_TRY_UNLOCK}`,
        icon: 'fas fa-lock',
        callback: toggleLockFunc,
        color: interior.isUnlocked ? `green` : `red`,
    });

    // options.push({
    //     name: 'UID',
    //     callback: () => {
    //         console.log(`===> ${interior.name}`);
    //         console.log(`UID: ${interior.uid}`);
    //     },
    // });

    // Ownership Related Menu Functions
    if (isOwner) {
        options.push({
            name: LOCALE_INTERIOR_VIEW.LABEL_STORAGE,
            callback: () => {
                alt.emitServer(INTERIOR_INTERACTIONS.STORAGE, interior.uid);
            },
            color: 'lime',
        });
    }

    options.push({
        name: `${LOCALE_INTERIOR_VIEW.LABEL_EXIT}`,
        callback: () => {
            alt.emitServer(INTERIOR_INTERACTIONS.EXIT, interior.uid);
        },
        color: `red`,
    });

    AthenaClient.systems.wheelMenu.open(`${interior.name}`, options);
}

alt.onServer(INTERIOR_INTERACTIONS.SHOW_MENU, showMenu);
