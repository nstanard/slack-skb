'use strict';
var AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });
var dynamo = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = 'slack-skb-db';

const getScanParams = ({ id, name, realName, karma }) => {
	return {
		TableName: TABLE_NAME,
	};
};

const scan = async () => {
	let res;
	try {
		res = await dynamo.scan(getScanParams({})).promise();
	} catch (error) {}
	return res?.Items;
};

const getDynamoWriteParams = ({ id, name, realName, karma }) => {
	return {
		TableName: TABLE_NAME,
		Item: {
			id: id,
			name,
			realName,
			karma,
		},
	};
};

const writeToDb = ({ id, name, realName, karma }) => {
	return new Promise((resolve, _reject) => {
		return dynamo.put(getDynamoWriteParams({ id, name, realName, karma }), function (err, data) {
			if (err) {
				resolve({});
			} else {
				resolve(data);
			}
		});
	});
};

const getSingleReadParam = (id) => {
	return {
		TableName: TABLE_NAME,
		Key: {
			id: id,
		},
	};
};

const getUser = async (id) => {
	return new Promise((resolve, _reject) => {
		dynamo.get(getSingleReadParam(id), function (err, data) {
			if (err) {
				resolve({});
			} else {
				resolve(data?.Item);
			}
		});
	});
};

module.exports = {
	scan,
	getDynamoWriteParams,
	writeToDb,
	getSingleReadParam,
	getUser,
};
