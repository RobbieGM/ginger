import { RecipeInput } from 'backend/api-input/RecipeInput';
import { RECIPE_PREVIEW_FIELDS } from '../../Recipe/List/queries';

export const GET_MY_RECIPES = `
  query {
    myRecipes {
      ${RECIPE_PREVIEW_FIELDS.join('\n')}
    }
  }
`;
