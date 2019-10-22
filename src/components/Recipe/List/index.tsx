import React, { useEffect } from 'react';
import classNames from 'classnames';
import { useDispatch } from 'react-redux';
import { Bookmark, Star, Clock } from 'react-feather';
import classes from './style.module.scss';
import { store } from '../../../store/store';
import { Recipe } from '../../../backend/data-types/Recipe';
import { RECIPE_PREVIEW_FIELD_TYPE } from './queries';
import { unbookmarkRecipe, bookmarkRecipe } from '../actions';

interface Props {
  recipes: Pick<Recipe, RECIPE_PREVIEW_FIELD_TYPE>[];
  /**
   * A function called to load more recipes into the RecipeList, used for infinite scrolling.
   */
  loadMore: () => string[];
}

/**
 * Displays a list of recipes.
 *
 * @param getRecipeIds an async generator that returns ids of recipes to be fetched from the store.
 */
const RecipeList: React.FC<Props> = ({ recipes, loadMore }) => {
  const dispatch = useDispatch<typeof store.dispatch>();
  const toggleBookmark = (recipe: Pick<Recipe, 'id' | 'bookmarkDate'>) =>
    dispatch(recipe.bookmarkDate ? unbookmarkRecipe(recipe.id) : bookmarkRecipe(recipe.id));

  useEffect(() => {
    loadMore();
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <div className={classes.recipeCardContainer}>
        {recipes.map(recipe => (
          <div
            className={classes.recipeCard}
            key={recipe.id}
            style={{ backgroundImage: `url(${recipe.imageURL})` }}
          >
            <button
              className={classNames('reset', classes.bookmarkIcon, {
                [classes.bookmarked]: recipe.bookmarkDate
              })}
              onClick={() => toggleBookmark(recipe)}
            >
              <Bookmark />
            </button>
            <div className={classes.bottomContent}>
              <h3>{recipe.name}</h3>
              <div className={classes.recipeMetadata}>
                <div className={classes.star}>
                  <Star />
                  {recipe.averageRating}
                </div>
                <div>
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
  );
};

export default RecipeList;
