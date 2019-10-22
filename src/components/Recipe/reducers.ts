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
    case 'BOOKMARK_RECIPE':
      return state.map(recipe =>
        recipe.id === action.payload ? { ...recipe, bookmarkDate: new Date() } : recipe
      );
    case 'UNBOOKMARK_RECIPE':
      return state.map(recipe =>
        recipe.id === action.payload ? { ...recipe, bookmarkDate: undefined } : recipe
      );
    default:
      return state;
  }
}
