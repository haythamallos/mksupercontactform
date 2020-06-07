"use strict";
const AWS = require('aws-sdk');
const ses = new AWS.SES();
const sourceEmail = "haytham.allos@gmail.com";
var logIndex = 1;

exports.handler = function (event, context, callback) {

    log(event.key, '1', "Starting");
    log(event.key, '1', JSON.stringify(event));
    // Set the region 
    AWS.config.update({ region: 'us-east-1' });

    // store message in database in case of issues in send email
    var dynamodb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });
    const params = {
        TableName: "forms",
        Item: {
            "key": { "S": event.key },
            "name": { "S": event.name },
            "email": { "S": event.email },
            "message": { "S": event.message }
        }
    }
    log(event.key, '1', "About to persist to db.");
    dynamodb.putItem(params, function (err, data) {
        if (err) {
            log(event.key, '1', "Error:  " + err.stack)
            //console.log(err, err.stack); // an error occurred
        }
        else {
            log(event.key, '1', "Success:  " + data)
            //console.log(data); // successful response
        }
    });

    //    send email
    var eParams = {
        Destination: {
            ToAddresses: [event.email]
        },
        Message: {
            Body: {
                Text: {
                    Data: event.message
                }
            },
            Subject: {
                Data: event.name
            }
        },
        Source: sourceEmail
    };
    log(event.key, '2', "About to send email:  " + JSON.stringify(eParams));
    const data = ses.sendEmail(eParams).promise();
    log(event.key, '2', "Email sent:  " + JSON.stringify(eParams));
};

function log(key, typeid, msg) {
    var logdb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });
    var dt = new Date();
    var utcDate = dt.toUTCString();
    var tmpkey = key + '-' + logIndex++;
    const logparams = {
        TableName: "logs",
        Item: {
            "key": { S: tmpkey },
            "typeid": { N: typeid },
            "created": { S: utcDate },
            "message": { S: msg }
        }
    }

    logdb.putItem(logparams, function (err, data) {
        if (err) {
            console.log(err, err.stack); // an error occurred
        }
        else {
            console.log(data); // successful response
        }
    });
};
