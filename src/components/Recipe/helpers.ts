import { Dispatch } from 'redux';
import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { QueryResult } from 'react-apollo';
import useDeepCompareEffect from 'use-deep-compare-effect';
import deepEqual from 'dequal';
import { AppAction } from '../../store/actions';
import { Recipe } from '../../backend/data-types/Recipe';
import AppState, { PartialRecipe } from '../../store/state';
import { mergeRecipes } from './actions';
import { RecipePreviewType } from './List/queries';
import { useRecipesQuery } from './queries';

/**
 * Automatically merges recipes from a list into the store, then returns their ids.
 *
 * @param dispatch The function to dispatch to the store. This is used to persist recipes.
 * @param gen The recipe generator to use.
 */
export function useMergedRecipeIds(recipes: PartialRecipe[]): string[] {
  const dispatch = useDispatch<Dispatch<AppAction>>();
  useEffect(() => {
    dispatch(mergeRecipes(...recipes));
  }, [dispatch, recipes]);
  return recipes.map(r => r.id);
}

/**
 * Automatically merges recipes from an apollo query once they are loaded, then returns an updating
 * version of them synchronized with the store.
 * @param query The query to merge
 */
export function useMergedRecipesQuery<T extends keyof Recipe, TData>(
  request: QueryResult<TData>,
  mapDataToResult: (data: TData) => Pick<Recipe, T | 'id'>[]
) {
  const dispatch = useDispatch();
  useEffect(() => {
    if (request.data) {
      console.warn(request.data);
      dispatch(mergeRecipes(...mapDataToResult(request.data)));
    }
  }, [dispatch, mapDataToResult, request]);
  const idsOfFetched = request.data
    ? mapDataToResult(request.data).map(recipe => recipe.id)
    : undefined;
  const recipesFromStore = useSelector(
    (state: AppState) =>
      idsOfFetched
        ? idsOfFetched.map(
            id =>
              state.recipes.find(recipe => recipe.id === id) as PartialRecipe &
                ReturnType<typeof mapDataToResult>[number]
          )
        : undefined,
    deepEqual
  ); // Undefined if not fetched
  return {
    recipes: recipesFromStore,
    loading: request.loading,
    errorOccurred: !!request.error
  };
}

/**
 * A react hook to get recipes from server, auto merge them into the store, and return them.
 *
 * @param recipeIds The ids of the recipes to query
 * @param fields The fields needed from the recipes
 */
export function usePartialRecipes<T extends keyof Recipe>(recipeIds: string[], fields: T[]) {
  type RequestedRecipeType = Pick<Recipe, T> & { id: string };
  interface RecipeResponse {
    recipes: RequestedRecipeType[] | undefined;
    loading: boolean;
    errorOccurred: boolean;
  }
  const isNotNull = <T>(x: T | undefined | null): x is T => x !== undefined && x !== null;
  const storedRecipes = useSelector((state: AppState) => state.recipes, deepEqual);
  const [result, setResult] = useState<RecipeResponse>({
    recipes: undefined,
    loading: true,
    errorOccurred: false
  });
  const getRecipeFromStoreById = (id: string) => storedRecipes.find(recipe => recipe.id === id);
  const recipeHasRequestedFields = (recipe: PartialRecipe): recipe is RequestedRecipeType =>
    fields.every(field => field in recipe);
  const storedRecipesWithAllFields = recipeIds
    .map(getRecipeFromStoreById)
    .filter(isNotNull)
    .filter(recipeHasRequestedFields);
  const recipeIdAvailableInStore = (id: string) =>
    storedRecipesWithAllFields.map(r => r.id).includes(id);
  const missingRecipeIds =
    storedRecipesWithAllFields.length < recipeIds.length
      ? []
      : recipeIds.filter(id => !recipeIdAvailableInStore(id));
  const missingRecipesQuery = useRecipesQuery(missingRecipeIds, ['id', ...fields]);
  const errorOccurredInQuery = !!missingRecipesQuery.error;
  useDeepCompareEffect(() => {
    if (missingRecipeIds.length > 0) {
      const fetchedData = missingRecipesQuery.data;
      const findInStoreOrFetched = (id: string): RequestedRecipeType | undefined => {
        const fromStore = storedRecipesWithAllFields.find(r => r.id === id);
        const fromFetch = fetchedData ? fetchedData.find(r => r.id === id) : undefined;
        return fromStore || fromFetch;
      };
      setResult({
        recipes: missingRecipesQuery.data
          ? recipeIds.map(findInStoreOrFetched).filter(isNotNull)
          : undefined,
        loading: missingRecipesQuery.loading,
        errorOccurred: errorOccurredInQuery
      });
    } else {
      setResult({
        recipes: storedRecipesWithAllFields,
        loading: false,
        errorOccurred: false
      });
    }
  }, [
    missingRecipeIds.length,
    missingRecipesQuery.data,
    errorOccurredInQuery,
    missingRecipesQuery.loading,
    recipeIds,
    setResult,
    storedRecipesWithAllFields
  ]);
  return result;
}
