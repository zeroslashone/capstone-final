import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import getUserId from '../../lambda/utils'
import { createRecipe } from '../../businessLogic/recipes'
import { CreateRecipeRequest } from '../../requests/CreateRecipeRequest'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event', event);
  const parsedBody: CreateRecipeRequest = JSON.parse(event.body);
  const userId = getUserId(event)
  // Implement creating a new Recipe item
  const newRecipe = await createRecipe(parsedBody, userId)
 
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      item: newRecipe
    })
  }
}
