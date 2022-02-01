'use strict';

// require('./dbConnect');

const { App } = require('@slack/bolt');

const DEBUG = false;
// Idea: Create a karma-logs channel and if debug is set - post to that channel the logging of this bolt script

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  // port: process.env.PORT || 3000 // Not for socket mode... 
});

// https://slack.dev/bolt-js/tutorial/getting-started

/**
 * <name>++ | <name> ++   : Adds karma to a user
 * <name>-- | <name> --   : Removes karma from a user
 * karma <name>           : Shows karma for the named user
 * karma all              : Shows all users karma
 * karma                  : Shows this list of commands
 */

app.event('message', async ({ event, client, logger }) => {
  const usersList = await client.users.list();
  const activeUsers = usersList.members.filter(user => !user.is_bot && !user.deleted && user.name !== 'slackbot');

  try {
    if (/^([A-z.]+\s?)(\+\+|--)$/.test(event?.text)) { // ^(<name>++|<name> ++|<name>--| <name> --)$
      const match = event.text.match(/^([A-z.]+\s?)(\+\+|--)$/);
      const targetUserId = match[1].trim().replace('>', '');
      // TODO: Add and remove karma from user in the db
      // real_name and name could both match...
      const possibleUsers = activeUsers.filter(user => user.name === targetUserId || user.real_name === targetUserId);
      if (possibleUsers?.length === 1) {
        const userToKarma = possibleUsers[0];

        if (event.user === userToKarma.id) {
          await client.chat.postMessage({
            channel: event.channel,
            text: `Hey, you can't give yourself karma!`
          });
          return;
        }

        // TODO: add / remove karma

      } else if (possibleUsers?.length > 1) {
        await client.chat.postMessage({
          channel: event.channel,
          text: `Be more specific, I know ${possibleUsers.length} people named like that: ${possibleUsers.map(user => user.name).join(', ')}`
        });
        return;
      } else {
        await client.chat.postMessage({
          channel: event.channel,
          text: `Sorry, I don't recognize the user named ${targetUserId}`
        });
        return;
      }
    } else if (/^.*?@(.*)(\+\+|--).*?/.test(event?.text)) { // .* (@<name>++|@<name> ++|@<name>--| @<name> --) .*
      const match = event.text.match(/^.*?@(.*)(\+\+|--).*?/);
      const targetUserId = match[1].trim().replace('>', '');
      const userToKarma = activeUsers.find(user => user.id === targetUserId);
      if (!userToKarma) return;

      if (event.user === targetUserId) {
        await client.chat.postMessage({
          channel: event.channel,
          text: `Hey, you can't give yourself karma!`
        });
        return;
      }

      // TODO: add / remove karma

      // await client.chat.postMessage({
      //   channel: event.channel,
      //   text: `${userToKarma.real_name} now has _ karma.`
      // });
    } else if (/^karma all/.test(event?.text)) {
      // TODO: List all users karma from the db
      // await client.chat.postMessage({
      //   channel: event.channel,
      //   text: `3 ${event.text}`
      // });
    } else if (/^karma/.test(event?.text)) {
      await client.chat.postMessage({
        channel: event.channel,
        text: `Commands: 
          - *'@<name>++ | @<name>--'* adds or removes karma for a user
          - *'karma @<name>'* shows karma for the named user
          - *'karma all'* shows all users karma
          - *'karma'* shows this list of commands
        `
      });
    }
  }
  catch (error) {
    logger.error(error);
  }
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Karma listening active!');
})();
