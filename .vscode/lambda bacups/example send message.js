///we will change it to get the user secondsOffered, save it to the user record and to the couple's one
///check if other user already answer. IF YES:
///evaluate if deal done and write to the relevent records
///send message to the other user ( tell him if the deal done and maybe the offered seconds)
///send it to the user, too

const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
const apigatewaymanagementapi = new AWS.ApiGatewayManagementApi({
    endpoint: process.env.API_GATEWAY_ENDPOINT
});

exports.handler = async (event) => {
    const { targetId, message } = JSON.parse(event.body);
    const tableName = process.env.TABLE_NAME;

    // Get connection ID of the target client
    const result = await dynamo.get({
        TableName: tableName,
        Key: {
            connectionId: targetId
        }
    }).promise();

    const connectionId = result.Item ? result.Item.connectionId : null;

    if (connectionId) {
        // Send message to the target client
        await apigatewaymanagementapi.postToConnection({
            ConnectionId: connectionId,
            Data: JSON.stringify({ message })
        }).promise();
    }

    return {
        statusCode: 200,
        body: 'Message sent.'
    };
};
