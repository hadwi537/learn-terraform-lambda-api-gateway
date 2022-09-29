// Lambda function code

const AWS = require("aws-sdk")
const PAPER_TABLE = process.env.PAPER_TABLE

const dynamo = new AWS.DocumentClient();

module.exports.handler = async (event, context) => {
    //log the event
    console.log('Event: ', event)
    let body;
    let statusCode = 200;
    const headers = {
        'Content-Type': 'application/json',
    };

    try {
        switch (event.routeKey){
            case "DELETE /items/{id}":
                await dynamo
                    .delete({
                        TableName: PAPER_TABLE,
                        Key: {
                            id: event.pathParameters.id
                        }
                    })
                    .promise();
                body = `Deleted item ${event.pathParameters.id}`
                break
            case "GET /items/{id}":
                body = await dynamo
                    .get({
                        TableName: PAPER_TABLE,
                        Key: {
                            id: event.pathParameters.id
                        }
                    })
                    .promise()
                break;
            case "GET /items":
                body = await dynamo.scan({
                    TableName: PAPER_TABLE
                }).promise()
                break
            case "PUT /items":
                let requestJSON = JSON.parse(event.body);
                await dynamo
                    .put({
                        TableName: PAPER_TABLE,
                        Item: {
                            paperID: requestJSON.id,
                            category: requestJSON.category,
                            paper_rating: requestJSON.paper_rating
                        }
                    })
                    .promise()
                body = `Put item ${requestJSON.id}`;
                break;
            default:
                throw new Error(`Unsupported route ${event.routeKey}`)
        }
    } catch (err) {
        statusCode = 400;
        body = err.message;
    } finally {
        body = JSON.stringify(body)
    }

    return {
        statusCode,
        body,
        headers
    };
};
