import React, { useState } from 'react';
import { BookOpen, TrendingUp, Award, Bookmark, Search } from 'react-feather';
import PopularTab from '../Tab/Popular';
import BottomNavigation, { Tab } from '../BottomNavigation';
import SavedTab from '../Tab/Saved';
import MyRecipesTab from '../Tab/MyRecipes';

const tabs: Tab[] = [
  {
    label: 'My Recipes',
    icon: BookOpen,
    component: <MyRecipesTab />
  },
  {
    label: 'Saved',
    icon: Bookmark,
    component: <SavedTab />
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

const TabSwitcher: React.FC = () => {
  const [tab, setTab] = useState(0);
  return (
    <>
      {tabs[tab].component}
      <BottomNavigation tabs={tabs} selectedTabIndex={tab} setTab={setTab} />
    </>
  );
};

export default TabSwitcher;
