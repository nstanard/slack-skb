'use strict';
const app = require('./appInit');
const { listen } = require('./constants');

/**
 * <name>++ | <name> ++   : Adds karma to a user
 * <name>-- | <name> --   : Removes karma from a user
 * karma <name>           : Shows karma for the named user
 * karma all              : Shows all users karma
 * karma                  : Shows this list of commands
 */

listen(app);

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Karma listening active!');
})();
