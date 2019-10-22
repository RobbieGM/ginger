import React, { useState, useEffect } from 'react';
import { BookOpen, TrendingUp, Award, Bookmark, Search } from 'react-feather';
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

const App: React.FC<{}> = () => {
  const [tab, setTab] = useState(0);
  return (
    <div className={classes.app} id='app'>
      {tabs[tab].component}
      <BottomNavigation tabs={tabs} selectedTabIndex={tab} setTab={setTab} />
    </div>
  );
};

export default App;
