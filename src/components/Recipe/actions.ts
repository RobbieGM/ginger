import { ActionType } from 'store/store';
import { showErrorIfPresent } from 'components/CoreUIProvider/helpers';
import { PartialRecipe } from '../../store/state';
import { createAction, ActionWithPayload } from '../../store/actions';
import { SET_BOOKMARK_DATE, RATE, DELETE_RECIPE } from './queries';

export const mergeRecipes = (...recipes: PartialRecipe[]) => createAction('MERGE_RECIPES', recipes);

type SetBookmarkDateAction = ActionWithPayload<
  'SET_BOOKMARK_DATE',
  {
    recipeId: string;
    date: number | undefined;
  }
>;
export const setBookmarkDate = (id: string, date: number | undefined): ActionType<void> => (
  dispatch,
  getState,
  client
) => {
  client
    .mutation(SET_BOOKMARK_DATE, { id, date })
    .toPromise()
    .then(showErrorIfPresent('Failed to bookmark recipe', dispatch));
  dispatch(
    createAction('SET_BOOKMARK_DATE', {
      recipeId: id,
      date
    })
  );
};

type DeleteRecipeAction = ActionWithPayload<'DELETE_RECIPE', string>;
export const deleteRecipe = (id: string): ActionType<void> => (dispatch, getState, client) => {
  client
    .mutation(DELETE_RECIPE, { recipeId: id })
    .toPromise()
    .then(response => {
      if (response.data) {
        dispatch(createAction('DELETE_RECIPE', id));
      }
      return response;
    })
    .then(showErrorIfPresent('Failed to delete recipe', dispatch));
};

export const rate = (id: string, rating: number): ActionType<void> => (
  dispatch,
  getState,
  client
) => {
  client
    .mutation(RATE, { rating, id })
    .toPromise()
    .then(showErrorIfPresent('Failed to rate recipe', dispatch, true));
  dispatch(mergeRecipes({ id, userRating: rating }));
};

export type BasicAction = ReturnType<typeof mergeRecipes>;

export type RecipeAction =
  | ReturnType<typeof mergeRecipes>
  | SetBookmarkDateAction
  | DeleteRecipeAction;
