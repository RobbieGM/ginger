import React from 'react';
import { act, render, fireEvent } from '@testing-library/react';
import { Provider } from 'test-helpers';
import MyRecipesTab from '.';

jest.useFakeTimers();

it('waits before unmounting the component', async () => {
  const { findByLabelText } = render(
    <Provider>
      <MyRecipesTab />
    </Provider>
  );
  fireEvent.click(await findByLabelText('Create recipe'));
  fireEvent.click(await findByLabelText('Close'));
  jest.advanceTimersByTime(190);
  expect(await findByLabelText('Close')).toBeTruthy();
  act(() => {
    // This time span triggers an update so it must be wrapped in act
    jest.advanceTimersByTime(20);
  });
  expect(findByLabelText('Close')).rejects.toBeTruthy();
});
