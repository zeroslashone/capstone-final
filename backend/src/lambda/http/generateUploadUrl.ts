import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk'

const XAWSS3 = AWSXRay.captureAWS(AWS)
const s3 = new XAWSS3.S3({
  signatureVersion: 'v4'
})

const docClient = new AWS.DynamoDB.DocumentClient();

const recipesTable = process.env.RECIPES_TABLE;
const bucketName = process.env.RECIPES_S3_BUCKET;
const urlExpiration = Number(process.env.SIGNED_URL_EXPIRATION);
const recipeIdIndex = process.env.RECIPE_ID_INDEX

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const recipeId = event.pathParameters.recipeId


  // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
  const url = s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: recipeId,
    Expires: urlExpiration  // The expiration must be a number, received string
  })

  const result = await docClient.query({
    TableName : recipesTable,
    IndexName : recipeIdIndex,
    KeyConditionExpression: 'recipeId = :recipeId',
    ExpressionAttributeValues: {
        ':recipeId': recipeId
    }
  }).promise()

  if (result.Count !=  0){
    const recipe = {
      ...result.Items[0],
      attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${recipeId}`
    }

     await docClient.put({
      TableName: recipesTable,
      Item: recipe
    }).promise();

  } else {
    
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: ''
    }
  }

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      uploadUrl: url
    })
  }
}
