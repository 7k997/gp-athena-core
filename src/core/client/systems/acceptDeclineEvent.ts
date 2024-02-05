import * as alt from 'alt-client';
import * as AthenaClient from '@AthenaClient/api/index.js';

import { onTicksStart } from '@AthenaClient/events/onTicksStart.js';
import { SYSTEM_EVENTS } from '@AthenaShared/enums/system.js';
import { AcceptDeclineEvent } from '@AthenaShared/interfaces/acceptDeclineEvent.js';
import { KEY_BINDS } from '@AthenaShared/enums/keyBinds.js';

let lastEvent: AcceptDeclineEvent;

async function handleOpen() {
    if (typeof lastEvent === 'undefined') {
        return;
    }

    if (AthenaClient.webview.isAnyMenuOpen()) {
        return;
    }

    const result = await AthenaClient.rmlui.question.create({ placeholder: lastEvent.question, blur: true });
    const eventToCall = result ? lastEvent.onClientEvents.accept : lastEvent.onClientEvents.decline;
    alt.emitServer(eventToCall, lastEvent.data);
    lastEvent = undefined;
}

function setAcceptDeclineEvent(event: AcceptDeclineEvent) {
    lastEvent = event;
}

function init() {
    AthenaClient.systems.hotkeys.add({
        key: KEY_BINDS.ACCEPT_DECLINE_EVENT_PROMPT,
        description: 'Accept / Decline Event Prompt',
        identifier: 'accept-decline-event-prompt',
        keyDown: handleOpen,
    });

    alt.onServer(SYSTEM_EVENTS.ACCEPT_DECLINE_EVENT_SET, setAcceptDeclineEvent);
}

onTicksStart.add(init);
