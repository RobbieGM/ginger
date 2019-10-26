import React, { useState } from 'react';
import { SortableContainer } from 'react-sortable-hoc';
import classes from './style.module.scss';
import ListItem from './ListItem';
import { KeyedList } from './types';

function useIdGenerator() {
  const [id, setId] = useState(0);
  return {
    id,
    increment() {
      setId(x => x + 1);
    }
  };
}

const InnerListEditor: React.FC<{
  type: 'ordered' | 'unordered';
  items: KeyedList<string>;
  listItemPlaceholder: string;
  removeItem: (index: number) => void;
  setItem: (index: number, value: string) => void;
  addItem: (value: string, key: number) => void;
  // getNextItemId: () => number;
}> = ({ type, items, addItem, setItem, removeItem, /* getNextItemId */ listItemPlaceholder }) => {
  const { id: nextItemId, increment: incrementNextId } = useIdGenerator();
  console.warn(`keys: ${items.map(item => item.key)}, next: ${nextItemId}`);
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
            collection={
              isStub
                ? 1
                : 0 /* Making it part of a different collection makes it not appear sortable */
            }
            onChange={value => {
              if (isStub) {
                addItem(value, nextItemId);
                incrementNextId();
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
