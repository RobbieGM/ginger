import { Recipe } from '../backend/data-types/Recipe';

export { Recipe } from '../backend/data-types/Recipe';

export type PartialRecipe = { id: string } & Partial<Recipe>;

export interface Snackbar {
  id: number;
  text: string;
}

export default interface AppState {
  // savedRecipes: Recipe[];
  queuedSnackbars: Snackbar[];
  recipes: PartialRecipe[];
}
