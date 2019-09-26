import React, { useState, Dispatch } from 'react';
import RecipeList from './RecipeList';
import { Recipe } from './store/state';
import { useDispatch } from 'react-redux';
import { AppAction, createRecipe as addRecipe } from './store/actions';

const DUMMY_FAVORITES: Recipe[] = [
  {
    id: 'djfsa89m23f',
    name: 'Chocolate Chip Cookies',
    averageStars: 4,
    prepTime: 20,
    cookTime: 60,
    ingredients: [],
    directions: 'Cook for 20 mins.',
    imageURL: 'https://picsum.photos/200/200'
  },
  {
    id: '2398f2983f',
    name: 'Brownies',
    averageStars: 4,
    prepTime: 20,
    cookTime: 60,
    ingredients: [],
    directions: 'Cook for 20 mins.',
    imageURL: 'https://picsum.photos/200/200'
  },
  {
    id: 'a,sfk2f3,2',
    name: 'Cake',
    averageStars: 4,
    prepTime: 20,
    cookTime: 60,
    ingredients: [],
    directions: 'Cook for 20 mins.',
    imageURL: 'https://picsum.photos/200/200'
  },
  {
    id: 'f2ofqmksff',
    name: 'Meatballs',
    averageStars: 4,
    prepTime: 20,
    cookTime: 60,
    ingredients: [],
    directions: 'Cook for 20 mins.',
    imageURL: 'https://picsum.photos/200/200'
  },
  {
    id: 'fsafl2jk3f',
    name: 'Broccoli',
    averageStars: 4,
    prepTime: 20,
    cookTime: 60,
    ingredients: [],
    directions: 'Cook for 20 mins.',
    imageURL: 'https://picsum.photos/200/200'
  }
];

async function* getRecipes(dispatch: Dispatch<AppAction>) {
  for (const recipe of DUMMY_FAVORITES) {
    dispatch(addRecipe(recipe));
    yield recipe.id;
  }
}

const SavedTab: React.FC = () => {
  const dispatch = useDispatch();
  const [recipeGenerator] = useState(getRecipes.bind(null, dispatch));
  return <RecipeList title='Saved' getRecipeIds={recipeGenerator} />;
};

export default SavedTab;
