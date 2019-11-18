import React, { createContext, useState } from 'react';
import classNames from 'classnames';
import { useMemory } from 'helpers';
import classes from './style.module.scss';

export interface ModalDialog<TButton> {
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

const ModalDialogProvider: React.FC = ({ children }) => {
  const dialogs = useDialogQueue();
  const visibleDialog = useMemory(dialogs.current);
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
    </ModalDialogContext.Provider>
  );
};

export default ModalDialogProvider;
