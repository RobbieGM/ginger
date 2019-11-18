import React, { useEffect, useState, useContext } from 'react';
import TabSwitcher from 'components/TabSwitcher';
import { animatable } from 'helpers';
import { History } from 'history';
import RecipeView from 'components/Recipe/View';
import { HistoryContext } from 'components/HistoryProvider';
import classes from './style.module.scss';
import ModalDialogProvider from '../ModalDialogProvider';
import { touchEnd, touchStart } from './instant-touch';

const AnimatableRecipeView = animatable(
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
  console.warn(path);
  const recipeId = path[0] === 'recipe' && path[1] ? path[1] : undefined;
  return (
    <div id='app' onTouchStart={touchStart} onTouchEnd={touchEnd} onTouchCancel={touchEnd}>
      <ModalDialogProvider>
        <TabSwitcher />
        <AnimatableRecipeView recipeId={recipeId} />
      </ModalDialogProvider>
    </div>
  );
};

export default App;
