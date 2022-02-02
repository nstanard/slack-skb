'use strict';
// require('./dbConnect');
const { App } = require('@slack/bolt');
const { postMessage } = require('./functions');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  // port: process.env.PORT || 3000 // Not for socket mode... 
});

const MATCH_FROM_START_PATTERN = /^([A-z.]+\s?)(\+\+|--)$/;
const MATCH_ANYWHERE_PATTERN = /^.*?@(.*)(\+\+|--).*?/;

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
    if (MATCH_FROM_START_PATTERN.test(event?.text)) { // ^(<name>++|<name> ++|<name>--| <name> --)$
      const match = event.text.match(MATCH_FROM_START_PATTERN);
      const operator = match[2];
      const targetUserId = match[1].trim().replace('>', '');
      const possibleUsers = activeUsers.filter(user => user.name === targetUserId || user.real_name === targetUserId);
      if (possibleUsers?.length === 1) {
        const userToKarma = possibleUsers[0];

        if (event.user === userToKarma.id) {
          await postMessage(client, event, `Hey, you can't give yourself karma!`);
          return;
        }

        await postMessage(client, event, `${userToKarma.real_name} now has _ karma.`); // AWARD KARMA AND REPORT
      } else if (possibleUsers?.length > 1) {
        await postMessage(client, event, `Be more specific, I know ${possibleUsers.length} people named like that: ${possibleUsers.map(user => user.name).join(', ')}`);
        return;
      } else {
        await postMessage(client, event, `Sorry, I don't recognize the user named ${targetUserId}`);
        return;
      }
    } else if (MATCH_ANYWHERE_PATTERN.test(event?.text)) { // .* (@<name>++|@<name> ++|@<name>--| @<name> --) .*
      const match = event.text.match(MATCH_ANYWHERE_PATTERN);
      const operator = match[2];
      const targetUserId = match[1].trim().replace('>', '');
      const userToKarma = activeUsers.find(user => user.id === targetUserId);
      if (!userToKarma) return;

      if (event.user === userToKarma.id) {
        await postMessage(client, event, `Hey, you can't give yourself karma!`);
        return;
      }

      await postMessage(client, event, `${userToKarma.real_name} now has _ karma.`); // AWARD KARMA AND REPORT
    } else if (/^karma all/.test(event?.text)) {
      // TODO: List all users karma from the db
    } else if (/^karma/.test(event?.text)) {
      await postMessage(client, event, `Commands: 
        - *'@<name>++ | @<name>--'* adds or removes karma for a user
        - *'karma @<name>'* shows karma for the named user
        - *'karma all'* shows all users karma
        - *'karma'* shows this list of commands
      `);
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
