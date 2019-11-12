import React, { useState } from 'react';
import { render, fireEvent } from '@testing-library/react';
import { KeyedList } from './types';
import ListEditor from '.';

// const pause = (delay: number) => new Promise(res => setTimeout(res, delay));

const ListEditorContainer: React.FC = () => {
  const PLACEHOLDER = 'Add an item...';
  const [list, setList] = useState([] as KeyedList<string>);
  return <ListEditor type='ordered' nextPlaceholder={PLACEHOLDER} list={list} setList={setList} />;
};

it('creates and deletes items', () => {
  const editor = <ListEditorContainer />;
  const rendered = render(editor);
  const getListValues = () =>
    [...rendered.container.querySelectorAll('input').values()]
      .map(input => input.value)
      .filter(value => value !== '');
  const addItem = (content: string) => {
    const inputs = rendered.getAllByPlaceholderText('Add an item...');
    const lastInput = inputs[inputs.length - 1];
    fireEvent.change(lastInput, { target: { value: content } });
  };
  const removeItem = (index: number) => {
    rendered.getAllByLabelText('Remove')[index].click();
  };

  for (let i = 1; i <= 4; i++) addItem(`item ${i}`);
  expect(getListValues()).toEqual(['item 1', 'item 2', 'item 3', 'item 4']);
  removeItem(2);
  expect(getListValues()).toEqual(['item 1', 'item 2', 'item 4']);
});
