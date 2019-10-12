import React, { useState, Dispatch } from 'react';
import { useDispatch } from 'react-redux';
import RecipeList from './RecipeList';
import { Recipe } from './store/state';
import { AppAction, mergeRecipes } from './store/actions';
import classes from './Tab.module.scss';

const DUMMY_FAVORITES: Recipe[] = [
  {
    id: 'djfsa89m23f',
    name: 'Chocolate Chip Cookies',
    averageStars: 4,
    prepTime: 20,
    cookTime: 60,
    ingredients: [],
    directions: 'Cook for 20 mins.',
    imageURL: 'https://picsum.photos/200/200',
    lastModified: 1569618434564
  },
  {
    id: '2398f2983f',
    name: 'Brownies',
    averageStars: 4,
    prepTime: 20,
    cookTime: 60,
    ingredients: [],
    directions: 'Cook for 20 mins.',
    imageURL: 'https://picsum.photos/200/200',
    lastModified: 1569618434564
  },
  {
    id: 'a,sfk2f3,2',
    name: 'Cake',
    averageStars: 4,
    prepTime: 20,
    cookTime: 60,
    ingredients: [],
    directions: 'Cook for 20 mins.',
    imageURL: 'https://picsum.photos/200/200',
    lastModified: 1569618434564
  },
  {
    id: 'f2ofqmksff',
    name: 'Meatballs',
    averageStars: 4,
    prepTime: 20,
    cookTime: 60,
    ingredients: [],
    directions: 'Cook for 20 mins.',
    imageURL: 'https://picsum.photos/200/200',
    lastModified: 1569618434564
  },
  {
    id: 'fsafl2jk3f',
    name: 'Broccoli',
    averageStars: 4,
    prepTime: 20,
    cookTime: 60,
    ingredients: [],
    directions: 'Cook for 20 mins.',
    imageURL: 'https://picsum.photos/200/200',
    lastModified: 1569618434564
  }
];

async function* getRecipes(dispatch: Dispatch<AppAction>) {
  for (const recipe of DUMMY_FAVORITES) {
    dispatch(mergeRecipes(recipe));
    yield recipe.id;
  }
}

const SavedTab: React.FC = () => {
  const dispatch = useDispatch();
  const [recipeGenerator] = useState(getRecipes.bind(null, dispatch));
  return (
    <div className={classes.tab}>
      <h1>Saved</h1>
      <RecipeList getRecipeIds={recipeGenerator} />
    </div>
  );
};

export default SavedTab;
