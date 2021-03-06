import React, { useEffect, useRef, useState, useMemo } from 'react';
import classNames from 'classnames';

/**
 * Returns a value, or what it was before if it was invalid.
 */
export function useMemory<Supertype, Subtype extends Supertype>(
  value: Supertype,
  isValid: (x: Supertype) => x is Subtype = (x): x is any => x != null
): Subtype | undefined {
  const memory = useRef<Subtype | undefined>(isValid(value) ? value : undefined);
  useEffect(() => {
    if (isValid(value)) {
      memory.current = value;
    }
  }, [value, isValid]);
  return isValid(value) ? value : memory.current;
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
  const rememberedProps = useMemory(props, isVisible);
  return (
    <div className={classNames(className, !fullyVisible && hiddenClassName)}>
      {mounted && <Component {...(rememberedProps as TProps)} />}
    </div>
  );
};

/**
 * Attaches an event listener to an element and removes it when the component unmounts.
 *
 * @param element The element to add the handler to
 * @param type The event to listen to (e.g., "click")
 * @param listener the event handler to attach
 * @param options The options to pass to addEventListener
 */
export function useEventListener(
  element: EventTarget | undefined,
  type: string,
  listener: EventListener | EventListenerObject,
  options?: boolean | AddEventListenerOptions
) {
  useEffect(() => {
    element?.addEventListener?.(type, listener, options);
    return () => element?.removeEventListener?.(type, listener);
  });
}

export function debounce<T extends (...args: any[]) => any>(func: T, delay: number) {
  let timeout: number | undefined;
  return ((...args: any[]) => {
    const delayed = ((...innerArgs: any[]) => {
      timeout = undefined;
      return func(...innerArgs);
    }) as T;
    clearTimeout(timeout);
    timeout = window.setTimeout(delayed.bind(null, ...args), delay);
  }) as T;
}

export function throttle<T extends (...args: any[]) => any>(func: T, delay: number) {
  let waiting = false;
  return ((...args: any[]) => {
    if (!waiting) {
      func(...args);
      waiting = true;
      setTimeout(() => {
        waiting = false;
      }, delay);
    }
  }) as T;
}
