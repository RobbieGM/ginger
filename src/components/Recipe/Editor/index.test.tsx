import React from 'react';
import { RecipeInput } from 'backend/api-input/RecipeInput';
import { render, fireEvent } from '@testing-library/react';
import ModalDialogProvider from 'components/ModalDialogProvider';
import RecipeEditor from '.';

const setup = (onSubmit: (recipe: Omit<RecipeInput, 'id'>) => void, close?: () => void) =>
  render(
    <ModalDialogProvider>
      <RecipeEditor intent='create' close={() => {}} onSubmit={onSubmit} />
    </ModalDialogProvider>
  );

// This test will timeout if the input is incorrect rather than return insufficient input, due to form validation
it('returns the inputted recipe data when it is valid', done => {
  const { getByPlaceholderText, getAllByPlaceholderText, getByText, container } = setup(recipe => {
    const expected: typeof recipe = {
      name: 'title',
      prepTime: 1,
      cookTime: 2,
      isPrivate: true,
      ingredients: ['ingredient 1'],
      directions: ['step 1'],
      imageURL: '',
      lastModified: expect.anything()
    };
    expect(recipe).toEqual(expected);
    done();
  });
  const setByPlaceholder = (placeholder: string, value: string) =>
    fireEvent.change(getByPlaceholderText(placeholder), { target: { value } });
  // Fill in fields with placeholders
  setByPlaceholder('Recipe Title', 'title');
  setByPlaceholder('Prep time (min)', '1');
  setByPlaceholder('Cook time (min)', '2');
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
  fireEvent.submit(container.querySelector('form')!);
}, 200);

it('prompts the user to close when unsaved data is there', () => {
  const close = jest.fn();
  const { getByPlaceholderText, getByLabelText, getByText } = setup(() => {}, close);
  fireEvent.change(getByPlaceholderText('Recipe Title'), { target: { value: 'burritos' } });
  fireEvent.click(getByLabelText('Close'));
  expect(getByText('Discard', { selector: 'button' })).toBeTruthy();
  expect(close).not.toHaveBeenCalled();
});
