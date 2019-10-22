import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';
import AuthenticationGate from 'components/AuthenticationGate';
import { store, storePersistor } from './store/store';
import * as serviceWorker from './serviceWorker';
import App from './components/App';

export const apolloClient = new ApolloClient({
  credentials: 'include',
  uri: `${window.location.protocol}//${window.location.hostname}${
    process.env.NODE_ENV === 'development' ? ':5000' : ''
  }/graphql`
});

ReactDOM.render(
  <ApolloProvider client={apolloClient}>
    <AuthenticationGate>
      <Provider store={store}>
        <PersistGate loading={null} persistor={storePersistor}>
          <App />
        </PersistGate>
      </Provider>
    </AuthenticationGate>
  </ApolloProvider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
