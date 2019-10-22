import { gql } from 'apollo-boost';
import { useQuery } from 'react-apollo';
import { Recipe } from '../../store/state';
// import { apolloClient } from '../..';

/**
 * Fetches recipes with given fields
 *
 * @param recipeIds IDs of the recipes to return results for
 * @param fields Required fields on each Recipe
 */
export function useRecipesQuery<T extends keyof Recipe>(recipeIds: string[], fields: T[]) {
  const GET_RECIPES = gql`
    query recipes($ids: [String!]!) {
      ${fields.join('\n')}
    }
  `;
  type RequestedRecipeType = Pick<Recipe, T>;
  return useQuery<RequestedRecipeType[]>(GET_RECIPES, {
    skip: recipeIds.length === 0 || fields.length === 0,
    variables: {
      ids: recipeIds
    }
  });
}
