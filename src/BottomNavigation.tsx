import React from 'react';
import { Icon } from 'react-feather';
import classes from './BottomNavigation.module.scss';
import classNames from 'classnames';

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

const BottomNavigation: React.FC<Props> = props => (
  <nav className={classes.bottomNavigation}>
    {props.tabs.map((tab, index) => (
      <div
        className={classNames(classes.tab, {
          [classes.selected]: index === props.selectedTabIndex
        })}
        key={tab.label}
        onClick={() => props.setTab(index)}
      >
        <tab.icon className={classes.icon} />
        <div className={classes.label}>{tab.label}</div>
      </div>
    ))}
  </nav>
);

export default BottomNavigation;
