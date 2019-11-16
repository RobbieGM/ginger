import React, { ButtonHTMLAttributes, useState } from 'react';
import classNames from 'classnames';
import classes from './style.module.scss';

type ButtonProps = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

const BottomNavigationRippleButton: React.FC<ButtonProps & { selected: boolean }> = ({
  selected,
  onClick,
  children
}) => {
  const [rippleSize, setRippleSize] = useState<'large' | 'small'>('small');
  const [rippleFill, setRippleFill] = useState<'filled' | 'transparent'>('transparent');
  const [mouseDownTime, setMouseDownTime] = useState(0);
  const [resetRippleTimeout, setResetRippleTimeout] = useState(0);
  function highlight() {
    clearTimeout(resetRippleTimeout);
    setRippleFill('filled');
    setRippleSize('large');
    setMouseDownTime(Date.now());
  }
  function unhighlight() {
    window.setTimeout(() => {
      setRippleFill('transparent');
      const id = window.setTimeout(() => {
        setRippleSize('small');
      }, 200);
      setResetRippleTimeout(id);
    }, 200 - (Date.now() - mouseDownTime));
  }
  return (
    <button
      className={classNames(classes.tab, {
        [classes.selected]: selected,
        [classes.scaledRipple]: rippleSize === 'large',
        [classes.filledRipple]: rippleFill === 'filled'
      })}
      onClick={onClick}
      onTouchStart={highlight}
      onMouseDown={highlight}
      onFocus={highlight}
      onTouchEnd={unhighlight}
      onTouchCancel={unhighlight}
      onMouseUp={unhighlight}
      onMouseLeave={unhighlight}
      onBlur={unhighlight}
    >
      {children}
    </button>
  );
};

export default BottomNavigationRippleButton;
