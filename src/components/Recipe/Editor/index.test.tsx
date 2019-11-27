import React from 'react';
import { RecipeInput } from 'backend/api-input/RecipeInput';
import { render, fireEvent } from '@testing-library/react';
import CoreUIProvider from 'components/CoreUIProvider';
import { Provider } from 'test-helpers';
import RecipeEditor from '.';

const setup = (onSubmit: (recipe: Omit<RecipeInput, 'id'>) => void, close?: () => void) =>
  render(
    <Provider>
      <CoreUIProvider>
        <RecipeEditor intent='create' close={() => {}} onSubmit={onSubmit} />
      </CoreUIProvider>
    </Provider>
  );

// This test will timeout if the input is incorrect rather than return insufficient input, due to form validation
it('returns the inputted recipe data when it is valid', async done => {
  const { findByPlaceholderText, getAllByPlaceholderText, getByText, container } = setup(recipe => {
    const expected: typeof recipe = {
      name: 'title',
      prepTime: 1,
      cookTime: 2,
      servings: 3,
      isPrivate: true,
      ingredients: ['ingredient 1'],
      directions: ['step 1'],
      imageURL: '',
      lastModified: expect.anything()
    };
    expect(recipe).toEqual(expected);
    done();
  });
  const setByPlaceholder = async (placeholder: string, value: string) =>
    fireEvent.change(await findByPlaceholderText(placeholder), { target: { value } });
  // Fill in fields with placeholders
  await setByPlaceholder('Recipe Title', 'title');
  await setByPlaceholder('Prep time (min)', '1');
  await setByPlaceholder('Cook time (min)', '2');
  await setByPlaceholder('Servings', '3');
  // Make private
  fireEvent.click(getByText('Private'));
  // Populate ingredients and instructions lists
  const addToListByPlaceholder = (placeholder: string, value: string) => {
    const lastInputWithPlaceholder = getAllByPlaceholderText(placeholder).pop()!;
    fireEvent.change(lastInputWithPlaceholder, { target: { value } });
  };
  addToListByPlaceholder('Add an ingredient...', 'ingredient 1');
  addToListByPlaceholder('Add an instruction...', 'step 1');
  // Submit
  fireEvent.click(getByText('Create'));
}, 200);

it('prompts the user to close when unsaved data is there', async () => {
  const close = jest.fn();
  const { findByPlaceholderText, getByLabelText, getByText } = setup(() => {}, close);
  fireEvent.change(await findByPlaceholderText('Recipe Title'), { target: { value: 'burritos' } });
  fireEvent.click(getByLabelText('Close'));
  expect(getByText('Discard', { selector: 'button' })).toBeTruthy();
  expect(close).not.toHaveBeenCalled();
});
