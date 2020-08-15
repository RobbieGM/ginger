import React from 'react';
import { render, cleanup, RenderResult } from '@testing-library/react';
// eslint-disable-next-line import/no-duplicates
import { createClient, Provider, OperationResult, UseMutationState } from 'urql';
import { act } from 'react-dom/test-utils';
// eslint-disable-next-line import/no-duplicates
import Urql from 'urql';
import AuthenticationGate from '.';

async function setup(/* content: JSX.Element = <span /> */) {
  const client = createClient({ url: '/' });
  let renderResult: RenderResult = null as any;
  await act(async () => {
    renderResult = render(
      <Provider value={client}>
        <AuthenticationGate>
          <span>text</span>
        </AuthenticationGate>
      </Provider>
    );
  });
  return renderResult;
}

/**
 * Mocks the useMutation function to always return the response
 *
 * @param mockResponse The operation result to return. Should be a createAccount result
 */
function mockUrqlMutationResponse(
  mockResponse: Promise<OperationResult<{ createAccount: string }>>
) {
  const mocked = () => {
    const doMutation = () => mockResponse;
    return [{ fetching: false, stale: false, ...mockResponse }, doMutation] as [
      UseMutationState<{ createAccount: string }>,
      typeof doMutation
    ];
  };
  jest.spyOn(Urql, 'useMutation').mockImplementation(mocked);
}

it('shows child components when a userId cookie is present', async () => {
  jest.spyOn(document, 'cookie', 'get').mockReturnValue('userId=test');
  const { queryAllByText } = await setup();
  expect(queryAllByText('text')).toBeTruthy();
});

afterEach(() => {
  jest.restoreAllMocks();
  cleanup();
});

describe('loading state', () => {
  it('shows the loading spinner', async () => {
    const renderResult = await setup();
    expect(renderResult.baseElement.innerHTML).toEqual(expect.stringContaining('Loading'));
  });
  it('automatically creates an account', done => {
    mockUrqlMutationResponse(
      Promise.resolve({
        operation: null as any,
        data: {
          createAccount: 'new-user-id'
        }
      })
    );
    jest.spyOn(document, 'cookie', 'set').mockImplementation(cookie => {
      expect(cookie).toEqual(expect.stringContaining('new-user-id'));
      done();
    });
    setup();
  }, 200);
});

it('shows an error message when the server is unavailable', async () => {
  const { error: consoleError } = console;
  console.error = () => {}; // Suppress creating account error
  mockUrqlMutationResponse(
    Promise.resolve({
      operation: null as any,
      error: {
        name: 'test error',
        message: 'an error occurred',
        graphQLErrors: []
      }
    })
  );
  const { findAllByText } = await setup();
  const isErrorMessage = (text: string) => text.toLowerCase().includes('failed');
  expect(findAllByText(isErrorMessage)).resolves.toBeTruthy();
  console.error = consoleError;
});
