import * as React from 'react'
import { Form, Button, Input } from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { getUploadUrl, uploadFile, getRecipe, patchRecipe } from '../api/recipes-api'
import { Recipe } from '../types/Recipe'

enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile,
}

interface EditRecipeProps {
  match: {
    params: {
      recipeId: string
    }
  }
  auth: Auth
}

interface EditRecipeState {
  file: any
  uploadState: UploadState
  recipeName: string
  recipe: string
  ingredients: string
}

export class EditRecipe extends React.PureComponent<
  EditRecipeProps,
  EditRecipeState
> {
  state: EditRecipeState = {
    file: undefined,
    uploadState: UploadState.NoUpload,
    recipeName: '',
    recipe: '',
    ingredients: '',
  }

  async componentDidMount() {
    try {
      const recipe: Recipe = await getRecipe(this.props.auth.getIdToken(),this.props.match.params.recipeId)
      this.setState({
        recipeName: recipe.recipeName,
        recipe: recipe.recipe,
        ingredients: recipe.ingredients
      })
    } catch(e) {
      alert(`Failed to fetch recipe: ${e.message}`)
    }
  }

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    this.setState({
      file: files[0]
    })
  }

  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    try {
      await patchRecipe(this.props.auth.getIdToken(),this.props.match.params.recipeId,{
        recipeName: this.state.recipeName,
        ingredients: this.state.ingredients,
        recipe: this.state.recipe
      })

      if (!this.state.file) {
        alert('File should be selected')
        return
      }

      this.setUploadState(UploadState.FetchingPresignedUrl)
      const uploadUrl = await getUploadUrl(this.props.auth.getIdToken(), this.props.match.params.recipeId)

      this.setUploadState(UploadState.UploadingFile)
      await uploadFile(uploadUrl, this.state.file)

      alert('Successfully Updated and File was uploaded successfully!')
    } catch (e) {
      alert('Could not upload a file or could not update data: ' + e.message)
    } finally {
      this.setUploadState(UploadState.NoUpload)
    }
  }

  setUploadState(uploadState: UploadState) {
    this.setState({
      uploadState
    })
  }

  render() {
    return (
      <div>
        <h1>Update</h1>
        <Form onSubmit={this.handleSubmit}>
          <Form.Field>
            <label>Name</label>
            <Input 
              label ='recipeName'
              placeholder= 'name'
              value = {this.state.recipeName}
              onChange = {event => this.setState({recipeName: event.target.value})}
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
          <Form.Field>
            <label>File</label>
            <input
              type="file"
              accept="image/*"
              placeholder="Image to upload"
              onChange={this.handleFileChange}
            />
          </Form.Field>

          {this.renderButton()}
        </Form>
      </div>
    )
  }

  fetchRecipe() {  
    return (
      <div>
        <Form.Field>
          <label>Name</label>
          <Input 
            label ='recipeName'
            placeholder= 'name'
            value = {this.state.recipeName}
            onChange = {event => this.setState({recipeName: event.target.value})}
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
      </div>
    )
  }
  renderButton() {

    return (
      <div>
        {this.state.uploadState === UploadState.FetchingPresignedUrl && <p>Uploading image metadata</p>}
        {this.state.uploadState === UploadState.UploadingFile && <p>Uploading file</p>}
        <Button
          loading={this.state.uploadState !== UploadState.NoUpload}
          type="submit"
        >
          Upload
        </Button>
      </div>
    )
  }
}
