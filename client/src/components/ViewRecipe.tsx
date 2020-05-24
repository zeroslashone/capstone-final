import * as React from 'react'
import Auth from '../auth/Auth'
import {Image} from 'semantic-ui-react'
import { Recipe } from '../types/Recipe'
import { getRecipe } from '../api/recipes-api'


interface ViewRecipeProps {
    match: {
      params: {
        recipeId: string
      }
    }
    auth: Auth
  }
  
  interface ViewRecipeState {
    recipeName: string
    recipe: string
    ingredients: string
    attachmentUrl: string | undefined
  }


  export class ViewRecipe extends React.PureComponent<
  ViewRecipeProps,
  ViewRecipeState
> {
  state: ViewRecipeState = {
    recipeName: '',
    recipe: '',
    ingredients: '',
    attachmentUrl: ''
  }

  async componentDidMount() {
    try {
      const recipe: Recipe = await getRecipe(this.props.auth.getIdToken(),this.props.match.params.recipeId)
      this.setState({
        recipeName: recipe.recipeName,
        recipe: recipe.recipe,
        ingredients: recipe.ingredients,
        attachmentUrl: recipe.attachmentUrl
      })
    } catch(e) {
      alert(`Failed to fetch recipe: ${e.message}`)
    }
  }

  render() {
      return (
          <div>
          {this.state.attachmentUrl && (
            <Image src={this.state.attachmentUrl} size="large"  />
          )}
            <h2>{this.state.recipeName}</h2>
            <h2>{this.state.ingredients}</h2>
            <h2>{this.state.recipe}</h2>
          </div>
      )
  }
}