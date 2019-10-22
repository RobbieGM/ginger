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
      {loading ? (
        <Loading />
      ) : recipes !== undefined && recipes.length > 0 ? (
        <RecipeList recipes={recipes} loadMore={() => []} />
      ) : recipes !== undefined ? (
        <>You dont have any recipes yet</>
      ) : (
        <>An error occurred.</>
      )}

      {/* JSON.stringify(savedRecipes) */}
    </div>
  );
};

export default SavedTab;
