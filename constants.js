'use strict';

const MATCH = {
	START_PATTERN: /^([A-z0-9.]+\s?)(\+\+|--)$/,
	ANYWHERE_PATTERN: /^.*?@(.*)(\+\+|--).*?/,
};

const OPERATORS = {
	PLUS: '++',
	MINUS: '--'
}

const postMessage = async function(client, event, message) {
	return await client.chat.postMessage({
		channel: event.channel,
		text: message
	});
}

const state = {};

const adjustKarma = function(state, userToKarma, operator) {
	if (operator === OPERATORS.PLUS) addKarma(state, userToKarma);
	if (operator === OPERATORS.MINUS) removeKarma(state, userToKarma);
}

const addKarma = function(state, userToKarma) {
	if (!state[userToKarma.real_name]) state[userToKarma.real_name] = 1;
	else if (state[userToKarma.real_name]) state[userToKarma.real_name]++;
};

const removeKarma = function(state, userToKarma) {
	if (!state[userToKarma.real_name]) state[userToKarma.real_name] = -1;
	else if (state[userToKarma.real_name]) state[userToKarma.real_name]--;
}

const getTargetUserAndOperator = function(text) {
	const match = text.match(MATCH.START_PATTERN);
	const operator = match[2];
	const targetUserId = match[1].trim().replace('>', '');
	return {
		operator,
		targetUserId
	};
}

const getTupplesFromState = function(params) {
	return Object.entries(state);
}

const getFormattedUserList = function() {
	return getTupplesFromState().reduce((acc, item, ind) => {
		return acc + `${ind}. ${item[0]}: ${item[1]}` + '\n'
	}, '');
}

const listen = function (app) {
	return app.event('message', async ({ event, client, logger }) => {
		const usersList = await client.users.list();
		const activeUsers = usersList.members.filter(user => !user.is_bot && !user.deleted && user.name !== 'slackbot');

		try {
			if (MATCH.START_PATTERN.test(event?.text)) { // ^(<name>++|<name> ++|<name>--| <name> --)$
				const { operator, targetUserId } = getTargetUserAndOperator(event.text);
				// lowercase and check both name and real_name
				const possibleUsers = activeUsers.filter(user => user.name.toLowerCase() === targetUserId.toLowerCase() || user.real_name.toLowerCase() === targetUserId.toLowerCase());
				if (possibleUsers?.length === 1) {
					const userToKarma = possibleUsers[0];
					if (!userToKarma) {
						await postMessage(client, event, `Failed to find a possible user.`);
						return;
					} else if (operator === OPERATORS.PLUS && event.user === userToKarma.id) {
						await postMessage(client, event, `Hey, you can't give yourself karma!`);
						return;
					}

					adjustKarma(state, userToKarma, operator);
					await postMessage(client, event, `${userToKarma.real_name} now has ${state[userToKarma.real_name]} karma.`); // AWARD KARMA AND REPORT
				} else if (possibleUsers?.length > 1) {
					await postMessage(client, event, `Be more specific, I know ${possibleUsers.length} people named like that: ${possibleUsers.map(user => user.name).join(', ')}`);
					return;
				} else {
					await postMessage(client, event, `Sorry, I don't recognize the user named ${targetUserId}`);
					return;
				}
			} else if (MATCH.ANYWHERE_PATTERN.test(event?.text)) { // .* (@<name>++|@<name> ++|@<name>--| @<name> --) .*
				const { operator, targetUserId } = getTargetUserAndOperator(event.text);
				const userToKarma = activeUsers.find(user => user.id === targetUserId); // targetUserId is a unique ID here as a result of the @ syntax
				if (!userToKarma) {
					await postMessage(client, event, `Failed to find a possible user.`);
					return;
				} else if (operator === OPERATORS.PLUS && event.user === userToKarma.id) {
					await postMessage(client, event, `Hey, you can't give yourself karma!`);
					return;
				}

				console.log('userToKarma: ', JSON.parse(JSON.stringify(userToKarma)));
				adjustKarma(state, userToKarma, operator);
				await postMessage(client, event, `${userToKarma.real_name} now has ${state[userToKarma.real_name]} karma.`); // AWARD KARMA AND REPORT
			} else if (/^karma all/.test(event?.text)) {
				const userList = getFormattedUserList();
				await postMessage(client, event, userList); // AWARD KARMA AND REPORT
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
