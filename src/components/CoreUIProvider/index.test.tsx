import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Provider } from 'test-helpers';
import { ReactReduxContext } from 'react-redux';
import { Store } from 'redux';
import AppState from 'store/state';
import { AppAction } from 'store/actions';
import CoreUIProvider, { CoreUIContext, ModalDialog } from '.';
import { showSnackbar } from './actions';

jest.useFakeTimers();

function setup(
  getContent: (showDialog: (dialog: ModalDialog<string>) => Promise<string>) => JSX.Element
) {
  return render(
    <Provider>
      <CoreUIProvider>
        <CoreUIContext.Consumer>
          {({ showModalDialog }) => getContent(showModalDialog)}
        </CoreUIContext.Consumer>
      </CoreUIProvider>
    </Provider>
  );
}

it('renders modal dialogs with correct title, message, and buttons', async () => {
  const dialog: ModalDialog<string> = {
    title: 'title',
    message: <p>message</p>,
    buttons: ['1', '2'],
    lastButtonClass: 'blue'
  };
  const { findByText, container } = setup(showDialog => (
    <button onClick={() => showDialog(dialog)} data-testid>
      Click me
    </button>
  ));
  const showDialogButton = await findByText('Click me')!;
  fireEvent.click(showDialogButton);
  expect(await findByText('title')).toBeTruthy();
  expect(await findByText('message')).toBeTruthy();
  const buttons = [...container.querySelectorAll('[class*="modal"] button').values()];
  expect(buttons.map(button => button.innerHTML)).toEqual(['1', '2']);
  expect(buttons[1].className).toEqual(expect.stringContaining('blue'));
});

it('shows queued dialogs in order', async () => {
  const defaultDialog: ModalDialog<string> = {
    title: 'title',
    message: <></>,
    buttons: ['Close dialog']
  };
  const { findByText, queryByText } = setup(showDialog => (
    <>
      <button onClick={() => showDialog({ ...defaultDialog, message: <p>Message 1</p> })}>
        Show dialog 1
      </button>
      <button onClick={() => showDialog({ ...defaultDialog, message: <p>Message 2</p> })}>
        Show dialog 2
      </button>
    </>
  ));
  fireEvent.click(await findByText('Show dialog 1'));
  expect(await findByText('Message 1')).toBeTruthy();
  expect(queryByText('Message 2')).toBeNull();
  fireEvent.click(await findByText('Close dialog'));
  fireEvent.click(await findByText('Show dialog 2'));
  expect(queryByText('Message 1')).toBeNull();
  expect(await findByText('Message 2')).toBeTruthy();
});

it('shows queued snackbars in order', async () => {
  const counter = (() => {
    let i = 0;
    return () => ++i;
  })();
  const { findByText } = render(
    <Provider>
      <CoreUIProvider>
        <ReactReduxContext.Consumer>
          {({ store }: { store: Store<AppState, AppAction> }) => (
            <button onClick={() => store.dispatch(showSnackbar(`snackbar #${counter()}`))}>
              Show next dialog
            </button>
          )}
        </ReactReduxContext.Consumer>
      </CoreUIProvider>
    </Provider>
  );
  const showNextDialog = async () => fireEvent.click(await findByText('Show next dialog'));
  await showNextDialog();
  expect(await findByText('snackbar #1')).toBeTruthy();
  await showNextDialog();
  expect(await findByText('snackbar #1')).toBeTruthy();
  jest.advanceTimersByTime(2100);
  expect(await findByText('snackbar #2')).toBeTruthy();
});
