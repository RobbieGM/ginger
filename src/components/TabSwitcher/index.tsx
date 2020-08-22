import NewTab from 'components/Tab/New';
import SearchTab from 'components/Tab/Search';
import React, { useState } from 'react';
import { Award, Bookmark, BookOpen, Search, TrendingUp } from 'react-feather';
import BottomNavigation, { Tab } from '../BottomNavigation';
import MyRecipesTab from '../Tab/MyRecipes';
import PopularTab from '../Tab/Popular';
import SavedTab from '../Tab/Saved';

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
    component: <NewTab />
  },
  {
    label: 'Search',
    icon: Search,
    component: <SearchTab />
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
