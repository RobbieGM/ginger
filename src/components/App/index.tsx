import React, { useEffect, useState, useContext } from 'react';
import TabSwitcher from 'components/TabSwitcher';
import { animatable as withAnimation, useMounted } from 'helpers';
import { History } from 'history';
import RecipeView from 'components/Recipe/View';
import { HistoryContext } from 'components/HistoryProvider';
import classes from './style.module.scss';
import CoreUIProvider from '../CoreUIProvider';
import { touchEnd, touchStart } from './instant-touch';

const AnimatableRecipeView = withAnimation(
  RecipeView,
  (props): props is { recipeId: string } => typeof props.recipeId == 'string',
  200,
  classes.recipeViewContainer,
  classes.hidden
);

function useLocation(browserHistory: History) {
  const [loc, setLoc] = useState(browserHistory.location);
  useEffect(() => {
    const cleanup = browserHistory.listen(l => setLoc(l));
    return cleanup;
  }, [browserHistory]);
  return loc;
}

const App: React.FC<{}> = () => {
  const browserHistory = useContext(HistoryContext);
  const loc = useLocation(browserHistory);
  const path = loc.pathname.split('/').slice(1);
  const recipeId = path[0] === 'recipe' && path[1] ? path[1] : undefined;
  const tabSwitcherVisible = useMounted(!recipeId, 300);
  return (
    <div id='app' onTouchStart={touchStart} onTouchEnd={touchEnd} onTouchCancel={touchEnd}>
      <CoreUIProvider>
        <div
          className={classes.tabSwitcherContainer}
          style={{ visibility: tabSwitcherVisible ? 'visible' : 'hidden' }}
          // used so keyboard users don't tab into the tab switcher when the recipe view is open
        >
          <TabSwitcher />
        </div>
        <AnimatableRecipeView recipeId={recipeId} />
      </CoreUIProvider>
    </div>
  );
};

export default App;
