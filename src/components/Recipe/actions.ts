import { PartialRecipe } from '../../store/state';
import { createAction } from '../../store/actions';

export const mergeRecipes = (...recipes: PartialRecipe[]) =>
  createAction('MERGE_RECIPES', recipes);
export const bookmarkRecipe = (id: string) =>
  createAction('BOOKMARK_RECIPE', id);
export const unbookmarkRecipe = (id: string) =>
  createAction('UNBOOKMARK_RECIPE', id);

export type BasicAction = ReturnType<typeof mergeRecipes>;
export type BookmarkAction =
  | ReturnType<typeof bookmarkRecipe>
  | ReturnType<typeof unbookmarkRecipe>;

export type RecipeAction = BasicAction | BookmarkAction;
