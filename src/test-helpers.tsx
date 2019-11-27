import { createStoreWithClient } from 'store/store';
import { createClient, Provider as ClientProvider } from 'urql';
import { Provider as ReduxProvider } from 'react-redux';
import React, { useState, useEffect } from 'react';
import { PersistGate } from 'redux-persist/integration/react';
import { Reducer } from 'redux';
import AppState from 'store/state';
import { PersistPartial } from 'redux-persist/es/persistReducer';
import { AppAction } from 'store/actions';

interface Props {
  rootReducer?: Reducer<AppState & PersistPartial, AppAction>;
}

export const Provider: React.FC<Props> = ({ rootReducer, children }) => {
  const [apiClient] = useState(createClient.bind(null, { url: '' }));
  const [{ store, persistor }] = useState(createStoreWithClient.bind(null, apiClient));
  useEffect(() => {
    if (rootReducer) {
      store.replaceReducer(rootReducer);
    }
  }, [store, rootReducer]);

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
