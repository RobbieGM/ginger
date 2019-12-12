import { RECIPE_PREVIEW_FIELDS } from 'components/Recipe/List/queries';

export const SEARCH = `
  query Search($query: String!, $skip: Int!, $results: Int!) {
    search(query: $query, skip: $skip, results: $results) {
      results {
        ${RECIPE_PREVIEW_FIELDS}
      }
      canLoadMore
    }
  }
`;
