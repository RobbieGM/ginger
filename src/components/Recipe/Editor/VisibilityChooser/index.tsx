import React from 'react';
import classNames from 'classnames';
import { Lock, Eye } from 'react-feather';
import classes from './style.module.scss';

interface Props {
  isPrivate: boolean;
  setPrivate: (isPrivate: boolean) => void;
}

const VisibilityChooser: React.FC<Props> = ({ isPrivate, setPrivate }) => (
  <div className={classes.visibilityChooser}>
    <button
      type='button'
      className={classNames(classes.public, { [classes.selected]: !isPrivate })}
      onClick={() => setPrivate(false)}
    >
      <Eye />
      Public
    </button>
    <button
      type='button'
      className={classNames(classes.private, { [classes.selected]: isPrivate })}
      onClick={() => setPrivate(true)}
    >
      <Lock />
      Private
    </button>
  </div>
);

export default VisibilityChooser;
