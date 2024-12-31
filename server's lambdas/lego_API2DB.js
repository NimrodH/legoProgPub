///caled by: getway logorest /model GET
'use strict'
console.log('Loading function');
var AWS = require('aws-sdk');
var dclient = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {
    console.log('event' + JSON.stringify(event));
    var params;
    if (event.step == "ALL") {
        params = {
            "TableName" : "lego_recordModel"
        }
        dclient.scan(params, (error,data) => {
            if(error) {
                callback(null, "my error1");
            } else {
                callback(null, data);
            }
        });
    } else {
        params = {
            "TableName" : "lego_recordModel",
            "Key": {
                "step": event.step
            }
        }
        dclient.get(params, (error,data) => {
            if(error) {
                callback(null, "my error1");
            } else {
                callback(null, data);
            }
        });
    }
}

