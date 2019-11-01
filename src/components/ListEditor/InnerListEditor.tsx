import React, { useState } from 'react';
import { SortableContainer } from 'react-sortable-hoc';
import classes from './style.module.scss';
import ListItem from './ListItem';
import { KeyedList } from './types';

function useIdGenerator() {
  const [id, setId] = useState(Math.random());
  return {
    id,
    refresh() {
      setId(Math.random());
    }
  };
}

const InnerListEditor: React.FC<{
  type: 'ordered' | 'unordered';
  items: KeyedList<string>;
  listItemPlaceholder: string;
  required: boolean;
  removeItem: (index: number) => void;
  setItem: (index: number, value: string) => void;
  addItem: (value: string, key: number) => void;
}> = ({ type, items, required, addItem, setItem, removeItem, listItemPlaceholder }) => {
  const { id: nextItemId, refresh: refreshId } = useIdGenerator();
  const stub = {
    key: nextItemId,
    value: ''
  };
  return (
    <div className={classes.list}>
      {[...items, stub].map((item, index) => {
        const isStub = index === items.length;
        return (
          <ListItem
            key={item.key}
            index={index}
            content={item.value}
            isStub={isStub}
            required={required && isStub && items.length === 0}
            collection={
              isStub
                ? 1
                : 0 /* Making it part of a different collection makes it not appear sortable */
            }
            onChange={value => {
              if (isStub) {
                addItem(value, nextItemId);
                refreshId();
              } else {
                setItem(index, value);
              }
            }}
            onRemove={() => removeItem(index)}
            placeholder={listItemPlaceholder}
            marker={type === 'ordered' ? `${index + 1}.` : undefined}
          />
        );
      })}
    </div>
  );
};

export default SortableContainer(InnerListEditor);
