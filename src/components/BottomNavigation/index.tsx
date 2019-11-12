import React from 'react';
import { Icon } from 'react-feather';
import RippleButton from './RippleButton';
import classes from './style.module.scss';

export interface Tab {
  label: string;
  icon: Icon;
  component: JSX.Element;
}

interface Props {
  tabs: Tab[];
  setTab: (selectedTabIndex: number) => void;
  selectedTabIndex: number;
}

const BottomNavigation: React.FC<Props> = ({ tabs, setTab, selectedTabIndex }) => (
  <nav className={classes.bottomNavigation}>
    {tabs.map((tab, index) => (
      <RippleButton
        selected={index === selectedTabIndex}
        key={tab.label}
        onClick={() => setTab(index)}
      >
        <tab.icon className={classes.icon} />
        <div className={classes.label}>{tab.label}</div>
      </RippleButton>
    ))}
  </nav>
);

export default BottomNavigation;
