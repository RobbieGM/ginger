import { mergeRecipes } from 'components/Recipe/actions';
import { Dispatch, useReducer, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppAction, createAction } from 'store/actions';
import AppState, { PartialRecipe, Recipe } from 'store/state';
import { CombinedError, useClient, UseQueryArgs } from 'urql';

export function debounce<T extends (...args: any[]) => any>(func: T, delay: number) {
  let timeout: number | undefined;
  return ((...args: any[]) => {
    const delayed = ((...innerArgs: any[]) => {
      timeout = undefined;
      return func(...innerArgs);
    }) as T;
    clearTimeout(timeout);
    timeout = window.setTimeout(delayed.bind(null, ...args), delay);
  }) as T;
}

const getRecipeInfiniteScrollInitialState = (pageSize: number) => ({
  pageSize,
  recipeIds: [] as string[],
  loading: false,
  canLoadMore: false,
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
      return {
        ...state,
        error: undefined,
        loading: true
      };
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
export function useInfiniteScrollRecipeQuery<T extends keyof Recipe, TData>(
  getQueryArgs: (scrollInfo: { offset: number; results: number }) => UseQueryArgs<object>,
  pageSize: number,
  mapDataToResult: (data: TData) => { results: Pick<Recipe, T | 'id'>[]; canLoadMore: boolean }
) {
  type ReturnedRecipe = { id: string } & Pick<Recipe, T | 'id'>;
  const storeDispatch = useDispatch<Dispatch<AppAction>>();
  const client = useClient();
  const [state, dispatch] = useReducer(
    recipeInfiniteScrollReducer,
    pageSize,
    getRecipeInfiniteScrollInitialState
  );
  const recipes = useSelector((appState: AppState) =>
    state.recipeIds.map(id => appState.recipes.find(recipe => recipe.id === id) as ReturnedRecipe)
  );
  console.debug('state', state);
  async function loadNext() {
    const { query, variables, context } = getQueryArgs({
      offset: state.recipeIds.length,
      results: pageSize
    });
    console.debug('Loading next with variables', variables);
    client
      .query<TData>(query, variables, context)
      .toPromise()
      .then(({ data, error }) => {
        console.debug('result data', data, 'error', error);
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
  return {
    recipes,
    loading: state.loading,
    error: state.error,
    canLoadMore: state.canLoadMore,
    loadNext() {
      dispatch(loadMore());
    },
    reset() {
      console.debug('RESET');
      dispatch(reset());
    },
    reload() {
      console.debug('RELOAD');
      dispatch(reload());
    }
  };
}
