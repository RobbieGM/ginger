import { gql } from 'apollo-boost';
import { RECIPE_PREVIEW_FIELDS } from '../../Recipe/List/queries';

export const GET_MY_RECIPES = gql`
  query {
    myRecipes {
      ${RECIPE_PREVIEW_FIELDS.join('\n')}
    }
  }
`;
