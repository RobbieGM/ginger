import React from 'react';
import { useQuery } from 'react-apollo';
import RecipeList from '../../Recipe/List';
import classes from '../style.module.scss';
import { RecipePreviewType } from '../../Recipe/List/queries';
import { GET_MY_RECIPES } from './queries';
import { useMergedRecipesQuery } from '../../Recipe/helpers';
import { ReactComponent as Loading } from '../../../assets/loading.svg';

const MyRecipesTab: React.FC = () => {
  const { recipes, loading, errorOccurred } = useMergedRecipesQuery(
    useQuery<{ myRecipes: RecipePreviewType[] }>(GET_MY_RECIPES),
    data => data.myRecipes
  );

  return (
    <div className={classes.tab}>
      <h1>My Recipes</h1>
      {loading ? (
        <Loading />
      ) : recipes && recipes.length > 0 ? (
        <RecipeList recipes={recipes} loadMore={() => []} />
      ) : recipes ? (
        <>You dont have any recipes yet.</>
      ) : (
        <>An error occurred.</>
      )}
    </div>
  );
};

export default MyRecipesTab;
