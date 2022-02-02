'use strict';

async function postMessage(client, event, message) {
    return await client.chat.postMessage({
        channel: event.channel,
        text: message
    });
}

export {
    postMessage
};
