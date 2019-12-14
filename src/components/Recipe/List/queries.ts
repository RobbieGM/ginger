import { Recipe } from 'backend/data-types/Recipe';

const tuple = <T extends string[]>(...args: T) => args;

export const RECIPE_PREVIEW_FIELDS = tuple(
  'id',
  'imageURL',
  'name',
  'bookmarkDate',
  'averageRating',
  'userRating',
  'prepTime',
  'cookTime',
  'servings'
);

export type RECIPE_PREVIEW_FIELD_TYPE = typeof RECIPE_PREVIEW_FIELDS[number];
export type RecipePreview = Pick<Recipe, RECIPE_PREVIEW_FIELD_TYPE>;
