import React, { useEffect, useState } from 'react';
import { useMutation } from 'urql';

enum AuthState {
  AUTHENTICATED,
  LOADING,
  FAILED
}

const CREATE_ACCOUNT = `
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
  const [_, createAccount] = useMutation<{ createAccount: string }>(CREATE_ACCOUNT);
  useEffect(() => {
    if (state === AuthState.LOADING) {
      createAccount()
        .then(({ data, error }) => {
          if (data) {
            document.cookie = `userId=${data.createAccount}; expires=Fri, 31 Dec 9999 23:59:59 GMT`;
            setState(AuthState.AUTHENTICATED);
          } else if (error) {
            throw error;
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
