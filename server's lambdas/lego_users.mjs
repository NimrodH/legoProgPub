'use strict'
console.log('Loading function');
var AWS = require('aws-sdk');
var dclient = new AWS.DynamoDB.DocumentClient();
exports.handler = function(event, context, callback) {
    let params = {
        Item: {
            ActionDetails: event.ActionDetails,
            actionId: event.actionID,
            ActionType: event.ActionType,
            block: event.block,
            group : event.group,
            model : event.model,
            step : event.step,
            time : event.time,
            user : event.user
        },
        TableName: "lego_users"
    };
    dclient.put(params, function(err, data) {
        callback(err,data);
    });
}
