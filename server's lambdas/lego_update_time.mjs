//called by route: updateTime
////we will change it to update time in tabel lego_Couples using environment variabe
console.log('Loading function');
var AWS = require('aws-sdk');
var dynamoDb = new AWS.DynamoDB.DocumentClient();
const CONNECTIONS_TABLE = process.env.TABLE_NAME;

exports.handler = async (event) => {
///write the time offered in the table
    const body = JSON.parse(event.body);

    const userId = body.userId;
    const startAutoColor = body.startAutoColor;
    const part1Time  = body.part1Time;
    const part2Time  = body.part2Time;
    console.log("part1Time: " + part1Time + " part2Time: " + part2Time);
    /// update table with seconfOffered
    let params;
    if (part1Time) {
        console.log("in part1time")
        params = {
            TableName: CONNECTIONS_TABLE,
            Key: {
                ID: userId,
                startAutoColor: startAutoColor
            },
            UpdateExpression: "set part1Time = :seconds",
            ExpressionAttributeValues: {
                ":seconds": part1Time ,
            },
            ReturnValues: "ALL_NEW",        
        };
    } else {
        console.log("in part22time")
       params = {
            TableName: CONNECTIONS_TABLE,
            Key: {
                ID: userId,
                startAutoColor: startAutoColor
            },
            UpdateExpression: "set part2Time = :seconds",
            ExpressionAttributeValues: {
                ":seconds": part2Time ,
            },
            ReturnValues: "ALL_NEW",        
        };
        
    }

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
}
