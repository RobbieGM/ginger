import React, { useState } from 'react';
import { useQuery } from 'react-apollo';
import { Plus } from 'react-feather';
import classNames from 'classnames';
import RecipeList from '../../Recipe/List';
import baseClasses from '../style.module.scss';
import myRecipesClasses from './style.module.scss';
import { RecipePreviewType } from '../../Recipe/List/queries';
import { GET_MY_RECIPES } from './queries';
import { useMergedRecipesQuery } from '../../Recipe/helpers';
import NewRecipeForm from '../../NewRecipeForm';

const MyRecipesTab: React.FC = () => {
  const { recipes, loading } = useMergedRecipesQuery(
    useQuery<{ myRecipes: RecipePreviewType[] }>(GET_MY_RECIPES),
    data => data.myRecipes
  );
  const [newRecipeFormOpen, setNewRecipeFormOpen] = useState(false);

  return (
    <div className={baseClasses.tab}>
      <h1>My Recipes</h1>
      <RecipeList
        recipes={recipes}
        loading={loading}
        errorMessage={<>An error occurred while fetching your recipes</>}
        emptyState={
          <>
            You haven&apos;t created any recipes yet. Click the plus button in the bottom right to
            get cooking!
          </>
        }
        loadMore={() => []}
      />
      <button
        className={`${myRecipesClasses.addButtonContainer} reset`}
        onClick={() => setNewRecipeFormOpen(true)}
      >
        <Plus size={24} />
      </button>
      <div
        className={classNames(myRecipesClasses.newRecipeFormContainer, {
          [myRecipesClasses.open]: newRecipeFormOpen
        })}
      >
        <NewRecipeForm close={() => setNewRecipeFormOpen(false)} />
      </div>
    </div>
  );
};

export default MyRecipesTab;
