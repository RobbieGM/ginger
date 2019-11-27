import { RecipeInput } from 'backend/api-input/RecipeInput';
import classNames from 'classnames';
import { useDelayedVisibility } from 'helpers';
import nanoid from 'nanoid';
import React, { useCallback, useContext } from 'react';
import { Plus } from 'react-feather';
import { useDispatch } from 'react-redux';
import { DispatchType } from 'store/store';
import { useQuery } from 'urql';
import { CoreUIContext } from '../../CoreUIProvider';
import RecipeEditor from '../../Recipe/Editor';
import { useMergedRecipesQuery } from '../../Recipe/helpers';
import RecipeList from '../../Recipe/List';
import { RecipePreview } from '../../Recipe/List/queries';
import baseClasses from '../style.module.scss';
import { createRecipe } from './actions';
import { GET_MY_RECIPES } from './queries';
import myRecipesClasses from './style.module.scss';

const MyRecipesTab: React.FC = () => {
  const dispatch = useDispatch<DispatchType>();
  const { showModalDialog } = useContext(CoreUIContext);
  type QueryData = { myRecipes: RecipePreview[] };
  const [queryState, refresh] = useQuery<QueryData>({
    query: GET_MY_RECIPES,
    requestPolicy: 'network-only'
  });
  const dataToRecipes = useCallback((data: QueryData) => data.myRecipes, []);
  const { recipes, loading, errorOccurred } = useMergedRecipesQuery(queryState, dataToRecipes);
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
      refresh({ requestPolicy: 'network-only' });
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
        errorOccurred={errorOccurred}
        errorMessage={<>An error occurred while fetching your recipes</>}
        emptyState={
          <>
            You haven&apos;t created any recipes yet. Click the plus button in the bottom right to
            get cooking!
          </>
        }
        loadMore={async () => []}
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
