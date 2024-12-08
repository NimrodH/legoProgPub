var AWS = require('aws-sdk');


exports.handler = async (event) => {
    const connectionId = event.requestContext.connectionId;
///do nothing we will set the connectionId in the siniUser function
    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Connection successful' }),
    };
};
