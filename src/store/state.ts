import { Recipe } from '../backend/data-types/Recipe';

export { Recipe } from '../backend/data-types/Recipe';

export type PartialRecipe = { id: string } & Partial<Recipe>;

export default interface AppState {
  // savedRecipes: Recipe[];
  recipes: PartialRecipe[];
}
