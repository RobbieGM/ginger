import React, { createContext } from 'react';
import { createBrowserHistory, createMemoryHistory } from 'history';

const browserHistory =
  process.env.NODE_ENV === 'test' ? createMemoryHistory() : createBrowserHistory();
export const HistoryContext = createContext(browserHistory);

const HistoryProvider: React.FC = ({ children }) => (
  <HistoryContext.Provider value={browserHistory}>{children}</HistoryContext.Provider>
);

export default HistoryProvider;
