var AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const CONNECTIONS_TABLE = process.env.TABLE_NAME;

exports.handler = async (event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));
    const connectionId = event.requestContext.connectionId;
    const body = JSON.parse(event.body);

    const userId = body.userId;
    const startAutoColor = body.startAutoColor;
    const group = body.group;
    const pairName = body.pairName;

    const putParams = {
        TableName: CONNECTIONS_TABLE,
        Item: {
            connectionId: connectionId,
            ID: userId,
            startAutoColor: startAutoColor,
            group: group,
            pairName: pairName
        },
    };

    try {
        await dynamoDb.put(putParams).promise();
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Data received and stored successfully' }),
        };
    } catch (error) {
        console.error('Error saving data:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to save data' }),
        };
    }
};
