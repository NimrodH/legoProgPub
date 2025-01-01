///we will change it to get the user secondsOffered, save it to the user record and to the couple's one
///check if other user already answer. IF YES:
///evaluate if deal done and write to the relevent records
///send message to the other user ( tell him if the deal done and maybe the offered seconds)
///send it to the user, too

const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const apigatewaymanagementapi = new AWS.ApiGatewayManagementApi({
    endpoint: process.env.API_GATEWAY_ENDPOINT
});
const CONNECTIONS_TABLE = process.env.TABLE_NAME;

exports.handler = async (event) => {
    console.log("send message");
    const body = JSON.parse(event.body);

    const userId = body.userId;
    const startAutoColor = body.startAutoColor;
    const secondsOffered = body.secondsOffered;
    const part1Time = body.part1Time;

    try {
        ///update my record in the database with my offer and mypart1time
        await updateTableWithSecondsOffered(userId, startAutoColor, secondsOffered, part1Time);
        ///get my record to use myConnectionId later and ID of myPair to allowreding its record 
        const { myConnectionId, myPair, pairAutoColor } = await getMyPairInfo(userId, startAutoColor);
        ///get the record of my pair to use know if he live (connected) and his offer and connectionId from DB
        const { pairConnectionId, pairSecondsOffered, pairLive } = await getPairInfo(myPair, pairAutoColor);

        ///this not send message to client and exit the lambda (we will stay with default message to wait that client created  )
        ///(if pair is not connected we act in the same wa. he need to reconnect and end part1 - we will handle it elsewhere
        if (!pairSecondsOffered) {
            return respondWithMessage('pair is still playing', 'wait');
        }
       
        if (!pairLive) { 
             ////we know now that pairSecondsOffered exsists so pair disconnected after he end patr 1
             ///we could not send him our answer and he must reconnect using 9, when he will do it we will get message so we dont do anithing now and wait
             ///TODO: we can send to me message that game will continue after othe uset will restart using 9
             ///anyway we don't continue
             return;
        }

        ///we have now the pair connected after he end part1
        const doDeal = calculateDeal(startAutoColor, secondsOffered, pairSecondsOffered);
        await updateDealDone(userId, startAutoColor, doDeal);///update deal result in MY record on table lego_couple
        await updateDealDone(myPair, pairAutoColor, doDeal);///update deal result in PAIR record on table lego_couple
        
        ///send deal results with continue to both 
        const theBody = createResponseBody(doDeal, pairSecondsOffered, secondsOffered);
        console.log("before sendMessageToClients")
        await sendMessageToClients(myConnectionId, pairConnectionId, pairLive, theBody);

        return { statusCode: 200, body: JSON.stringify({ message: 'Message sent successfully' }) };
    } catch (error) {
        console.error('Error:', error);
        return { statusCode: 500, body: JSON.stringify({ message: 'Failed to process request' }) };
    }
};

async function updateTableWithSecondsOffered(userId, startAutoColor, secondsOffered, part1Time) {
    const params = {
        TableName: CONNECTIONS_TABLE,
        Key: { ID: userId, startAutoColor: startAutoColor },
        UpdateExpression: "set secondsOffered = :seconds, part1Time = :psrtTime",
        ExpressionAttributeValues: { ":seconds": secondsOffered, ":psrtTime": part1Time },
        ReturnValues: "ALL_NEW",
    };
    await dynamoDb.update(params).promise();
}

async function getMyPairInfo(userId, startAutoColor) {
    const params = {
        TableName: CONNECTIONS_TABLE,
        Key: { ID: userId, startAutoColor: startAutoColor },
    };
    const response = await dynamoDb.get(params).promise();
    if (!response.Item) throw new Error('Item not found');

    const myConnectionId = response.Item.connectionId;
    const myPair = response.Item.myPairId;
    const pairAutoColor = startAutoColor === "YES" ? "NO" : "YES";
    return { myConnectionId, myPair, pairAutoColor };
}

async function getPairInfo(myPair, pairAutoColor) {
    ///read from data base the record of pair
    const params = {
        TableName: CONNECTIONS_TABLE,
        Key: { ID: myPair, startAutoColor: pairAutoColor },
    };
    const response = await dynamoDb.get(params).promise();
    if (!response.Item) throw new Error('Item_pair not found');

    const pairConnectionId = response.Item.connectionId;
    const pairSecondsOffered = response.Item.secondsOffered;
    const pairLive = await isConnectionLive(pairConnectionId);
    if (!pairLive) throw new Error('pair is not connected anymore');

    return { pairConnectionId, pairSecondsOffered, pairLive };
}

function calculateDeal(startAutoColor, secondsOffered, pairSecondsOffered) {
    if (startAutoColor === "YES") {
        return parseInt(secondsOffered) <= parseInt(pairSecondsOffered);
    } else {
        return parseInt(secondsOffered) >= parseInt(pairSecondsOffered);
    }
}

async function updateDealDone(userId, startAutoColor, doDeal) {
    const params = {
        TableName: CONNECTIONS_TABLE,
        Key: { ID: userId, startAutoColor: startAutoColor },
        UpdateExpression: "set dealDone = :deal",
        ExpressionAttributeValues: { ":deal": doDeal },
        ReturnValues: "ALL_NEW",
    };
    await dynamoDb.update(params).promise();
}

function createResponseBody(doDeal, pairSecondsOffered, mySecondsOffered) {
    return {
        message: 'deal results are ' + doDeal,
        ansStatus: 'continue',
        isdealDone: doDeal,
        pairSecondsOffered: pairSecondsOffered,
        mySecondsOffered: mySecondsOffered
    };
}

async function sendMessageToClients(myConnectionId, pairConnectionId, pairLive, theBody) {
    if (myConnectionId) {
        console.log("sendMessageToClients me: " + myConnectionId);
        await apigatewaymanagementapi.postToConnection({
            ConnectionId: myConnectionId,
            Data: JSON.stringify(theBody)
        }).promise();
    }
    if (pairLive && pairConnectionId) {
        console.log("sendMessageToClients pair: " + pairConnectionId)
        await apigatewaymanagementapi.postToConnection({
            ConnectionId: pairConnectionId,
            Data: JSON.stringify(theBody)
        }).promise();
    }
}

function respondWithMessage(message, status) {
    return {
        statusCode: 200,
        body: JSON.stringify({ message: message, ansStatus: status }),
    };
}

async function isConnectionLive(connectionId) {
    try {
        // Attempt to send a ping message to the connection
        await apigatewaymanagementapi.postToConnection({
            ConnectionId: connectionId,
            Data: JSON.stringify({ type: 'ping' }) // Sending a simple "ping" message
        }).promise();

        // If no error, the connection is live
        return true;
    } catch (err) {
        // If an error occurs, it usually means the connection is closed
        if (err.statusCode === 410) { // 410 Gone indicates the connection is no longer present
            console.log(`Connection ${connectionId} is no longer live. (server ERROR will be seen on client and its not a problem ).`);
            return false;
        }
        // Handle other potential errors
        console.error(`Failed to send ping to connection ${connectionId}:`, err);
        throw err;
    }
}

