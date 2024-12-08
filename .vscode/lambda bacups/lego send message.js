/// get the user secondsOffered, save it to the user record and to the couple's one
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
///write the time offered in the table
    const body = JSON.parse(event.body);

    const userId = body.userId;
    const startAutoColor = body.startAutoColor;
    const secondsOffered  = body.secondsOffered;
    /// update table with seconfOffered
    const params = {
        TableName: CONNECTIONS_TABLE,
        Key: {
            ID: userId,
            startAutoColor: startAutoColor
        },
        UpdateExpression: "set secondsOffered = :seconds",
        ExpressionAttributeValues: {
            ":seconds": secondsOffered ,
        },
        ReturnValues: "ALL_NEW",        
    };

    try {
        const result = await dynamoDb.update(params).promise();
        console.log('Updated item:', JSON.stringify(result.Attributes, null, 2));
    } catch (error) {
        console.error('Error saving data:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to save data' }),
        };
    }
    
    ///now, if my pair already answer we will compare the secondsOffered and update dealDone and will send messageto each of them
    /// if we will have situationthat both dont have data in the pair we will have to trigger the message from event in the DB

    var myPair;///id of other user
    var pairAutoColor/// autoColer of other user
    var pairSecondsOffered;///what the other user offered 
    var myConnectionId;
    var pairConnectionId;
 
 ///get the myPair id (and my connectionId for later use)   
    const params4get = {
    TableName: CONNECTIONS_TABLE,
        Key: {
            ID: userId,
            startAutoColor: startAutoColor
        },
    };

    try {
        
        const response = await dynamoDb.get(params4get).promise();
        if (response.Item) {
          console.log('Retrieved item:', response.Item);
          myConnectionId = response.Item.connectionId;
          myPair = response.Item.myPairId;
          if (startAutoColor == "YES") {
              pairAutoColor = "NO";
          } else {
              pairAutoColor = "YES";
          }
          //return response.Item;
        } else {
          console.log('Item not found');
          return null;
        }
    
    } catch (error) {
        console.error('Error retrieving item:', error);
        throw error;
    }
    
/// get item of pair to read its secondsOffered
    const params4getPair = {
    TableName: CONNECTIONS_TABLE,
        Key: {
            ID: myPair,
            startAutoColor: pairAutoColor
        },
    };

    try {
        ///get what the other user offered (and its connectionId for later)
        const response = await dynamoDb.get(params4getPair).promise();
        ///TODO: verify the connection itself is live
        if (response.Item) {
          console.log('Retrieved pair_item:', response.Item);
          pairConnectionId = response.Item.connectionId;
          pairSecondsOffered = response.Item.secondsOffered;
          console.log('Retrieved pair_item connectioId:', pairConnectionId);
          console.log('Retrieved pair_item:', response.Item.secondsOffered);
          const isLive = await isConnectionLive(pairConnectionId);
          if (!isLive) {
            const theBody = {
                message: 'pair is not connected anymore', 
                ansStatus: 'missing'
            };
             return {
                statusCode: 410,
                body: JSON.stringify(theBody),
            };

              
          }
          //return response.Item;
        } else {
            ///the other user not start to play or play with wrong id number
            console.log('Item_pair not found');
            const theBody = {
                message: 'pair not CREATED yet', 
                ansStatus: 'missing'
            };
             return {
                statusCode: 200,
                body: JSON.stringify(theBody),
            };
        }
    } catch (error) {
        console.error('Error retrieving item:', error);
        throw error;
    }
///use what other user offered (if already offered) to decide about the value of doDeal
    var doDeal;
    
    if (!pairSecondsOffered) {
        ///pair is still playing. he will trigger this function when done.
        console.log("pair is still playing.");
        const theBody = {
            message: 'pair is still playing', 
            ansStatus: 'wait'
        };
        return {
            statusCode: 200,
            body: JSON.stringify(theBody),
        };
    } else {///pairSecondsOffered set. we have to compare it to the startSecondsOffered
        console.log("startAutoColor in get other offer 118: " + startAutoColor);
        if (startAutoColor == "YES") {///we sell
            doDeal = (parseInt(secondsOffered) <= parseInt(pairSecondsOffered)); 
        } else {
            doDeal = (parseInt(secondsOffered) >= parseInt(pairSecondsOffered));
        }
        console.log("doDeal: " + doDeal);
    }
    
///update both with doDeal value (we have return earlier if we dont have the other use answer yet)
        /// updating my record in table with the doDeal value
    const paramsMyDoDeal = {
        TableName: CONNECTIONS_TABLE,
        Key: {
            ID: userId,
            startAutoColor: startAutoColor
        },
        UpdateExpression: "set dealDone = :seconds",
        ExpressionAttributeValues: {
            ":seconds": doDeal,
        },
        ReturnValues: "ALL_NEW",        
    };

    try {
        const result = await dynamoDb.update(paramsMyDoDeal).promise();
        console.log('Updated item:', JSON.stringify(result.Attributes, null, 2));
    } catch (error) {
        console.error('Error saving data:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to save data to my dealDone' }),
        };
    }
 
    
/// updating pair record in table with the doDeal value
    const paramsPairDoDeal = {
        TableName: CONNECTIONS_TABLE,
        Key: {
            ID: myPair,
            startAutoColor: pairAutoColor
        },
        UpdateExpression: "set dealDone = :todeal",
        ExpressionAttributeValues: {
            ":todeal": doDeal,
        },
        ReturnValues: "ALL_NEW",        
    };

    try {
        const result = await dynamoDb.update(paramsPairDoDeal).promise();
        console.log('Updated item:', JSON.stringify(result.Attributes, null, 2));
    } catch (error) {
        console.error('Error saving data:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to save data to pair dealDone' }),
        };
    }
    
/// send message to both clients
/// thay have open connection  with ids myConectionId & pairConnectionId
    //const message = {isDealDone: doDeal};
         
    const theBody = {
        message: 'deal results are' + doDeal, 
        ansStatus: 'continue',
        isdealDone: doDeal,
        pairSecondsOffered: pairSecondsOffered,
        mySecondsOffered: secondsOffered
    };


    
    console.log("myConnectionId: " + myConnectionId);
    console.log(JSON.stringify({ theBody }));
    console.log("process.env.API_GATEWAY_ENDPOINT: " + process.env.API_GATEWAY_ENDPOINT);
  ///send message to me
    if (myConnectionId) {
        try {
            await apigatewaymanagementapi.postToConnection({
                ConnectionId: myConnectionId,
                Data: JSON.stringify(theBody)
            }).promise();
            ///send message to my pair
            if (pairConnectionId) {
                await apigatewaymanagementapi.postToConnection({
                    ConnectionId: pairConnectionId,
                    Data: JSON.stringify(theBody)
                }).promise();
            }
            
            return { statusCode: 200, body: JSON.stringify({ message: 'Message sent successfully' }) };///Message sent successfully
        } catch (error) {
            console.error('Error sending message:', error);
            return { statusCode: 500,body: JSON.stringify({ message: 'Failed to send message' }) }; ///Failed to send message
        }
    }
   /* send message to my pair
     console.log("before sending message to the pair. pairConnectionId: " + pairConnectionId )
     if (pairConnectionId) {
        try {
            await apigatewaymanagementapi.postToConnection({
                ConnectionId: pairConnectionId,
                Data: JSON.stringify(theBody)
            }).promise();
            return { statusCode: 200, body: JSON.stringify({ message: 'Message for pair sent successfully' }) };///Message for pair sent successfully
        } catch (error) {
            console.error('Error sending message:', error);
            return { statusCode: 500, body: JSON.stringify({ message: 'Failed to send message to pair' }) };///'Failed to send message to pair.
        }
    }
 */   

    
    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'shuld not be sent. we have returns before for all ' }),
    };
    
};

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
            console.log(`Connection ${connectionId} is no longer live.`);
            return false;
        }
        // Handle other potential errors
        console.error(`Failed to send ping to connection ${connectionId}:`, err);
        throw err;
    }
}

