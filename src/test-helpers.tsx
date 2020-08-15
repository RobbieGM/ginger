import React, { useState } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { Reducer } from 'redux';
import { PersistPartial } from 'redux-persist/es/persistReducer';
import { PersistGate } from 'redux-persist/integration/react';
import { AppAction } from 'store/actions';
import AppState from 'store/state';
import { createStoreWithClient } from 'store/store';
import { Client, createClient, Provider as ClientProvider } from 'urql';

interface Props {
  rootReducer?: (state: AppState | undefined, action: AppAction) => AppState | undefined;
  transformClient?: (client: Client) => Client;
}

export const Provider: React.FC<Props> = ({
  rootReducer: injectedReducer,
  transformClient = x => x,
  children
}) => {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('The mono-provider is not to be used outside a test environment.');
  }
  const [apiClient] = useState(() => transformClient(createClient({ url: '/' })));
  const transformReducer = (rootReducer: Reducer<AppState, AppAction>): typeof rootReducer => (
    state,
    action
  ) => {
    return injectedReducer?.(state, action) ?? rootReducer(state, action);
  };
  const [{ store, persistor }] = useState(
    createStoreWithClient.bind(null, apiClient, transformReducer)
  );

  return (
    <ClientProvider value={apiClient}>
      <ReduxProvider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          {children}
        </PersistGate>
      </ReduxProvider>
    </ClientProvider>
  );
};
