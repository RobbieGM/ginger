import { RecipeInput } from 'backend/api-input/RecipeInput';
import { ActionType } from 'store/store';
import { OperationResult } from 'urql';
import { PartialRecipe } from 'store/state';
import { mergeRecipes } from 'components/Recipe/actions';
import { RecipePreview } from 'components/Recipe/List/queries';
import { CREATE_RECIPE } from 'components/Recipe/queries';

/**
 * Creates a recipe, either through the server or by simply saving it offline by bookmarking it.
 *
 * @returns Whether the operation was successful
 */
export const createRecipe = (
  recipe: RecipeInput,
  forceOfflineSave?: boolean
): ActionType<Promise<boolean>> => async (dispatch, _stateGetter, client) => {
  if (navigator.onLine && !forceOfflineSave) {
    const result: OperationResult<PartialRecipe[]> = await client
      .query(CREATE_RECIPE, { recipe })
      .toPromise();
    if (result.data) {
      dispatch(mergeRecipes(recipe));
      return true;
    }
    console.error(result.error);
    return false;
  }
  const offlineRecipe: RecipeInput & RecipePreview = {
    averageRating: undefined,
    userRating: undefined,
    bookmarkDate: Date.now(),
    ...recipe
  };
  dispatch(mergeRecipes(offlineRecipe));
  return true;
};
