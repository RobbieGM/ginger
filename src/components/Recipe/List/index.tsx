import React, { useEffect } from 'react';
import classNames from 'classnames';
import { useDispatch } from 'react-redux';
import { Bookmark, Star, Clock } from 'react-feather';
import classes from './style.module.scss';
import { DispatchType } from '../../../store/store';
import { Recipe } from '../../../backend/data-types/Recipe';
import { RecipePreview } from './queries';
import { setBookmarkDate } from '../actions';
import { ReactComponent as Loading } from '../../../assets/loading.svg';

interface Props {
  recipes: RecipePreview[] | undefined;
  loading: boolean;
  errorOccurred: boolean;
  errorMessage: JSX.Element;
  emptyState: JSX.Element;
  /**
   * A function called to load more recipes into the RecipeList, used for infinite scrolling.
   */
  loadMore: () => Promise<RecipePreview[]>;
}

/**
 * Displays a list of recipes.
 *
 * @param getRecipeIds an async generator that returns ids of recipes to be fetched from the store.
 */
const RecipeList: React.FC<Props> = ({
  recipes,
  loading,
  errorOccurred,
  emptyState,
  errorMessage,
  loadMore
}) => {
  const dispatch = useDispatch<DispatchType>();
  const toggleBookmark = (recipe: Pick<Recipe, 'id' | 'bookmarkDate'>) => {
    dispatch(setBookmarkDate(recipe.id, recipe.bookmarkDate ? undefined : new Date()));
  };

  useEffect(() => {
    loadMore();
    // eslint-disable-next-line
  }, []);

  return (
    <div className={classes.recipeList}>
      {loading ? (
        <Loading />
      ) : recipes && recipes.length ? (
        <>
          <div className={classes.recipeCardContainer}>
            {recipes.map(recipe => (
              <div
                className={classes.recipeCard}
                key={recipe.id}
                style={recipe.imageURL ? { backgroundImage: `url(${recipe.imageURL})` } : {}}
              >
                <button
                  className={classNames(classes.bookmarkIcon, {
                    [classes.bookmarked]: recipe.bookmarkDate
                  })}
                  onClick={() => toggleBookmark(recipe)}
                  aria-label='Save'
                >
                  <Bookmark />
                </button>
                <div className={classes.bottomContent}>
                  <h3>{recipe.name}</h3>
                  <div className={classes.recipeMetadata}>
                    <div className={classes.star} aria-label='Average rating'>
                      <Star />
                      {recipe.averageRating}
                    </div>
                    <div aria-label='Total time'>
                      <Clock />
                      {recipe.prepTime + recipe.cookTime}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button onClick={loadMore}>Load more</button>
        </>
      ) : recipes ? (
        emptyState
      ) : errorOccurred ? (
        errorMessage
      ) : (
        <span style={{ display: 'none' }}>This error should not show</span>
      )}
    </div>
  );
};

export default RecipeList;
