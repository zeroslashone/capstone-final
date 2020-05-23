import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import getUserId from '../../lambda/utils'
import { UpdateRecipeRequest } from '../../requests/UpdateRecipeRequest'
import { updateRecipe } from '../../businessLogic/recipes'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const recipeId = event.pathParameters.recipeId
  const updatedRecipe: UpdateRecipeRequest = JSON.parse(event.body)
  const userId = getUserId(event)
  // Update a TODO item with the provided id using values in the "updatedTodo" object
  await updateRecipe(recipeId, userId, updatedRecipe)
  
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({})
  }
}
