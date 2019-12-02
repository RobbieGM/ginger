import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { Provider } from 'test-helpers';
import RecipeList from '.';
import * as actions from '../actions';
import { RecipePreview } from './queries';

// function withProviders(component: JSX.Element) {
//   return (
//     <ClientProvider value={apiClient}>
//       <ReduxProvider store={store}>
//         <PersistGate loading={null} persistor={persistor}>
//           {component}
//         </PersistGate>
//       </ReduxProvider>
//     </ClientProvider>
//   );
// }

function setupWithRecipe() {
  const recipes: RecipePreview[] = [
    {
      id: '',
      name: 'possum nuggets',
      prepTime: 30,
      cookTime: 20,
      servings: 4
    }
  ];
  return render(
    <Provider>
      <RecipeList
        recipes={recipes}
        loading={false}
        errorOccurred={false}
        errorMessage={<></>}
        emptyState={<></>}
        loadMore={() => Promise.resolve([])}
      />
    </Provider>
  );
}

it('renders recipes when they load', async () => {
  const { findByText } = setupWithRecipe();
  expect(await findByText('possum nuggets')).toBeTruthy();
  expect(await findByText('50')).toBeTruthy();
});

it('saves recipes when the save button is clicked', async () => {
  const { findByLabelText } = setupWithRecipe();
  const spy = jest.spyOn(actions, 'setBookmarkDate');
  fireEvent.click(await findByLabelText('Save'));
  expect(spy).toHaveBeenCalled();
});

it('shows the empty state when no recipes exist', () => {
  const { findByText } = render(
    <Provider>
      <RecipeList
        recipes={[]}
        loading={false}
        errorOccurred={false}
        errorMessage={<></>}
        emptyState={<>empty state</>}
        loadMore={() => Promise.resolve([])}
      />
    </Provider>
  );
  expect(findByText('empty state')).resolves.toBeTruthy();
});

it('shows a spinner when loading', () => {
  const { findByTitle } = render(
    <Provider>
      <RecipeList
        recipes={[]}
        loading
        errorOccurred={false}
        errorMessage={<></>}
        emptyState={<></>}
        loadMore={() => Promise.resolve([])}
      />
    </Provider>
  );
  expect(findByTitle('Loading')).resolves.toBeTruthy();
});

it('shows an error message when recipes fail to load', () => {
  const { findByText } = render(
    <Provider>
      <RecipeList
        recipes={undefined}
        loading={false}
        errorOccurred
        errorMessage={<span>error occurred</span>}
        emptyState={<></>}
        loadMore={() => Promise.resolve([])}
      />
    </Provider>
  );
  expect(findByText('error occurred')).resolves.toBeTruthy();
});
