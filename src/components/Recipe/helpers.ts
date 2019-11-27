import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useDeepCompareEffect from 'use-deep-compare-effect';
import deepEqual from 'dequal';
import { UseQueryState } from 'urql';
import { DispatchType } from 'store/store';
import { Recipe } from '../../backend/data-types/Recipe';
import AppState, { PartialRecipe } from '../../store/state';
import { mergeRecipes } from './actions';
import { useRecipesQuery } from './queries';

/**
 * Automatically merges recipes from a graphql query once they are loaded, then returns an updating
 * version of them synchronized with the store.
 * @param query The query to merge
 */
export function useMergedRecipesQuery<T extends keyof Recipe, TData>(
  request: UseQueryState<TData>,
  mapDataToResult: (data: TData) => Pick<Recipe, T | 'id'>[]
) {
  type ReturnedRecipe = PartialRecipe & ReturnType<typeof mapDataToResult>[number];
  const [merged, setMerged] = useState(false);
  const dispatch = useDispatch<DispatchType>();
  useDeepCompareEffect(() => {
    if (request.data) {
      dispatch(mergeRecipes(...mapDataToResult(request.data)));
      setMerged(true);
    }
  }, [dispatch, mapDataToResult, request]);
  const idsOfFetched = request.data
    ? mapDataToResult(request.data).map(recipe => recipe.id)
    : undefined;
  const recipesFromStore = useSelector(
    (state: AppState) =>
      idsOfFetched && merged
        ? idsOfFetched.map(id => state.recipes.find(recipe => recipe.id === id) as ReturnedRecipe)
        : undefined,
    deepEqual
  ); // Undefined if not fetched
  return {
    recipes: recipesFromStore,
    loading: request.fetching,
    errorOccurred: !!request.error
  };
}

export function recipeHasFields<T extends keyof Recipe>(
  recipe: PartialRecipe,
  fields: T[]
): recipe is Pick<Recipe, T> & { id: string } {
  return fields.every(field => field in recipe);
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
  const getRecipeFromStoreById = (id: string) => storedRecipes.find(recipe => recipe.id === id);
  const recipeHasRequestedFields = (recipe: PartialRecipe) => recipeHasFields(recipe, fields);
  const storedRecipesWithAllFields = recipeIds
    .map(getRecipeFromStoreById)
    .filter(isNotNull)
    .filter((recipe): recipe is RequestedRecipeType => recipeHasRequestedFields(recipe));
  const recipeIdAvailableInStore = (id: string) =>
    storedRecipesWithAllFields.map(r => r.id).includes(id);
  const missingRecipeIds =
    storedRecipesWithAllFields.length === recipeIds.length
      ? []
      : recipeIds.filter(id => !recipeIdAvailableInStore(id));
  const missingRecipesQuery = useRecipesQuery(missingRecipeIds, ['id', ...fields]);
  const errorOccurredInQuery = !!missingRecipesQuery.error;
  const [result, setResult] = useState<RecipeResponse>({
    recipes: undefined,
    loading: false,
    errorOccurred: false
  });
  useDeepCompareEffect(() => {
    if (missingRecipeIds.length > 0) {
      const fetchedData = missingRecipesQuery.data;
      const findInStoreOrFetched = (id: string): RequestedRecipeType | undefined => {
        const fromStore = storedRecipesWithAllFields.find(r => r.id === id);
        const fromFetch = fetchedData?.find(r => r.id === id);
        return fromStore || fromFetch;
      };
      setResult({
        recipes: missingRecipesQuery.data
          ? recipeIds.map(findInStoreOrFetched).filter(isNotNull)
          : undefined,
        loading: missingRecipesQuery.fetching,
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
    missingRecipesQuery.fetching,
    recipeIds,
    setResult,
    storedRecipesWithAllFields
  ]);
  return result;
}
