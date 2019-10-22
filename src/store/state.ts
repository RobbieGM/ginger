import { Recipe } from '../backend/data-types/Recipe';

export { Recipe } from '../backend/data-types/Recipe';

// type MeasuringUnit =
//   | 'cups'
//   | 'ml'
//   | 'l'
//   | 'tsp'
//   | 'tbsp'
//   | 'fl oz'
//   | 'g'
//   | 'kg'
//   | 'oz'
//   | 'lb';

// export interface Ingredient {
//   name: string;
//   quantity: number;
//   units: MeasuringUnit;
// }

export type PartialRecipe = { id: string } & Partial<Recipe>;

export default interface AppState {
  // savedRecipes: Recipe[];
  recipes: PartialRecipe[];
}
