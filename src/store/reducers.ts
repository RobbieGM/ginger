import { Recipe } from './state';
import { AppAction } from './actions';

export function recipes(state: Recipe[] = [], action: AppAction): Recipe[] {
  switch (action.type) {
    case 'MERGE_RECIPES':
      const merged = [...state];
      for (const incomingRecipe of action.payload) {
        const indexOfSameId = merged.findIndex(r => r.id === incomingRecipe.id);
        if (indexOfSameId !== -1) {
          const existing = merged[indexOfSameId];
          if (incomingRecipe.lastModified > existing.lastModified) {
            merged[indexOfSameId] = incomingRecipe;
          }
        } else {
          merged.push(incomingRecipe);
        }
      }
      return merged;
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
