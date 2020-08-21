import React from 'react';
import { useSelector } from 'react-redux';
import deepEqual from 'dequal';
import RecipeList from '../../Recipe/List';
import AppState from '../../../store/state';
import classes from '../style.module.scss';
import { usePartialRecipes, recipeHasFields } from '../../Recipe/helpers';
import { RECIPE_PREVIEW_FIELDS, RecipePreview } from '../../Recipe/List/queries';

const SavedTab: React.FC = () => {
  const savedRecipes = useSelector(
    (state: AppState) => state.recipes.filter(recipe => recipe.bookmarkDate),
    deepEqual
  );
  const { recipes: onlineRecipes, loading, error } = usePartialRecipes(
    savedRecipes.map(recipe => recipe.id),
    RECIPE_PREVIEW_FIELDS
  );
  const recipes =
    navigator.onLine && error == null ? onlineRecipes : (savedRecipes as RecipePreview[]);
  // assume every recipe with bookmarkDate has all other fields
  const sortedRecipes = recipes?.sort((a, b) => b.bookmarkDate! - a.bookmarkDate!);

  return (
    <div className={classes.tab}>
      <h1>Saved</h1>
      <RecipeList
        recipes={sortedRecipes}
        loading={loading}
        error={navigator.onLine ? undefined : error}
        errorMessage={
          <>
            We had trouble accessing your saved recipes. If this is because there is missing data,
            try again when you&apos;re online.
          </>
        }
        emptyState={
          <>
            You haven&apos;t saved any recipes yet. To do that, click the bookmark icon on a recipe.
            Saved recipes are stored for offline use.
          </>
        }
        loadNext={() => undefined}
      />
    </div>
  );
};

export default SavedTab;
