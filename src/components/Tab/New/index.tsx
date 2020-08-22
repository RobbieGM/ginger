import { InfiniteRecipeScrollResult } from 'backend/data-types/InfiniteRecipeScrollResult';
import RecipeList from 'components/Recipe/List';
import { useInfiniteScrollRecipeQuery } from 'components/Recipe/List/infinite-scroll';
import React, { useEffect } from 'react';
import baseClasses from '../style.module.scss';
import { GET_NEW_RECIPES } from './queries';

const NewTab: React.FC = () => {
  const { recipes, loading, error, loadNext, canLoadMore, reload } = useInfiniteScrollRecipeQuery<{
    newRecipes: InfiniteRecipeScrollResult;
  }>(
    ({ offset, results }) => ({
      query: GET_NEW_RECIPES,
      variables: { skip: offset, results }
    }),
    data => data.newRecipes
  );
  useEffect(() => {
    loadNext();
  }, [loadNext]);
  return (
    <div className={baseClasses.tab}>
      <h1>Newly Published</h1>
      <RecipeList
        recipes={recipes}
        loading={loading}
        error={error}
        errorMessage={<>An error occurred while loading your recipes</>}
        emptyState={
          <>
            You haven&apos;t created any recipes yet. Click the plus button in the bottom right to
            get cooking!
          </>
        }
        scrollContainer={window}
        canLoadMore={canLoadMore}
        loadNext={loadNext}
      />
    </div>
  );
};

export default NewTab;
