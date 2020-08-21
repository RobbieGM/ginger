import { ActionType } from 'store/store';
import { showErrorIfPresent } from 'components/CoreUIProvider/helpers';
import { PartialRecipe } from '../../store/state';
import { createAction, ActionWithPayload, Action } from '../../store/actions';
import { SET_BOOKMARK_DATE, RATE, DELETE_RECIPE, MERGE_RECIPES } from './queries';

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

type DeleteRecipeAction = ActionWithPayload<'DELETE_RECIPE', { id: string; needsSync: boolean }>;
export const deleteRecipe = (id: string): ActionType<void> => (dispatch, getState, client) => {
  if (navigator.onLine) {
    client
      .mutation(DELETE_RECIPE, { recipeId: id })
      .toPromise()
      .then(response => {
        if (response.data) {
          dispatch(createAction('DELETE_RECIPE', { id, needsSync: false }));
        }
        return response;
      })
      .then(showErrorIfPresent('Failed to delete recipe', dispatch));
  } else {
    dispatch(createAction('DELETE_RECIPE', { id, needsSync: true }));
  }
};

type Sync = ActionWithPayload<'SYNC', number>;
/**
 * Syncs the saved recipes, which may have been edited offline, to the server. Does not update
 * recipes from the server into the redux store.
 */
export const syncSavedRecipesToServer = (): ActionType<void> => async (
  dispatch,
  getState,
  client
) => {
  const state = getState();
  const savedRecipesUpdatedSinceLastSync = state.recipes.filter(
    recipe => recipe.bookmarkDate && recipe.lastModified && recipe.lastModified > state.lastSync
  );
  if (savedRecipesUpdatedSinceLastSync.length > 0) {
    await client
      .mutation(MERGE_RECIPES, { recipes: savedRecipesUpdatedSinceLastSync })
      .toPromise()
      .then(e => (e.error != null ? Promise.reject(e.error) : null));
  }
  dispatch({ type: 'SYNC', payload: Date.now() });
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

export type RecipeAction =
  | ReturnType<typeof mergeRecipes>
  | Sync
  | SetBookmarkDateAction
  | DeleteRecipeAction;
