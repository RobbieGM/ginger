import React, { useEffect, useContext } from 'react';
import classNames from 'classnames';
import { useDispatch } from 'react-redux';
import { Bookmark, Star, Clock, Users } from 'react-feather';
import { HistoryContext } from 'components/HistoryProvider';
import { CombinedError } from 'urql';
import classes from './style.module.scss';
import { DispatchType } from '../../../store/store';
import { Recipe } from '../../../backend/data-types/Recipe';
import { RecipePreview } from './queries';
import { setBookmarkDate } from '../actions';
import { ReactComponent as Loading } from '../../../assets/loading.svg';

interface Props {
  recipes: RecipePreview[] | undefined;
  loading: boolean;
  error: CombinedError | undefined;
  errorMessage: JSX.Element | string;
  emptyState: JSX.Element | string;
  canLoadMore?: boolean;
  /**
   * A function called to load more recipes into the RecipeList, used for infinite scrolling. Also called on first render.
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
  loadNext
}) => {
  const dispatch = useDispatch<DispatchType>();
  const toggleBookmark = (recipe: Pick<Recipe, 'id' | 'bookmarkDate'>) => {
    dispatch(setBookmarkDate(recipe.id, recipe.bookmarkDate ? undefined : Date.now()));
  };
  const browserHistory = useContext(HistoryContext);
  const viewRecipe = (id: string) => browserHistory.push(`/recipe/${id}`);

  useEffect(() => {
    // loadNext();
    // eslint-disable-next-line
  }, []);

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
          {canLoadMore && (
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
