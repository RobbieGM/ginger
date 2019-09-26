import { Recipe } from './state';
import { AppAction } from './actions';

export function recipes(state: Recipe[] = [], action: AppAction): Recipe[] {
  const mergeWith = (newRecipes: Recipe[]) => {};
  switch (action.type) {
    case 'ADD_RECIPE':
      return [...state, action.payload];
    case 'DELETE_RECIPE':
      return state.filter(recipe => recipe.id !== action.payload);
    case 'BOOKMARK_RECIPE':
      return state.map(recipe =>
        recipe.id === action.payload
          ? { ...recipe, bookmarkDate: new Date().getTime() }
          : recipe
      );
    case 'UNBOOKMARK_RECIPE':
      return state.map(recipe =>
        recipe.id === action.payload
          ? { ...recipe, bookmarkDate: undefined }
          : recipe
      );
    default:
      return state;
  }
}
