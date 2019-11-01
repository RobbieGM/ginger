import { RecipeInput } from 'backend/api-input/RecipeInput';
import { RECIPE_PREVIEW_FIELDS } from '../../Recipe/List/queries';

export const GET_MY_RECIPES = `
  query {
    myRecipes {
      ${RECIPE_PREVIEW_FIELDS.join('\n')}
    }
  }
`;

const fields: (keyof RecipeInput)[] = [
  'cookTime',
  'directions',
  'imageURL',
  'ingredients',
  'lastModified',
  'name',
  'prepTime'
];
const fieldVariables = fields.map(field => `${field}: $${field}`).join(', ');
export const CREATE_RECIPE = `
  mutation {
    createRecipe(${fieldVariables})
  }
`;
