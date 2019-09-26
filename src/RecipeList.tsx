import React, { useState, useEffect } from 'react';
import classes from './RecipeList.module.scss';
import AppState, { Recipe } from './store/state';
import { Bookmark, Star, Clock } from 'react-feather';
import { useDispatch, useSelector } from 'react-redux';
import { store } from './store/store';
import { createRecipe } from './store/actions';

const RECIPES_TO_LOAD_AT_ONCE = 2;

function useInfiniteScroll<T>(
  generator: AsyncGenerator<T>,
  itemsToLoadAtOnce: number
) {
  const [list, setList] = useState<T[]>([]);
  async function loadMore() {
    const nextItems: T[] = [];
    for (let i = 0; i < itemsToLoadAtOnce; i++) {
      const { done, value } = await generator.next();
      if (!done) {
        nextItems.push(value);
      } else {
        break;
      }
    }
    if (nextItems.length !== 0) {
      setList(l => [...l, ...nextItems]);
    }
  }
  return [list, loadMore] as [T[], () => void];
}

interface Props {
  title: string;
  getRecipeIds: AsyncGenerator<string, void>;
}

// TODO: figure out where in the code to persist stuff to redux
// idea: return list of ids asynchronously from generator after the recipes for those ids have been generated

const getRecipeById = (recipes: Recipe[]) => (id: string) => {
  const found = recipes.find(recipe => recipe.id === id);
  if (found === undefined) {
    throw new Error(`Invalid ID for recipe: ${id}`);
  }
  return found;
};

const RecipeList: React.FC<Props> = props => {
  const [recipeIds, loadMoreRecipes] = useInfiniteScroll(
    props.getRecipeIds,
    RECIPES_TO_LOAD_AT_ONCE
  );
  const dispatch = useDispatch<typeof store.dispatch>();
  const recipes = recipeIds.map(
    getRecipeById(useSelector((state: AppState) => state.recipes))
  );

  useEffect(() => {
    loadMoreRecipes();
    // eslint-disable-next-line
  }, []);

  return (
    <div className={classes.recipeList}>
      <h1>
        {props.title}
        <button onClick={() => dispatch(createRecipe(recipes[0]))}>
          add first recipe to storage
        </button>
      </h1>
      <div className={classes.recipeCardContainer}>
        {recipes.map(recipe => (
          <div
            className={classes.recipeCard}
            key={recipe.id}
            style={{ backgroundImage: `url(${recipe.imageURL})` }}
          >
            <div className={classes.bookmarkIcon}>
              <Bookmark />
            </div>
            <div className={classes.bottomContent}>
              <h3>{recipe.name}</h3>
              <div className={classes.recipeMetadata}>
                <div className={classes.star}>
                  <Star />
                  {recipe.averageStars}
                </div>
                <div>
                  <Clock />
                  {recipe.prepTime + recipe.cookTime}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button onClick={loadMoreRecipes}>Load more</button>
    </div>
  );
};

export default RecipeList;
