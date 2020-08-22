import { RECIPE_PREVIEW_FIELDS } from '../../Recipe/List/queries';

export const GET_NEW_RECIPES = `
  query GetNewRecipes($skip: Int!, $results: Int!) {
    newRecipes(skip: $skip, results: $results) {
      results {
        ${RECIPE_PREVIEW_FIELDS.join('\n')}
      }
      canLoadMore
    }
  }
`;
