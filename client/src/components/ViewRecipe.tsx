import * as React from 'react'
import Auth from '../auth/Auth'
import {Image, Grid, Loader} from 'semantic-ui-react'
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
    loadingRecipe: boolean
  }


  export class ViewRecipe extends React.PureComponent<
  ViewRecipeProps,
  ViewRecipeState
> {
  state: ViewRecipeState = {
    recipeName: '',
    recipe: '',
    ingredients: '',
    attachmentUrl: '',
    loadingRecipe: true
  }

  async componentDidMount() {
    try {
      const recipe: Recipe = await getRecipe(this.props.auth.getIdToken(),this.props.match.params.recipeId)
      this.setState({
        recipeName: recipe.recipeName,
        recipe: recipe.recipe,
        ingredients: recipe.ingredients,
        attachmentUrl: recipe.attachmentUrl,
        loadingRecipe: false
      })
    } catch(e) {
      alert(`Failed to fetch recipe: ${e.message}`)
    }
  }

  render() {
      return (
        <div>
          {this.renderRecipe()}
        </div>
      )
  }

  renderRecipe() {
    if(this.state.loadingRecipe){
      return this.renderLoading()
    }
    return this.renderRecipeList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Recipes
        </Loader>
      </Grid.Row>
    )
  }

  renderRecipeList() {
    return (
      <div>
        <Grid padded="horizontally" centered>
        <Grid.Column>
          <div>
          {this.state.attachmentUrl && (
            <Image src={this.state.attachmentUrl} size="big"  />
          )}
            <h2>name: {this.state.recipeName}</h2>
            <h2>ingredients: {this.state.ingredients}</h2>
            <h2>recipe: {this.state.recipe}</h2>
          </div>
        </Grid.Column>
        </Grid>
        </div>
    )
  }


}