import { Recipe } from 'backend/data-types/Recipe';
import { Dispatch, useCallback, useEffect, useReducer } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppAction, createAction } from 'store/actions';
import AppState from 'store/state';
import { CombinedError, useClient, UseQueryArgs } from 'urql';
import { mergeRecipes } from '../actions';
import { RECIPE_PREVIEW_FIELD_TYPE } from './queries';

const getRecipeInfiniteScrollInitialState = (pageSize: number) => ({
  pageSize,
  recipeIds: [] as string[],
  loading: false,
  canLoadMore: true,
  error: undefined as CombinedError | undefined
});
type RecipeInfiniteScrollState = ReturnType<typeof getRecipeInfiniteScrollInitialState>;

const loadMore = () => createAction('LOAD_MORE');
const resolveQuery = (recipeIds: string[], canLoadMore: boolean) =>
  createAction('RESOLVE_QUERY', { recipeIds, canLoadMore });
const rejectQuery = (error: CombinedError | undefined) => createAction('REJECT_QUERY', error);
const reset = () => createAction('RESET');
const reload = () => createAction('RELOAD');
type RecipeInfiniteScrollAction =
  | ReturnType<typeof loadMore>
  | ReturnType<typeof resolveQuery>
  | ReturnType<typeof rejectQuery>
  | ReturnType<typeof reset>
  | ReturnType<typeof reload>;

function recipeInfiniteScrollReducer(
  state: ReturnType<typeof getRecipeInfiniteScrollInitialState>,
  action: RecipeInfiniteScrollAction
): RecipeInfiniteScrollState {
  switch (action.type) {
    case 'LOAD_MORE':
      if (state.canLoadMore) {
        return {
          ...state,
          error: undefined,
          loading: true
        };
      }
      return state;
    case 'RESOLVE_QUERY':
      return {
        ...state,
        error: undefined,
        loading: false,
        recipeIds: [...state.recipeIds, ...action.payload.recipeIds],
        canLoadMore: action.payload.canLoadMore
      };
    case 'REJECT_QUERY':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case 'RESET':
      return {
        ...state,
        recipeIds: [],
        error: undefined,
        loading: false
      };
    case 'RELOAD':
      return {
        ...state,
        error: undefined,
        loading: true,
        recipeIds: []
      };
    default:
      return state;
  }
}

/**
 * Uses a query to provide an infinite-scrolling and store-synced recipe list.
 *
 * @param queryArgs Arguments passed to useQuery()
 * @param pageSize Number of items to fetch at a time
 * @param mapDataToResult Tells this function how to interpret received data as recipes
 */
export function useInfiniteScrollRecipeQuery<
  TData,
  T extends keyof Recipe = RECIPE_PREVIEW_FIELD_TYPE
>(
  getQueryArgs: (scrollInfo: {
    offset: number;
    results: number;
  }) => UseQueryArgs<object> & Required<Pick<UseQueryArgs<object>, 'variables'>>,
  mapDataToResult: (data: TData) => { results: Pick<Recipe, T | 'id'>[]; canLoadMore: boolean },
  pageSize = 20
) {
  type ReturnedRecipe = { id: string } & Pick<Recipe, T | 'id'>;
  const storeDispatch = useDispatch<Dispatch<AppAction>>();
  const client = useClient();
  const [state, dispatch] = useReducer(
    recipeInfiniteScrollReducer,
    pageSize,
    getRecipeInfiniteScrollInitialState
  );
  async function loadNext() {
    const { query, variables, context } = getQueryArgs({
      offset: state.recipeIds.length,
      results: pageSize
    });
    client
      .query<TData>(query, variables, context)
      .toPromise()
      .then(({ data, error }) => {
        if (data) {
          const { results: recipesToMerge, canLoadMore } = mapDataToResult(data);
          storeDispatch(mergeRecipes(...recipesToMerge));
          dispatch(
            resolveQuery(
              recipesToMerge.map(recipe => recipe.id),
              canLoadMore
            )
          );
        } else if (error) {
          dispatch(rejectQuery(error));
        }
      })
      .catch(err => console.error(err));
  }
  useEffect(() => {
    if (state.loading) loadNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.loading]);
  const recipes = useSelector((appState: AppState) =>
    state.recipeIds
      .map(id => appState.recipes.find(recipe => recipe.id === id) as ReturnedRecipe | undefined)
      .filter((r: ReturnedRecipe | undefined): r is ReturnedRecipe => r != null)
  ); // filter for deleted recipes that still showed up previously in the query
  return {
    recipes,
    loading: state.loading,
    error: state.error,
    canLoadMore: state.canLoadMore,
    loadNext: useCallback(() => {
      dispatch(loadMore());
    }, []),
    reset: useCallback(() => {
      dispatch(reset());
    }, []),
    reload: useCallback(() => {
      dispatch(reload());
    }, [])
  };
}
