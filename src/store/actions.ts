import { Recipe } from './state';

export interface Action<T extends string> {
  type: T;
}

export interface ActionWithPayload<T extends string, P> extends Action<T> {
  payload: P;
}

function createAction<T extends string>(type: T): Action<T>;
function createAction<T extends string, P>(
  type: T,
  payload: P
): ActionWithPayload<T, P>;
function createAction<T extends string, P>(type: T, payload?: P) {
  return payload === undefined ? { type } : { type, payload };
}

export const createRecipe = (recipe: Recipe) =>
  createAction('CREATE_RECIPE', recipe);
export const mergeRecipes = (...recipes: Recipe[]) =>
  createAction('MERGE_RECIPES', recipes);
export const deleteRecipe = (id: string) => createAction('DELETE_RECIPE', id);
export const bookmarkRecipe = (id: string) =>
  createAction('BOOKMARK_RECIPE', id);
export const unbookmarkRecipe = (id: string) =>
  createAction('UNBOOKMARK_RECIPE', id);

export type RecipeAction =
  | ReturnType<typeof createRecipe>
  | ReturnType<typeof deleteRecipe>
  | ReturnType<typeof mergeRecipes>;
export type BookmarkAction =
  | ReturnType<typeof bookmarkRecipe>
  | ReturnType<typeof unbookmarkRecipe>;

export type AppAction = RecipeAction | BookmarkAction;
