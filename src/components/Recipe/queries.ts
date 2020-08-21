import { useQuery, UseQueryState } from 'urql';
import { Recipe } from 'backend/data-types/Recipe';

export const CREATE_RECIPE = `
  mutation CreateRecipe($recipe: RecipeInput!) {
    mergeRecipes(recipes: [$recipe]) {
      id
    }
  }
`;

export const MERGE_RECIPES = `
  mutation MergeRecipes($recipes: [RecipeInput!]!) {
    mergeRecipes(recipes: $recipes) {
      id
    }
  }
`;

export const DELETE_RECIPE = `
  mutation DeleteRecipe($recipeId: String!) {
    delete(recipeId: $recipeId) {
      id
    }
  }
`;

export const SET_BOOKMARK_DATE = `
  mutation SetBookmarkDate($date: Float, $id: String!) {
    setBookmarkDate(date: $date, recipeId: $id) {
      id
    }
  }
`;

export const RATE = `
  mutation Rate($rating: Int!, $id: String!) {
    setRating(rating: $rating, recipeId: $id) {
      id
    }
  }
`;

/**
 * Fetches recipes with given fields
 *
 * @param recipeIds IDs of the recipes to return results for
 * @param fields Required fields on each Recipe
 */
export function useRecipesQuery<T extends keyof Recipe>(recipeIds: string[], fields: T[]) {
  const fieldsWithId = [...new Set(['id', ...fields])] as (T | 'id')[];
  const GET_RECIPES = `
    query GetRecipes($ids: [String!]!) {
      recipes(ids: $ids) {
        ${fieldsWithId.join('\n')}
      }
    }
  `;
  type RequestedRecipeType = Pick<Recipe, T | 'id'>;
  const [result] = useQuery<{ recipes: RequestedRecipeType[] }>({
    query: GET_RECIPES,
    variables: {
      ids: recipeIds
    },
    pause: fields.length === 0 || recipeIds.length === 0
  });
  return { ...result, data: result.data?.recipes } as UseQueryState<RequestedRecipeType[]>;
}
