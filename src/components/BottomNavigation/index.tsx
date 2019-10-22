import React from 'react';
import { Icon } from 'react-feather';
import classNames from 'classnames';
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
      <button
        className={classNames('reset', classes.tab, {
          [classes.selected]: index === selectedTabIndex
        })}
        key={tab.label}
        onClick={() => setTab(index)}
      >
        <tab.icon className={classes.icon} />
        <div className={classes.label}>{tab.label}</div>
      </button>
    ))}
  </nav>
);

export default BottomNavigation;
