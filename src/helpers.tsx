import React, { useEffect, useRef, useState, useMemo } from 'react';
import classNames from 'classnames';

/**
 * Returns a value, or what it was before if it's undefined or null.
 */
export function useMemory<T>(value: T | undefined) {
  const memory = useRef<T | undefined>(value);
  useEffect(() => {
    if (value != null) {
      memory.current = value;
    }
  }, [value]);
  return value || memory.current;
}

/**
 * Used to see if a component may be visible, given a delay to account for time it takes to animate out.
 * @param delay
 */
export function useDelayedVisibility(delay: number) {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [timeoutId, setTimeoutId] = useState(-1);
  return {
    visible,
    mounted,
    show() {
      setMounted(true);
      setVisible(true);
      clearTimeout(timeoutId);
    },
    hide() {
      setVisible(false);
      const id = window.setTimeout(() => setMounted(false), delay);
      setTimeoutId(id);
      clearTimeout(timeoutId);
    }
  };
}

/**
 * Returns if a component needs to be mounted or not
 * @param visible Whether the component is fully visible
 * @param delay The animation duration in milliseconds
 */
export function useMounted(visible: boolean, delay: number) {
  const [mounted, setMounted] = useState(false);
  const [timeoutId, setTimeoutId] = useState(-1);
  useEffect(() => {
    if (visible) {
      setMounted(true);
      clearTimeout(timeoutId);
    } else {
      const id = window.setTimeout(() => setMounted(false), delay);
      setTimeoutId(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);
  return mounted;
}

/**
 * Wraps a component and makes it animatable: the component is shown when isVisible returns true.
 *
 * @param Component the component to wrap
 * @param isVisible a function returning whether the component should be visible, based on its props
 * @param delay the animation duration
 * @param className the wrapper class name
 * @param hiddenClassName a class to add to the wrapper when it is not visible
 */
export const animatable = <TProps,>(
  Component: React.ComponentType<TProps>,
  isVisible: (props: Partial<TProps>) => props is TProps,
  delay: number,
  className?: string,
  hiddenClassName?: string
): React.FC<Partial<TProps>> => props => {
  const fullyVisible = isVisible(props);
  const mounted = useMounted(fullyVisible, delay);
  const rememberedProps = useMemory(props);
  return (
    <div className={classNames(className, !fullyVisible && hiddenClassName)}>
      {mounted && <Component {...(rememberedProps as TProps)} />}
    </div>
  );
};
