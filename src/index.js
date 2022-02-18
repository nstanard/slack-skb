'use strict';
const { QLDB } = require('aws-sdk');
const app = require('./init');
const { scan } = require('./db');
const { listen, state } = require('./constants');

/**
 * <name>++ | <name> ++   : Adds karma to a user
 * <name>-- | <name> --   : Removes karma from a user
 * karma <name>           : Shows karma for the named user
 * karma all              : Shows all users karma
 * karma                  : Shows this list of commands
 */

const syndDbAndListen = async function () {
	const dbScan = await scan();
	dbScan.reduce((acc, item) => {
		acc[item.id] = item;
		return acc;
	}, state);

	listen(app);
};

(async () => {
	await syndDbAndListen();
	
	// Start your app
	await app.start(process.env.PORT || 3000);
	console.log('⚡️ Karma listening active!');
})();
