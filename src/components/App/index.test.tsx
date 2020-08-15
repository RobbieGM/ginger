import React from 'react';
import ReactDOM from 'react-dom';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import AuthenticationGate from 'components/AuthenticationGate';
import { createClient, Provider as ClientProvider } from 'urql';
import { render } from '@testing-library/react';
import { createStoreWithClient } from '../../store/store';
import App from '.';

const apiClient = createClient({ url: '/' });
const { store, persistor } = createStoreWithClient(apiClient);

it('renders without crashing', () => {
  const div = document.createElement('div');
  const x = render(
    <ClientProvider value={apiClient}>
      <AuthenticationGate>
        <ReduxProvider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <App />
          </PersistGate>
        </ReduxProvider>
      </AuthenticationGate>
    </ClientProvider>
  );
  expect(x.baseElement.innerHTML).toBeTruthy();
  ReactDOM.unmountComponentAtNode(div);
});
