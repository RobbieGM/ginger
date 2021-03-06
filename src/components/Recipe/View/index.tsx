import { HistoryContext } from 'components/HistoryProvider';
import Rating from 'components/Rating';
import { useEventListener, useMemory } from 'helpers';
import React, { useContext, useRef, useState } from 'react';
import { ArrowLeft, Eye, Lock } from 'react-feather';
import { useDispatch, useSelector } from 'react-redux';
import AppState from 'store/state';
import { DispatchType } from 'store/store';
import { ReactComponent as Loading } from '../../../assets/loading.svg';
import topBarClasses from '../../../top-bar.module.scss';
import { rate } from '../actions';
import { useMergedRecipesQuery } from '../helpers';
import { useRecipesQuery } from '../queries';
import RecipeViewMoreOptions from './MoreOptions';
import classes from './style.module.scss';

interface Props {
  recipeId: string;
  hide?: () => void;
}

const RecipeView: React.FC<Props> = ({ recipeId, hide }) => {
  const dispatch = useDispatch<DispatchType>();
  const [currentList, setCurrentList] = useState<'ingredients' | 'directions' | undefined>();
  const ingredientsAndDirections = useRef<HTMLDivElement>(null);
  function scrollIngredientsAndDirections(left: number) {
    ingredientsAndDirections.current?.scrollTo?.({ left, behavior: 'smooth' });
  }
  function updateCurrentList() {
    const div = ingredientsAndDirections.current!;
    const scrollFraction = div.scrollLeft / (div.scrollWidth - div.clientWidth);
    if (scrollFraction > 0.5 && currentList !== 'directions') {
      setCurrentList('directions');
    }
    if (scrollFraction <= 0.5 && currentList !== 'ingredients') {
      setCurrentList('ingredients');
    }
    if (isNaN(scrollFraction)) {
      setCurrentList(undefined);
    }
  }
  const { recipes, loading, error } = useMergedRecipesQuery(
    useRecipesQuery(
      [recipeId],
      [
        'averageRating',
        'cookTime',
        'directions',
        'imageURL',
        'ingredients',
        'isPrivate',
        'lastModified',
        'name',
        'prepTime',
        'servings',
        'userRating',
        'isMine'
      ]
    ),
    x => x
  );
  type ReturnedRecipe = NonNullable<typeof recipes>[number];
  const savedRecipe = useSelector((state: AppState) =>
    state.recipes.find(recipe => recipe.id === recipeId && recipe.bookmarkDate != null)
  );
  const recipe = useMemory(navigator.onLine ? recipes?.[0] : (savedRecipe as ReturnedRecipe)); // useMemory to avoid insta-disappearing data on delete
  const { goBack } = useContext(HistoryContext);
  useEventListener(window, 'resize', () => {
    updateCurrentList();
  });

  return (
    <div className={classes.recipeView}>
      <div className={`${topBarClasses.topBar} ${classes.topBar}`}>
        <button className={topBarClasses.button} onClick={goBack} aria-label='Back'>
          <ArrowLeft />
        </button>
        <span className={topBarClasses.title}>
          {recipe ? recipe.name : loading ? 'Loading...' : error ? 'Error' : ''}
        </span>
        {recipe && <RecipeViewMoreOptions recipe={recipe} onDelete={hide} />}
      </div>
      <div className={classes.main}>
        {recipe ? (
          <>
            <h1>
              {recipe.name}
              {recipe.isMine &&
                (recipe.isPrivate ? (
                  <span title='This recipe is private'>
                    <Lock size={18} />
                  </span>
                ) : (
                  <span title='This recipe is public'>
                    <Eye size={18} />
                  </span>
                ))}
            </h1>
            <div className={classes.metadata}>
              <div className={classes.ratingContainer}>
                <Rating
                  value={recipe.userRating ?? recipe.averageRating ?? 0}
                  onChange={rating => dispatch(rate(recipe.id, rating))}
                />
              </div>
              {recipe.averageRating && (
                <div>{recipe.averageRating?.toFixed(1)}-star average rating,&nbsp;</div>
              )}
              <div>{recipe.servings} servings,&nbsp;</div>
              <div>
                {recipe.prepTime}min preparation + {recipe.cookTime}min cooking
              </div>
            </div>
            <div className={classes.ingredientsAndDirectionsContainer}>
              <div className={classes.buttons}>
                <button
                  className={currentList === 'ingredients' ? classes.selected : undefined}
                  onClick={() => scrollIngredientsAndDirections(0)}
                >
                  Ingredients
                </button>
                <button
                  className={currentList === 'directions' ? classes.selected : undefined}
                  onClick={() => scrollIngredientsAndDirections(9999)}
                >
                  Directions
                </button>
              </div>
              <div
                className={classes.ingredientsAndDirections}
                onScroll={updateCurrentList}
                ref={ingredientsAndDirections}
              >
                <ul>
                  {recipe.ingredients.map(ingredient => (
                    <li key={ingredient}>{ingredient}</li>
                  ))}
                </ul>
                <ol>
                  {recipe.directions.map(direction => (
                    <li key={direction}>{direction}</li>
                  ))}
                </ol>
              </div>
            </div>
          </>
        ) : loading ? (
          <Loading className={classes.loading} />
        ) : error ? (
          <>An error occurred when loading this recipe.</>
        ) : null}
      </div>
    </div>
  );
};

export default RecipeView;
