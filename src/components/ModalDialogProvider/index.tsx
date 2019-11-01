import React, { createContext, useState, useEffect, useRef } from 'react';
import classNames from 'classnames';
import classes from './style.module.scss';

interface ModalDialog<TButton> {
  title: string;
  message: JSX.Element;
  buttons: TButton[];
  lastButtonClass?: string;
}

interface ContextType {
  showModalDialog: <TButton extends string>(dialog: ModalDialog<TButton>) => Promise<TButton>;
}

export const ModalDialogContext = createContext({} as ContextType);

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
    current: queue[0] // May represent a past dialog
  };
}

/**
 * Returns a value, or what it was before if it's undefined or null.
 */
function useMemory<T>(value: T) {
  const memory = useRef<T | undefined>(value);
  useEffect(() => {
    if (value != null) {
      memory.current = value;
    }
  }, [value]);
  return value || memory.current;
}

const ModalDialogProvider: React.FC = ({ children }) => {
  const dialogs = useDialogQueue();
  const rememberedDialog = useMemory(dialogs.current);
  return (
    <ModalDialogContext.Provider
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
      <div className={classNames(classes.modalDialog, dialogs.current && classes.active)}>
        <div className={classes.dialogContent}>
          <h2>{rememberedDialog && rememberedDialog.title}</h2>
          {rememberedDialog && rememberedDialog.message}
        </div>
        <div className={classes.buttons}>
          {rememberedDialog &&
            rememberedDialog.buttons.map((button, i) => (
              <button
                onClick={() => dialogs.dismiss(button)}
                key={button}
                className={
                  i === rememberedDialog.buttons.length - 1 && rememberedDialog.lastButtonClass
                    ? classes[rememberedDialog.lastButtonClass]
                    : undefined
                }
              >
                {button}
              </button>
            ))}
        </div>
      </div>
    </ModalDialogContext.Provider>
  );
};

export default ModalDialogProvider;
