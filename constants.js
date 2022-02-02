'use strict';

const MATCH = {
	START_PATTERN: /^([A-z.]+\s?)(\+\+|--)$/,
	ANYWHERE_PATTERN: /^.*?@(.*)(\+\+|--).*?/,
};

async function postMessage(client, event, message) {
	return await client.chat.postMessage({
		channel: event.channel,
		text: message
	});
}

const state = {};
const listen = function (app) {
	return app.event('message', async ({ event, client, logger }) => {
		const usersList = await client.users.list();
		const activeUsers = usersList.members.filter(user => !user.is_bot && !user.deleted && user.name !== 'slackbot');
		
		try {
			if (MATCH.START_PATTERN.test(event?.text)) { // ^(<name>++|<name> ++|<name>--| <name> --)$
				const match = event.text.match(MATCH.START_PATTERN);
				const operator = match[2];
				const targetUserId = match[1].trim().replace('>', '');
				const possibleUsers = activeUsers.filter(user => user.name === targetUserId || user.real_name === targetUserId);
				if (possibleUsers?.length === 1) {
					const userToKarma = possibleUsers[0];
					
					if (event.user === userToKarma.id) {
						await postMessage(client, event, `Hey, you can't give yourself karma!`);
						return;
					}
					
					if (!state[userToKarma.real_name]) {
						if (operator === '++') state[userToKarma.real_name] = 1;
						if (operator === '--') state[userToKarma.real_name] = -1;
					} else {
						if (operator === '++') state[userToKarma.real_name]++;
						if (operator === '--') state[userToKarma.real_name]--;
					}

					await postMessage(client, event, `${userToKarma.real_name} now has ${state[userToKarma.real_name]} karma.`); // AWARD KARMA AND REPORT
				} else if (possibleUsers?.length > 1) {
					await postMessage(client, event, `Be more specific, I know ${possibleUsers.length} people named like that: ${possibleUsers.map(user => user.name).join(', ')}`);
					return;
				} else {
					await postMessage(client, event, `Sorry, I don't recognize the user named ${targetUserId}`);
					return;
				}
			} else if (MATCH.ANYWHERE_PATTERN.test(event?.text)) { // .* (@<name>++|@<name> ++|@<name>--| @<name> --) .*
				const match = event.text.match(MATCH.ANYWHERE_PATTERN);
				const operator = match[2];
				const targetUserId = match[1].trim().replace('>', '');
				const userToKarma = activeUsers.find(user => user.id === targetUserId);
				if (!userToKarma) return;
				
				if (event.user === userToKarma.id) {
					await postMessage(client, event, `Hey, you can't give yourself karma!`);
					return;
				}
				
				if (!state[userToKarma.real_name]) {
					if (operator === '++') state[userToKarma.real_name] = 1;
					if (operator === '--') state[userToKarma.real_name] = -1;
				} else {
					if (operator === '++') state[userToKarma.real_name]++;
					if (operator === '--') state[userToKarma.real_name]--;
				}
				
				users.insert({ name: userToKarma.real_name, points: newPointValue });
				await postMessage(client, event, `${userToKarma.real_name} now has ${state[userToKarma.real_name]} karma.`); // AWARD KARMA AND REPORT
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
};

module.exports = {
	listen
};
