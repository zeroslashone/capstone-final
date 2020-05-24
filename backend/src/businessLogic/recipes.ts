import * as uuid from 'uuid'

import { RecipeItem } from '../models/recipeItem'
import { RecipesAccess } from '../dataLayer/recipesAccess'
import { CreateRecipeRequest } from '../requests/CreateRecipeRequest'
import { UpdateRecipeRequest } from '../requests/UpdateRecipeRequest'

const recipesAccess = new RecipesAccess()

export async function getAllRecipes(userId: String): Promise<RecipeItem[]> {
  return recipesAccess.getAllRecipesItems(userId)
}

export async function getRecipe(recipeId: String): Promise<RecipeItem> {
  return recipesAccess.getRecipeItem(recipeId)
}

export async function createRecipe(createRecipeRequest: CreateRecipeRequest, userId: string
): Promise<RecipeItem> {
 
  const recipeId =  uuid.v4();
  const newRecipe = {
    userId,
    recipeId,
    ...createRecipeRequest
  }

  return recipesAccess.createRecipeItem(newRecipe)
}

export async function updateRecipe(recipeId: String, userId: string, updateRecipeRequest: UpdateRecipeRequest){
    return recipesAccess.updateRecipeItem(recipeId, userId, updateRecipeRequest)
}

export async function deleteRecipe(recipeId: String, userId: String){
    return recipesAccess.deleteRecipeItem(recipeId, userId)
}
