import { AppAction } from '../../store/actions';
import { PartialRecipe } from '../../store/state';

function mergeSingleRecipe(current: PartialRecipe, incoming: PartialRecipe): PartialRecipe {
  // If either lastModified date is missing, assume the incoming recipe is newer
  const currentIsNewer =
    incoming.lastModified && current.lastModified && current.lastModified > incoming.lastModified;
  if (currentIsNewer) {
    return {
      ...incoming,
      ...current
    };
  }
  return {
    ...current,
    ...incoming
  };
}

export function recipes(state: PartialRecipe[] = [], action: AppAction): PartialRecipe[] {
  switch (action.type) {
    case 'MERGE_RECIPES':
      const merged = [...state];
      for (const incomingRecipe of action.payload) {
        const indexOfSameId = merged.findIndex(r => r.id === incomingRecipe.id);
        if (indexOfSameId !== -1) {
          const existing = merged[indexOfSameId];
          merged[indexOfSameId] = mergeSingleRecipe(existing, incomingRecipe);
        } else {
          merged.push(incomingRecipe);
        }
      }
      return merged;
    case 'SET_BOOKMARK_DATE':
      return state.map(recipe =>
        recipe.id === action.payload.recipeId
          ? { ...recipe, bookmarkDate: action.payload.date }
          : recipe
      );
    case 'DELETE_RECIPE':
      return state.filter(recipe => recipe.id !== action.payload.id);
    default:
      return state;
  }
}

export function lastSync(state = 0, action: AppAction): number {
  switch (action.type) {
    case 'SYNC':
      return action.payload;
    default:
      return state;
  }
}
