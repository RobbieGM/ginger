import classNames from 'classnames';
import { HistoryContext } from 'components/HistoryProvider';
import { useEventListener, throttle } from 'helpers';
import React, { useContext } from 'react';
import { Bookmark, Clock, Star, Users } from 'react-feather';
import { useDispatch } from 'react-redux';
import { CombinedError } from 'urql';
import { ReactComponent as Loading } from '../../../assets/loading.svg';
import { Recipe } from '../../../backend/data-types/Recipe';
import { DispatchType } from '../../../store/store';
import { setBookmarkDate } from '../actions';
import { RecipePreview } from './queries';
import classes from './style.module.scss';

const INFINITE_SCROLL_DISTANCE_THRESHOLD = 300; // px
const INFINITE_SCROLL_THROTTLE = 500; // ms

interface Props {
  recipes: RecipePreview[] | undefined;
  loading: boolean;
  /**
   * The error that occurred, or undefined if no error exists.
   */
  error: CombinedError | undefined;
  errorMessage: JSX.Element | string;
  /**
   * What to show when no recipes exist and the container is not loading and no error has occurred
   */
  emptyState: JSX.Element | string;
  /**
   * Whether more recipes can be loaded. Assumed to be true at first.
   */
  canLoadMore?: boolean;
  /**
   * Which element the list scrolls in, used for infinite scrolling. Either an element or `window`.
   */
  scrollContainer?: HTMLElement | Window;
  /**
   * A function called to load more recipes into the RecipeList, used for infinite scrolling. Not called on first render
   */
  loadNext: () => void;
}

/**
 * Displays a list of recipes.
 *
 * @param recipes Recipes to display
 * @param loading Whether more recipes are loading or not
 * @param error The error that occurred, if it exists
 * @param canLoadMore Whether more recipes exist that may be loaded
 * @param emptyState The JSX to show if no recipes exist and no error occurred
 * @param errorMessage The error message to show if an error occurred
 * @param loadNext A function to load more recipes
 */
const RecipeList: React.FC<Props> = ({
  recipes,
  loading,
  error,
  canLoadMore,
  emptyState,
  errorMessage,
  scrollContainer,
  loadNext
}) => {
  const dispatch = useDispatch<DispatchType>();
  const toggleBookmark = (recipe: Pick<Recipe, 'id' | 'bookmarkDate'>) => {
    dispatch(setBookmarkDate(recipe.id, recipe.bookmarkDate ? undefined : Date.now()));
  };
  const browserHistory = useContext(HistoryContext);
  const viewRecipe = (id: string) => browserHistory.push(`/recipe/${id}`);

  useEventListener(
    scrollContainer,
    'scroll',
    throttle(() => {
      function loadMoreIfCloseToBottom(distanceFromBottom: number) {
        if (!loading && canLoadMore && distanceFromBottom < INFINITE_SCROLL_DISTANCE_THRESHOLD) {
          console.log('loading more');
          loadNext();
        }
      }
      if (scrollContainer instanceof HTMLElement) {
        const scrollTopMax = scrollContainer.scrollHeight - scrollContainer.clientHeight;
        const distanceFromBottom = scrollTopMax - scrollContainer.scrollTop;
        loadMoreIfCloseToBottom(distanceFromBottom);
      } else if (scrollContainer instanceof Window) {
        const scrollTopMax =
          document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const distanceFromBottom = scrollTopMax - pageYOffset;
        loadMoreIfCloseToBottom(distanceFromBottom);
      }
    }, INFINITE_SCROLL_THROTTLE),
    { passive: true, capture: true }
  );

  return (
    <div className={classes.recipeList}>
      {recipes && recipes.length ? (
        <>
          <div className={classes.recipeCardContainer}>
            {recipes.map(recipe => (
              <a
                className={classes.recipeCard}
                key={recipe.id}
                style={recipe.imageURL ? { backgroundImage: `url(${recipe.imageURL})` } : {}}
                href={`/recipe/${recipe.id}`}
                onClick={event => {
                  event.preventDefault();
                  viewRecipe(recipe.id);
                }}
              >
                <button
                  className={classNames(classes.bookmarkIcon, {
                    [classes.bookmarked]: recipe.bookmarkDate
                  })}
                  onClick={event => {
                    event.preventDefault();
                    event.stopPropagation();
                    toggleBookmark(recipe);
                  }}
                  aria-label='Save'
                >
                  <Bookmark aria-checked={recipe.bookmarkDate ? 'true' : 'false'} />
                </button>
                <div className={classes.bottomContent}>
                  <h3>{recipe.name}</h3>
                  <div className={classes.recipeMetadata}>
                    {recipe.averageRating && (
                      <div
                        className={classNames(
                          classes.star,
                          recipe.userRating && classes.highlighted
                        )}
                        aria-label={recipe.userRating ? 'Your rating' : 'Average rating'}
                      >
                        <Star />
                        {(recipe.userRating ?? recipe.averageRating)?.toFixed?.(1)}
                      </div>
                    )}
                    <div aria-label='Total time'>
                      <Clock />
                      {recipe.prepTime + recipe.cookTime}
                    </div>
                    <div aria-label='Servings'>
                      <Users />
                      {recipe.servings}
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
          {canLoadMore && !loading && (
            <button onClick={loadNext} className={classes.loadMore}>
              Load more
            </button>
          )}
        </>
      ) : recipes && recipes.length === 0 && !error && !loading ? (
        emptyState
      ) : (
        ''
      )}
      {error ? errorMessage : loading ? <Loading className={classes.loadingSpinner} /> : ''}
    </div>
  );
};

export default RecipeList;
