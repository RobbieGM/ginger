import React from 'react';
import ReactDOM from 'react-dom';
import 'focus-visible';
import './index.scss';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import AuthenticationGate from 'components/AuthenticationGate';
import {
  createClient,
  Provider as ClientProvider,
  dedupExchange,
  cacheExchange,
  fetchExchange,
  Exchange
} from 'urql';
import HistoryProvider from 'components/HistoryProvider';
import { createStoreWithClient } from './store/store';
import * as serviceWorker from './serviceWorker';
import App from './components/App';

// const noopExchange: Exchange = ({ client, forward }) => operations$ => {
//   return forward(operations$);
// };

const apiClient = createClient({
  url: `${window.location.protocol}//${window.location.hostname}${
    process.env.NODE_ENV === 'development' ? ':5000' : ''
  }/graphql`,
  // exchanges: [noopExchange, dedupExchange, cacheExchange, fetchExchange],
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

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
