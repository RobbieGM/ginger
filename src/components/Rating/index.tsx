import React from 'react';
import classNames from 'classnames';
import { Star } from 'react-feather';
import classes from './style.module.scss';

interface Props {
  value: number;
  onChange?: (value: number) => void;
}

const Rating: React.FC<Props> = ({ value, onChange }) => (
  <span className={classes.rating}>
    {[...new Array(5)].map((_, i) => (
      <button
        className={classNames(classes.star, i + 1 <= value ? classes.on : classes.off)}
        onClick={() => onChange?.(i + 1)}
        // eslint-disable-next-line react/no-array-index-key
        key={i}
        aria-label={`${i + 1} stars`}
      >
        <Star fill='currentColor' stroke='transparent' />
      </button>
    ))}
  </span>
);

export default Rating;
