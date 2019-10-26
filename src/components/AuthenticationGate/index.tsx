import React, { useEffect, useState } from 'react';
import { useApolloClient, useQuery, useMutation } from 'react-apollo';
import { gql } from 'apollo-boost';

enum AuthState {
  AUTHENTICATED,
  LOADING,
  FAILED
}

const CREATE_ACCOUNT = gql`
  mutation {
    createAccount
  }
`;

function useAuth() {
  function getCookieValue(name: string) {
    const match = document.cookie.match(`(^|[^;]+)\\s*${name}\\s*=\\s*([^;]+)`);
    return match ? match.pop() : '';
  }
  const userId = getCookieValue('userId');
  const [state, setState] = useState(userId ? AuthState.AUTHENTICATED : AuthState.LOADING);
  const [createAccount] = useMutation<{ createAccount: string }>(CREATE_ACCOUNT);
  useEffect(() => {
    if (state === AuthState.LOADING) {
      createAccount()
        .then(({ data, errors }) => {
          if (data) {
            document.cookie = `userId=${data.createAccount}; expires=Fri, 31 Dec 9999 23:59:59 GMT`;
            setState(AuthState.AUTHENTICATED);
          } else if (errors) {
            throw errors;
          }
        })
        .catch(error => {
          console.error(error);
          setState(AuthState.FAILED);
        });
    }
  }, [state, createAccount]);
  return state;
}

const AuthenticationProvider: React.FC<{}> = ({ children }) => {
  const state = useAuth();
  return state === AuthState.AUTHENTICATED ? (
    <>{children}</>
  ) : state === AuthState.LOADING ? (
    <>Loading...</>
  ) : (
    <>Failed to authenticate; try reloading the page or clearing this site&apos;s cookies.</>
  );
};
export default AuthenticationProvider;
