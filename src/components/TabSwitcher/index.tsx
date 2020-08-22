import React, { createElement, lazy, Suspense, useState } from 'react';
import { Bookmark, BookOpen, Globe, Search } from 'react-feather';
import BottomNavigation, { Tab } from '../BottomNavigation';
import MyRecipesTab from '../Tab/MyRecipes';

const SavedTab = lazy(() => import('../Tab/Saved'));
const NewTab = lazy(() => import('../Tab/New'));
const SearchTab = lazy(() => import('../Tab/Search'));

const tabs: Tab[] = [
  {
    label: 'My Recipes',
    icon: BookOpen,
    component: MyRecipesTab
  },
  {
    label: 'Saved',
    icon: Bookmark,
    component: SavedTab
  },
  {
    label: 'Public',
    icon: Globe,
    component: NewTab
  },
  {
    label: 'Search',
    icon: Search,
    component: SearchTab
  }
];

const TabSwitcher: React.FC = () => {
  const [tab, setTab] = useState(0);
  return (
    <>
      <Suspense fallback={null}>{createElement(tabs[tab].component)}</Suspense>
      <BottomNavigation tabs={tabs} selectedTabIndex={tab} setTab={setTab} />
    </>
  );
};

export default TabSwitcher;
