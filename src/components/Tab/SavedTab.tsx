import React, { useMemo, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import deepEqual from 'dequal';
import RecipeList from '../Recipe/List';
import AppState from '../../store/state';
import classes from './style.module.scss';
import { usePartialRecipes } from '../Recipe/helpers';
import { RECIPE_PREVIEW_FIELDS } from '../Recipe/List/queries';
import { ReactComponent as Loading } from '../../assets/loading.svg';

const SavedTab: React.FC = () => {
  const savedRecipeIds = useSelector(
    (state: AppState) =>
      state.recipes.filter(recipe => recipe.bookmarkDate).map(recipe => recipe.id),
    deepEqual
  );
  // const savedRecipeIds: string[] = useMemo(() => [], []);
  // const memoizedSavedRecipeIds = useMemo(() => savedRecipeIds, []);
  const { recipes, loading, errorOccurred } = usePartialRecipes(
    savedRecipeIds,
    RECIPE_PREVIEW_FIELDS
  );
  return (
    <div className={classes.tab}>
      <h1>Saved</h1>
      <RecipeList
        recipes={recipes}
        loading={false}
        errorMessage={
          <>
            We had trouble getting to your saved recipes. This data may have been corrupted. Try
            clearing your this site&apos;s data in your browser.
          </>
        }
        emptyState={
          <>
            You haven&apos;t saved any recipes yet. To do that, click the bookmark icon on a recipe.
            Saved recipes are stored for offline use.
          </>
        }
        loadMore={() => []}
      />

      {/* JSON.stringify(savedRecipes) */}
    </div>
  );
};

export default SavedTab;
