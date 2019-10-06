import React, { useState } from 'react';
import classes from './App.module.scss';
import BottomNavigation, { Tab } from './BottomNavigation';
import { BookOpen, TrendingUp, Award, Bookmark, Search } from 'react-feather';
import SavedTab from './SavedTab';

const tabs: Tab[] = [
  {
    label: 'Saved',
    icon: Bookmark,
    component: <SavedTab />
  },
  {
    label: 'My Recipes',
    icon: BookOpen,
    component: <SavedTab />
  },
  {
    label: 'Popular',
    icon: TrendingUp,
    component: <SavedTab />
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

interface Props {}

const App: React.FC<Props> = props => {
  const [tab, setTab] = useState(0);
  return (
    <div className={classes.app} id='app'>
      {tabs[tab].component}
      <BottomNavigation tabs={tabs} selectedTabIndex={tab} setTab={setTab} />
    </div>
  );
};

export default App;
