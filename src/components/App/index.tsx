import React, { useState } from 'react';
import { BookOpen, TrendingUp, Award, Bookmark, Search } from 'react-feather';
import PopularTab from 'components/Tab/Popular';
import ModalDialogProvider from 'components/ModalDialogProvider';
import classes from './style.module.scss';
import BottomNavigation, { Tab } from '../BottomNavigation';
import SavedTab from '../Tab/SavedTab';
import MyRecipesTab from '../Tab/MyRecipes';

const tabs: Tab[] = [
  {
    label: 'Saved',
    icon: Bookmark,
    component: <SavedTab />
  },
  {
    label: 'My Recipes',
    icon: BookOpen,
    component: <MyRecipesTab />
  },
  {
    label: 'Popular',
    icon: TrendingUp,
    component: <PopularTab />
  },
  {
    label: 'New',
    icon: Award,
    component: <SavedTab />
  },
  {
    label: 'Search',
    icon: Search,
    component: <SavedTab />
  }
];

const App: React.FC<{}> = () => {
  const [tab, setTab] = useState(0);
  const getAllParents = (element: HTMLElement): HTMLElement[] =>
    element.parentElement != null ? [element, ...getAllParents(element.parentElement)] : [element];
  const touchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (event.nativeEvent.target) {
      getAllParents(event.nativeEvent.target as HTMLElement).forEach(elt =>
        elt.setAttribute('touched', 'true')
      );
    }
  };
  const touchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (event.nativeEvent.target) {
      getAllParents(event.nativeEvent.target as HTMLElement).forEach(elt =>
        elt.removeAttribute('touched')
      );
    }
  };
  return (
    <div
      className={classes.app}
      id='app'
      onTouchStart={touchStart}
      onTouchEnd={touchEnd}
      onTouchCancel={touchEnd}
    >
      <ModalDialogProvider>
        {tabs[tab].component}
        <BottomNavigation tabs={tabs} selectedTabIndex={tab} setTab={setTab} />
      </ModalDialogProvider>
    </div>
  );
};

export default App;
