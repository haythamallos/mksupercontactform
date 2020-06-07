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
            "message": { "S": event.message },
            "created": { "S": (new Date()).toUTCString() },
            "processeddate": { "S": '' },
            "isprocessed": { "N": '0' },
            "haserror": { "N": '0' },
            "errorstack": { "S": '' }
        }
    }
    log(event.key, '1', "About to persist to db.");
    dynamodb.putItem(params, function (err, data) {
        if (err) {
            setFormProcessed(event.key, '0', '1', err.stack);
            log(event.key, '1', "Error:  " + err.stack)
        }
        else {
            setFormProcessed(event.key, '1', '0', '');
            log(event.key, '1', "Success:  " + data);
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

function setFormProcessed(key, isprocessed, haserror, errorstack) {
    // fetch the item with the key from table
    var docClient = new AWS.DynamoDB.DocumentClient();
    var params = {
        TableName: "forms",
        Key: {
            key: key
        },
        UpdateExpression: "set isprocessed = :isprocessed, processeddate = :processeddate, haserror = :haserror, errorstack = :errorstack",
        ExpressionAttributeValues: {
            ":isprocessed": isprocessed,
            ":processeddate": (new Date()).toUTCString(),
            ":haserror": haserror,
            ":errorstack": errorstack
        }
    };
    docClient.update(params, function (err, data) {
        if (err) {
            console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
        }
    });

};
