import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { RecipeItem } from '../models/recipeItem'
import { UpdateRecipeRequest } from '../requests/UpdateRecipeRequest'

export class RecipesAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly recipesTable = process.env.RECIPES_TABLE,
    private readonly recipesIndex = process.env.RECIPE_ID_INDEX) {
  }

  async getAllRecipesItems(userId: String): Promise<RecipeItem[]> {
    console.log('Getting all Recipes')
    const result = await this.docClient.query({
        TableName: this.recipesTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        },
        ScanIndexForward: false
      }).promise();
    
      const items = result.Items;
    return items as RecipeItem[]
  }
  async getRecipeItem(recipeId: String): Promise<RecipeItem> {
    console.log('Getting Recipe for recipeId: ', recipeId)
    const result = await this.docClient.query({
      TableName: this.recipesTable,
      IndexName: this.recipesIndex,
      KeyConditionExpression: 'recipeId = :recipeId',
      ExpressionAttributeValues:{
        ':recipeId': recipeId
      } 
    }).promise()
    const item = result.Items;
    return item[0] as RecipeItem
  }

  async createRecipeItem(recipe: RecipeItem): Promise<RecipeItem> {
    await this.docClient.put({
        TableName: this.recipesTable,
        Item: recipe
      }).promise();

    return recipe
  }

  async updateRecipeItem(recipeId: String, userId: String, updatedRecipe: UpdateRecipeRequest) {
    await this.docClient.update({
        TableName: this.recipesTable,
        Key: {
          userId: userId,
          recipeId: recipeId
        },
        UpdateExpression: 'SET #n = :recipeName, ingredients = :ingredients, recipe = :recipe',
        ExpressionAttributeValues : {
          ':recipeName': updatedRecipe.recipeName,
          ':ingredients': updatedRecipe.ingredients,
          ':recipe': updatedRecipe.recipe
        },
        ExpressionAttributeNames: {
          '#n': 'recipeName'
        }
      }).promise();
  }

  async deleteRecipeItem(recipeId: String, userId: String) {
    await this.docClient.delete({
        TableName: this.recipesTable,
        Key: {
          userId: userId,
          recipeId: recipeId
        }
      }).promise();
  }
 
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new AWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000',
      service: AWSXRay.captureAWSClient(new AWS.DynamoDB)
    })
  }

  return new AWS.DynamoDB.DocumentClient({service: AWSXRay.captureAWSClient(new AWS.DynamoDB)})
}

