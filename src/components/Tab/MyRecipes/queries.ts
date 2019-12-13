import { RECIPE_PREVIEW_FIELDS } from '../../Recipe/List/queries';

export const GET_MY_RECIPES = `
  query GetMyRecipes($skip: Int!, $results: Int!) {
    myRecipes(skip: $skip, results: $results) {
      results {
        ${RECIPE_PREVIEW_FIELDS.join('\n')}
      }
      canLoadMore
    }
  }
`;
