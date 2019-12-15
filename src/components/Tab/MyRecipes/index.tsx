import { RecipeInput } from 'backend/api-input/RecipeInput';
import { InfiniteRecipeScrollResult } from 'backend/data-types/InfiniteRecipeScrollResult';
import classNames from 'classnames';
import { useInfiniteScrollRecipeQuery } from 'components/Recipe/List/infinite-scroll';
import { useDelayedVisibility } from 'helpers';
import nanoid from 'nanoid';
import React, { useContext, useEffect } from 'react';
import { Plus } from 'react-feather';
import { useDispatch } from 'react-redux';
import { DispatchType } from 'store/store';
import { CoreUIContext } from '../../CoreUIProvider';
import RecipeEditor from '../../Recipe/Editor';
import RecipeList from '../../Recipe/List';
import baseClasses from '../style.module.scss';
import { createRecipe } from './actions';
import { GET_MY_RECIPES } from './queries';
import myRecipesClasses from './style.module.scss';

const MyRecipesTab: React.FC = () => {
  const dispatch = useDispatch<DispatchType>();
  const { showModalDialog } = useContext(CoreUIContext);
  // type QueryData = { myRecipes: RecipePreview[] };
  // const [queryState, refresh] = useQuery<QueryData>({
  //   query: GET_MY_RECIPES
  // });
  // const dataToRecipes = useCallback((data: QueryData) => data.myRecipes, []);
  // const { recipes, loading, error } = useMergedRecipesQuery(queryState, dataToRecipes);
  const { recipes, loading, error, loadNext, canLoadMore, reload } = useInfiniteScrollRecipeQuery<{
    myRecipes: InfiniteRecipeScrollResult;
  }>(
    ({ offset, results }) => ({
      query: GET_MY_RECIPES,
      variables: { skip: offset, results }
    }),
    data => data.myRecipes
  );
  useEffect(() => {
    loadNext();
  }, [loadNext]);
  const {
    mounted: newRecipeFormMounted,
    visible: newRecipeFormOpen,
    show,
    hide
  } = useDelayedVisibility(200);
  async function onSubmit(recipeData: Omit<RecipeInput, 'id'>) {
    const recipeWithId = { id: nanoid(), ...recipeData };
    const successful = await dispatch(createRecipe(recipeWithId));
    if (successful) {
      reload();
      hide();
    } else {
      showModalDialog({
        title: 'Error',
        message: (
          <p>
            Your recipe couldn&apos;t be saved to the server. You can cancel, try again, or save it
            offline (it will go to your saved folder and be auto-synced later).
          </p>
        ),
        buttons: ['Cancel', 'Save offline', 'Retry'],
        lastButtonClass: 'blue'
      }).then(button => {
        if (button === 'Retry') {
          onSubmit(recipeData);
        }
        if (button === 'Save offline') {
          dispatch(createRecipe(recipeWithId, true));
          hide();
        }
      });
    }
  }

  return (
    <div className={baseClasses.tab}>
      <h1>My Recipes</h1>
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
      <button
        className={myRecipesClasses.addButtonContainer}
        onClick={() => show()}
        aria-label='Create recipe'
      >
        <Plus size={24} />
      </button>
      <div
        className={classNames(myRecipesClasses.newRecipeFormContainer, {
          [myRecipesClasses.open]: newRecipeFormOpen
        })}
      >
        {newRecipeFormMounted && (
          <RecipeEditor close={() => hide()} intent='create' onSubmit={onSubmit} />
        )}
      </div>
    </div>
  );
};

export default MyRecipesTab;
