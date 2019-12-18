import React, { createContext } from 'react';
import { createBrowserHistory, createMemoryHistory, Location } from 'history';

const browserHistory =
  process.env.NODE_ENV === 'test' ? createMemoryHistory() : createBrowserHistory();
const historyLocations: Location<any>[] = [browserHistory.location];
let currentLocationIndex = 0;
browserHistory.listen((newLocation, action) => {
  const relativeIndex = action === 'PUSH' ? 1 : action === 'POP' ? -1 : 0;
  currentLocationIndex += relativeIndex;
  historyLocations[currentLocationIndex] = newLocation;
  console.log(historyLocations, 'at', currentLocationIndex);
});
const enhancedHistory = {
  ...browserHistory,
  getRelative(relativeIndex: number) {
    return historyLocations[currentLocationIndex + relativeIndex];
  },
  canGoBackWithoutLeaving() {
    return !!this.getRelative(-1);
  }
};
export const HistoryContext = createContext(enhancedHistory);

const HistoryProvider: React.FC = ({ children }) => (
  <HistoryContext.Provider value={enhancedHistory}>{children}</HistoryContext.Provider>
);

export default HistoryProvider;
