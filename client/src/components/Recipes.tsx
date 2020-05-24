import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Form,
  Loader
} from 'semantic-ui-react'

import { createRecipe, deleteRecipe, getRecipes } from '../api/recipes-api'
import Auth from '../auth/Auth'
import { Recipe } from '../types/Recipe'

interface RecipesProps {
  auth: Auth
  history: History
}

interface RecipeState {
  recipes: Recipe[]
  newRecipeName: string
  ingredients: string
  recipe: string
  loadingRecipes: boolean
}

export class Recipes extends React.PureComponent<RecipesProps, RecipeState> {
  state: RecipeState = {
    recipes: [],
    newRecipeName: '',
    ingredients: '',
    recipe: '',
    loadingRecipes: false
  }


  onEditButtonClick = (recipeId: string) => {
    this.props.history.push(`/recipes/${recipeId}/edit`)
  }

  onViewButtonClick = (recipeId: string) => {
    this.props.history.push(`/recipes/${recipeId}/view`)
  }

  onRecipeCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      this.setState({loadingRecipes: true})
      const newRecipe = await createRecipe(this.props.auth.getIdToken(), {
        recipeName: this.state.newRecipeName,
        ingredients: this.state.ingredients,
        recipe: this.state.recipe
      })
      this.setState({
        recipes: [...this.state.recipes, newRecipe],
        newRecipeName: '',
        ingredients: '',
        recipe: ''
      })
    } catch {
      alert('Recipe creation failed')
    }
    this.setState({loadingRecipes:false})
  }

  onRecipeDelete = async (recipeId: string) => {
    try {
      await deleteRecipe(this.props.auth.getIdToken(), recipeId)
      this.setState({
        recipes: this.state.recipes.filter(recipe => recipe.recipeId != recipeId)
      })
    } catch {
      alert('Recipe deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const recipes = await getRecipes(this.props.auth.getIdToken())
      this.setState({
        recipes,
        loadingRecipes: false
      })
    } catch (e) {
      alert(`Failed to fetch recipes: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Recipes</Header>
        {this.renderCreateRecipeInput()}
        {this.renderRecipes()}
      </div>
    )
  }

  renderCreateRecipeInput() {
    return (
      <Form onSubmit={this.onRecipeCreate}>
        <Form.Field>
          <label>Name</label>
          <Input 
            label ='recipeName'
            placeholder= 'name'
            value = {this.state.newRecipeName}
            onChange = {event => this.setState({newRecipeName: event.target.value})}
          />
        </Form.Field>
        <Form.Field>
          <label>ingredients</label>
          <Input 
            label ='ingredients'
            placeholder= 'ingredients'
            value = {this.state.ingredients}
            onChange = {event => this.setState({ingredients: event.target.value})}
          />
        </Form.Field>
        <Form.Field>
          <label>recipe</label>
          <Input 
            label ='recipe'
            placeholder= 'recipe'
            value = {this.state.recipe}
            onChange = {event => this.setState({recipe: event.target.value})}
          />
        </Form.Field>
        <Button loading = {this.state.loadingRecipes} primary>Create</Button>
      </Form>
    )
  }

  renderRecipes() {
    if (this.state.loadingRecipes) {
      return this.renderLoading()
    }

    return this.renderRecipesList()
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

  renderRecipesList() {
    return (
      <Grid padded>
        {this.state.recipes.map((recipe, pos) => {
          return (
            <Grid.Row key={recipe.recipeId}>
              
              <Grid.Column width={10} verticalAlign="middle">
                {recipe.recipeName}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onViewButtonClick(recipe.recipeId)}
                >
                  <Icon name="eye" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(recipe.recipeId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onRecipeDelete(recipe.recipeId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {recipe.attachmentUrl && (
                <Image src={recipe.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

}
