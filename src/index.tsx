import AuthenticationGate from 'components/AuthenticationGate';
import HistoryProvider from 'components/HistoryProvider';
import { syncSavedRecipesToServer } from 'components/Recipe/actions';
import 'focus-visible';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { createClient, Provider as ClientProvider } from 'urql';
import App from './components/App';
import './index.scss';
import * as serviceWorker from './serviceWorker';
import { createStoreWithClient } from './store/store';

const apiClient = createClient({
  url: process.env.REACT_APP_API_URL!,
  fetchOptions: {
    credentials: 'include'
  }
});

const { store, persistor } = createStoreWithClient(apiClient);

ReactDOM.render(
  <ClientProvider value={apiClient}>
    <AuthenticationGate>
      <HistoryProvider>
        <ReduxProvider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <App />
          </PersistGate>
        </ReduxProvider>
      </HistoryProvider>
    </AuthenticationGate>
  </ClientProvider>,
  document.getElementById('root')
);

let synced = false;
// wait for hydration update, otherwise saved recipes will be empty array
store.subscribe(() => {
  synced = true;
  if (!synced) {
    store.dispatch(syncSavedRecipesToServer());
  }
});

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
