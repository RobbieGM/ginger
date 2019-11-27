import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import CoreUIProvider, { ModalDialogContext, ModalDialog } from '.';

function setup(
  getContent: (showDialog: (dialog: ModalDialog<string>) => Promise<string>) => JSX.Element
) {
  return render(
    <CoreUIProvider>
      <ModalDialogContext.Consumer>
        {({ showModalDialog }) => getContent(showModalDialog)}
      </ModalDialogContext.Consumer>
    </CoreUIProvider>
  );
}

it('renders with correct title, message, and buttons', () => {
  const dialog: ModalDialog<string> = {
    title: 'title',
    message: <p>message</p>,
    buttons: ['Cancel', 'OK'],
    lastButtonClass: 'blue'
  };
  const { getByText, container } = setup(showDialog => (
    <button onClick={() => showDialog(dialog)} data-testid>
      Click me
    </button>
  ));
  const showDialogButton = getByText('Click me');
  fireEvent.click(showDialogButton);
  expect(getByText('title')).toBeTruthy();
  expect(getByText('message')).toBeTruthy();
  const buttons = [...container.querySelectorAll('button:not([data-testid])').values()];
  expect(buttons.map(button => button.innerHTML)).toEqual(['Cancel', 'OK']);
  expect(buttons[1].className).toEqual(expect.stringContaining('blue'));
});

it('shows queued dialogs in order', () => {
  const defaultDialog: ModalDialog<string> = {
    title: 'title',
    message: <></>,
    buttons: ['OK']
  };
  const { getByText, queryByText } = setup(showDialog => (
    <>
      <button onClick={() => showDialog({ ...defaultDialog, message: <p>Message 1</p> })}>
        Show dialog 1
      </button>
      <button onClick={() => showDialog({ ...defaultDialog, message: <p>Message 2</p> })}>
        Show dialog 2
      </button>
    </>
  ));
  fireEvent.click(getByText('Show dialog 1'));
  expect(getByText('Message 1')).toBeTruthy();
  expect(queryByText('Message 2')).toBeNull();
  fireEvent.click(getByText('OK'));
  fireEvent.click(getByText('Show dialog 2'));
  expect(queryByText('Message 1')).toBeNull();
  expect(getByText('Message 2')).toBeTruthy();
});
