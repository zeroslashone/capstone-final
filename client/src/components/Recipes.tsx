import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Container,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Segment,
  Form,
  Card,
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
    loadingRecipes: true
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
            placeholder= 'Enter name...'
            value = {this.state.newRecipeName}
            onChange = {event => this.setState({newRecipeName: event.target.value})}
          />
        </Form.Field>
        <Form.Field>
          <label>ingredients</label>
          <Input 
            placeholder= 'Enter the ingredients...'
            value = {this.state.ingredients}
            onChange = {event => this.setState({ingredients: event.target.value})}
          />
        </Form.Field>
        <Form.Field>
          <label>recipe</label>
          <Input 
            placeholder= 'enter the recipe....'
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
        <Container>
          <Divider horizontal><h3>Your Recipes</h3></Divider>
  
          <Grid>
            {this.state.recipes.map((recipe, pos) => {
              return (
                <Grid.Row key={recipe.recipeId} horizontalAlign="left">
                  <Grid.Column width={5}>
                      <Image src={recipe.attachmentUrl} size="medium"/>
                  </Grid.Column>
                  <Grid.Column width={6}>
                      <h2>{recipe.recipeName} </h2>
                      <Divider vertical/>
                    <Grid.Column width={6}>
                        <Button icon color="blue" onClick={() => this.onEditButtonClick(recipe.recipeId)} >
                          <Icon name="pencil" />
                        </Button>
                        <Button icon color="green" onClick={() => this.onViewButtonClick(recipe.recipeId)} >
                          <Icon name="eye" />
                        </Button>
                      <Button icon color="red" onClick={() => this.onRecipeDelete(recipe.recipeId)}>
                        <Icon name="trash" />  
                      </Button>
                    </Grid.Column>
                  </Grid.Column>
                </Grid.Row>              
              )
            })}
          </Grid>
        </Container>
      )
    }
}
