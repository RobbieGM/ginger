import React, { createContext, useState, useEffect, useRef } from 'react';
import classNames from 'classnames';
import { useMemory } from 'helpers';
import { useSelector, useDispatch } from 'react-redux';
import AppState, { Snackbar } from 'store/state';
import { DispatchType } from 'store/store';
import classes from './style.module.scss';
import { dismissSnackbar } from './actions';

export interface ModalDialog<TButton> {
  title: string;
  message: JSX.Element;
  buttons: TButton[];
  lastButtonClass?: string;
}

interface ContextType {
  showModalDialog: <TButton extends string>(dialog: ModalDialog<TButton>) => Promise<TButton>;
}

export const CoreUIContext = createContext({} as ContextType);

function useDialogQueue() {
  type QueuedDialog = ModalDialog<string> & {
    onClose: (selectedButton: string) => void;
  };
  const [queue, setQueue] = useState([] as QueuedDialog[]);
  return {
    enqueue<TButton extends string>(
      item: ModalDialog<TButton>,
      onClose: (button: TButton) => void
    ) {
      const dialog = {
        ...item,
        onClose: (button: string) => onClose(button as TButton)
      };
      setQueue([...queue, dialog]);
    },
    dismiss(button: string) {
      if (queue.length === 0) return;
      queue[0].onClose(button);
      setQueue(queue.slice(1));
    },
    current: queue[0]
  };
}

/**
 * A drop-in replacement for useEffect, but doesn't run on the first render.
 */
function useWatch(effect: () => void, dependencies: any[]) {
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (!isFirstRender.current) {
      effect();
    }
    isFirstRender.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
}

const SNACKBAR_TIMEOUT = 2000;

function useCurrentSnackbar() {
  const dispatch = useDispatch<DispatchType>();
  const snackbars = useSelector((state: AppState) => state.queuedSnackbars);
  const snackbar: Snackbar | undefined = snackbars[0];
  const lastSnackbar = useMemory(snackbar);
  useWatch(() => {
    setTimeout(() => {
      dispatch(dismissSnackbar());
    }, SNACKBAR_TIMEOUT);
    // Watch lastSnackbar instead of snackbar so that when it goes away (becomes undefined) setTimeout doesn't get called and potentially dismiss the next one early
  }, [lastSnackbar, dispatch]);
  return { snackbar: lastSnackbar?.text, visible: !!snackbar };
}

const CoreUIProvider: React.FC = ({ children }) => {
  const dispatch = useDispatch<DispatchType>();
  const dialogs = useDialogQueue();
  const visibleDialog = useMemory(dialogs.current);
  const { snackbar, visible } = useCurrentSnackbar();
  return (
    <CoreUIContext.Provider
      value={{
        showModalDialog<TButton extends string>(dialog: ModalDialog<TButton>) {
          return new Promise<TButton>(resolve => {
            dialogs.enqueue(dialog, resolve);
          });
        }
      }}
    >
      {children}
      <div className={classNames(classes.modalOverlay, dialogs.current && classes.active)} />
      <div
        className={classNames(classes.modalDialog, dialogs.current && classes.active)}
        aria-live='assertive'
      >
        <div className={classes.dialogContent}>
          <h2>{visibleDialog && visibleDialog.title}</h2>
          {visibleDialog && visibleDialog.message}
        </div>
        <div className={classes.buttons}>
          {visibleDialog &&
            visibleDialog.buttons.map((button, i) => (
              <button
                onClick={() => dialogs.dismiss(button)}
                key={button}
                className={
                  i === visibleDialog.buttons.length - 1 && visibleDialog.lastButtonClass
                    ? classes[visibleDialog.lastButtonClass]
                    : undefined
                }
              >
                {button}
              </button>
            ))}
        </div>
      </div>
      <div className={classNames(classes.snackbar, visible && classes.visible)}>
        {snackbar}
        <button onClick={() => dispatch(dismissSnackbar())}>OK</button>
      </div>
    </CoreUIContext.Provider>
  );
};

export default CoreUIProvider;
