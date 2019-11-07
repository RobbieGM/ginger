import { useQuery } from 'urql';
import { Recipe } from '../../store/state';

export const CREATE_RECIPE = `
  mutation CreateRecipe($recipe: RecipeInput!) {
    mergeRecipes(recipes: [$recipe]) {
      id
    }
  }
`;

export const SET_BOOKMARK_DATE = `
  mutation SetBookmarkDate($date: DateTime, $id: String!) {
    setBookmarkDate(date: $date, recipeId: $id)
  }
`;

/**
 * Fetches recipes with given fields
 *
 * @param recipeIds IDs of the recipes to return results for
 * @param fields Required fields on each Recipe
 */
export function useRecipesQuery<T extends keyof Recipe>(recipeIds: string[], fields: T[]) {
  const GET_RECIPES = `
    query recipes($ids: [String!]!) {
      ${fields.join('\n')}
    }
  `;
  type RequestedRecipeType = Pick<Recipe, T>;
  const [result] = useQuery<RequestedRecipeType[]>({
    query: GET_RECIPES,
    variables: {
      ids: recipeIds
    },
    pause: fields.length === 0 || recipeIds.length === 0
  });
  return result;
}
