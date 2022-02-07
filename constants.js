'use strict';
var AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });
var dynamo = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME =  'slack-skb-db';

const getDynamoWriteParams = (id, name, realName, karma) => {
	return {
		TableName: TABLE_NAME,
		Item: {
			"id": id,
			name,
			realName,
			karma,
		},
	};
}

const writeToDb = (id, name, realName, karma) => {
	return dynamo.put(getDynamoWriteParams(id, name, realName, karma), function(err, data) {
		if (err) {
			console.log("Error", err);
		} else {
			console.log("Success", data);
		}
	});
}

const getDynamoReadParams = (id, name, realName, karma) => {
	return {
		TableName: TABLE_NAME,
		Key: {
			"id": id
		},
	};
}

const getUser = async (id) => {
	return new Promise((resolve, reject) => {
		dynamo.get(getDynamoReadParams(id), function(err, data) {
			if (err) {
				resolve({});
			} else {
				resolve(data?.Item);
			}
		});
	});
}
// const data = await getUser(targetUserId);

const state = {};

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

const adjustKarma = function(state, userToKarma, operator) {
	if (operator === OPERATORS.PLUS) addKarma(state, userToKarma);
	if (operator === OPERATORS.MINUS) removeKarma(state, userToKarma);
}

const addKarma = function(state, userToKarma) {
	
	// if (!state[userToKarma.real_name]) state[userToKarma.real_name] = 1;
	// else if (state[userToKarma.real_name]) state[userToKarma.real_name]++;
};

const removeKarma = function(state, userToKarma) {
	
	// if (!state[userToKarma.real_name]) state[userToKarma.real_name] = -1;
	// else if (state[userToKarma.real_name]) state[userToKarma.real_name]--;
}

const getTargetUserAndOperator = function(text, pattern) {
	const match = text.match(pattern);
	const operator = match[2];
	const targetUserId = match[1].trim().replace('>', '');
	return {
		operator,
		targetUserId
	};
}

const getTupplesFromState = function(params) {
	dynamoDB
	.scan({
		TableName: "slack-skb-db",
	})
	.promise()
	.then(data => {
		console.log(data.Items);
		return Object.entries(state);
	})
	.catch(console.error)
}

const getFormattedUserList = function() {
	return getTupplesFromState().reduce((acc, item, ind) => {
		return acc + `${ind}. ${item[0]}: ${item[1]}` + '\n'
	}, '');
}

const userIsGivingSelfKarma = async function(client, event, operator, userToKarma) {
	if (!userToKarma) {
		await postMessage(client, event, `Failed to find a possible user.`);
		return 1;
	} else if (operator === OPERATORS.PLUS && event.user === userToKarma.id) {
		await postMessage(client, event, `Hey, you can't give yourself karma!`);
		return 1;
	}
	
	return 0;
}

const listen = async function (app) {
	return app.event('message', async ({ event, client, logger }) => {
		const usersList = await client.users.list();
		const activeUsers = usersList.members.filter(user => !user.is_bot && !user.deleted && user.name !== 'slackbot');
		
		try {
			if (MATCH.START_PATTERN.test(event?.text)) {
				const { operator, targetUserId } = getTargetUserAndOperator(event.text, MATCH.START_PATTERN);
				const possibleUsers = activeUsers.filter(user => user.name.toLowerCase() === targetUserId.toLowerCase() || user.real_name.toLowerCase() === targetUserId.toLowerCase());
				if (possibleUsers?.length === 1) {
					const userToKarma = possibleUsers[0];
					if (userIsGivingSelfKarma(client, event, operator, userToKarma)) return;
					adjustKarma(state, userToKarma, operator);
					await postMessage(client, event, `${userToKarma.real_name} now has ${state[userToKarma.real_name]} karma.`);
				} else if (possibleUsers?.length > 1) {
					await postMessage(client, event, `Be more specific, I know ${possibleUsers.length} people named like that: ${possibleUsers.map(user => user.name).join(', ')}`);
					return;
				} else {
					await postMessage(client, event, `Sorry, I don't recognize the user named ${targetUserId}`);
					return;
				}
			} else if (MATCH.ANYWHERE_PATTERN.test(event?.text)) {
				const { operator, targetUserId } = getTargetUserAndOperator(event.text, MATCH.ANYWHERE_PATTERN);
				const userToKarma = activeUsers.find(user => user.id === targetUserId);
				// console.log('userToKarma: ', JSON.parse(JSON.stringify(userToKarma)));
				// console.log('data: ', JSON.parse(JSON.stringify(data)));
				// writeToDb(targetUserId, userToKarma.name, userToKarma.real_name, 1);
				// if (userIsGivingSelfKarma(client, event, operator, userToKarma)) return;
				// adjustKarma(state, userToKarma, operator);
				// await postMessage(client, event, `${userToKarma.real_name} now has ${state[userToKarma.real_name]} karma.`);
			} else if (/^karma all/.test(event?.text)) {
				const userList = getFormattedUserList();
				await postMessage(client, event, userList);
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
