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

export interface Recipe {
  id: string;
  name: string;
  averageStars: number;
  userStars?: number;
  bookmarkDate?: number;
  prepTime: number;
  cookTime: number;
  ingredients: string[];
  directions: string;
  imageURL?: string;
  lastModified?: number;
}

export default interface AppState {
  // savedRecipes: Recipe[];
  recipes: Recipe[];
}
