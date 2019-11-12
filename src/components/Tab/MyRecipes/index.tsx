import React, { useState, useContext, useCallback } from 'react';
import nanoid from 'nanoid';
import { Plus } from 'react-feather';
import classNames from 'classnames';
import { useQuery } from 'urql';
import { RecipeInput } from 'backend/api-input/RecipeInput';
import { useDispatch } from 'react-redux';
import { DispatchType } from 'store/store';
import { ModalDialogContext } from '../../ModalDialogProvider';
import RecipeList from '../../Recipe/List';
import baseClasses from '../style.module.scss';
import myRecipesClasses from './style.module.scss';
import { RecipePreviewType } from '../../Recipe/List/queries';
import { GET_MY_RECIPES } from './queries';
import { useMergedRecipesQuery } from '../../Recipe/helpers';
import RecipeEditor from '../../Recipe/Editor';
import { createRecipe } from './actions';

/**
 * Used to see if a component may be visible, given a delay to account for time it takes to animate out.
 * @param delay
 */
function useDelayedVisibility(delay: number) {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [timeoutId, setTimeoutId] = useState(-1);
  return {
    visible,
    mounted,
    show() {
      setMounted(true);
      setVisible(true);
      clearTimeout(timeoutId);
    },
    hide() {
      setVisible(false);
      const id = window.setTimeout(() => setMounted(false), delay);
      setTimeoutId(id);
      clearTimeout(timeoutId);
    }
  };
}

const MyRecipesTab: React.FC = () => {
  const dispatch = useDispatch<DispatchType>();
  const { showModalDialog } = useContext(ModalDialogContext);
  type QueryData = { myRecipes: RecipePreviewType[] };
  const [queryState] = useQuery<QueryData>({
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
  function onSubmit(recipeData: Omit<RecipeInput, 'id'>) {
    const recipeWithId = { id: nanoid(), ...recipeData };
    dispatch(createRecipe(recipeWithId)).then(successful => {
      if (successful) {
        hide();
      } else {
        showModalDialog({
          title: 'Error',
          message: (
            <p>
              Your recipe couldn&apos;t be saved to the server. You can cancel, try again, or save
              it offline (it will go to your saved folder and be auto-synced later).
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
          }
        });
      }
    });
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
      <button className={myRecipesClasses.addButtonContainer} onClick={() => show()}>
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
