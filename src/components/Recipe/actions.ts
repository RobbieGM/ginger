import { ActionType } from 'store/store';
import { PartialRecipe } from '../../store/state';
import { createAction, ActionWithPayload } from '../../store/actions';
import { SET_BOOKMARK_DATE } from './queries';

export const mergeRecipes = (...recipes: PartialRecipe[]) => createAction('MERGE_RECIPES', recipes);
type SetBookmarkDateAction = ActionWithPayload<
  'SET_BOOKMARK_DATE',
  {
    recipeId: string;
    date: Date | undefined;
  }
>;
export const setBookmarkDate = (id: string, date: Date | undefined): ActionType<void> => (
  dispatch,
  getState,
  client
) => {
  client.mutation(SET_BOOKMARK_DATE, { id, date }).toPromise();
  dispatch(
    createAction('SET_BOOKMARK_DATE', {
      recipeId: id,
      date
    })
  );
};

export type BasicAction = ReturnType<typeof mergeRecipes>;

export type RecipeAction = BasicAction | SetBookmarkDateAction;
