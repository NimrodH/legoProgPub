'use strict'
console.log('Loading function');
var AWS = require('aws-sdk');
var dclient = new AWS.DynamoDB.DocumentClient();
exports.handler = function(event, context, callback) {
    let params = {
        Item: {
            step: event.step,
            color: event.color,
            destBlock: event.destBlock,
            destPoint: event.destPoint,
            rotation : event.rotation,
            srcPoint : event.srcPoint,
            type : event.type,
            modelName: event.modelName
        },
        TableName: "lego_recordModel"
    };
    dclient.put(params, function(err, data) {
        callback(err,data);
    });
}


