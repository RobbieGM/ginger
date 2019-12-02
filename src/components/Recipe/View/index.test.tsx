import React from 'react';
import AppState, { Recipe } from 'store/state';
import { render, fireEvent } from '@testing-library/react';
import { Provider } from 'test-helpers';
import Urql, { Client, UseQueryState } from 'urql';
// eslint-disable-next-line import/no-extraneous-dependencies
import { fromValue } from 'wonka';
import CoreUIProvider from 'components/CoreUIProvider';
import { Reducer } from 'redux';
import { PersistPartial } from 'redux-persist/lib/persistReducer';
import { AppAction } from 'store/actions';
import RecipeView from '.';

type RecipeType = Pick<
  Recipe,
  | 'id'
  | 'averageRating'
  | 'cookTime'
  | 'directions'
  | 'imageURL'
  | 'ingredients'
  | 'isPrivate'
  | 'lastModified'
  | 'name'
  | 'prepTime'
  | 'servings'
  | 'userRating'
  | 'isMine'
>;
const recipe: RecipeType = {
  id: 'test-recipe',
  averageRating: 4,
  cookTime: 60,
  directions: ['step 1', 'step 2'],
  imageURL: '',
  ingredients: ['turkey', 'stuffing', 'fruit salad'],
  isPrivate: true,
  lastModified: Date.now(),
  name: 'Thanksgiving dinner',
  prepTime: 70,
  servings: 10,
  userRating: 5,
  isMine: true
};

// function mockQueryResponse(mockResponse: { data: any }) {
//   const mocked = () => {
//     const redoQuery = () => mockResponse;
//     console.log('mocking data as', mockResponse);
//     return [{ fetching: false, stale: false, ...mockResponse }, redoQuery] as [
//       UseQueryState<typeof mockResponse>,
//       typeof redoQuery
//     ];
//   };
//   jest.spyOn(Urql, 'useQuery').mockImplementation(mocked);
// }

function setup(rootReducer?: Reducer<AppState & PersistPartial, AppAction> | undefined) {
  const transformClient = (client: Client) => {
    jest.spyOn(client, 'executeQuery').mockImplementation(() =>
      fromValue({
        data: { recipes: [recipe] },
        fetching: false,
        error: undefined,
        operation: null as any
      })
    );
    return client;
  };
  return render(
    <Provider transformClient={transformClient} rootReducer={rootReducer}>
      <CoreUIProvider>
        <RecipeView recipeId={recipe.id} />
      </CoreUIProvider>
    </Provider>
  );
}

it('shows all essential recipe data', async () => {
  const { findByText, findAllByText } = setup();
  expect(await findAllByText(recipe.name.toString())).toHaveLength(2);
  expect(await findByText(recipe.cookTime.toString(), { exact: false })).toBeTruthy();
  expect(await findByText(recipe.prepTime.toString(), { exact: false })).toBeTruthy();
  expect(await findByText(recipe.directions[0])).toBeTruthy();
  expect(await findByText(recipe.ingredients[0])).toBeTruthy();
  expect(await findByText(recipe.servings.toString(), { exact: false })).toBeTruthy();
});

it('allows the user to bookmark the recipe', async done => {
  const { findByText, findByLabelText } = setup(
    (
      state = { queuedSnackbars: [], recipes: [], _persist: { version: 0, rehydrated: false } },
      action
    ) => {
      if (action.type === 'SET_BOOKMARK_DATE') {
        done();
      }
      return state;
    }
  );
  fireEvent.click(await findByLabelText('More options'));
  fireEvent.click(await findByText('Add to saved'));
}, 1000);

it('shows an error message when rating the recipe fails', async () => {
  jest.spyOn(console, 'error').mockImplementation(() => undefined); // suppress "cannot connect" error
  const { findByLabelText, findByText } = setup();
  fireEvent.click(await findByLabelText('4 stars'));
  expect(await findByText('Failed to rate', { exact: false })).toBeTruthy();
  jest.clearAllMocks();
});
