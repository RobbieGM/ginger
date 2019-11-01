import React, { useState } from 'react';
import arrayMove from 'array-move';
import InnerListEditor from './InnerListEditor';
import classes from './style.module.scss';
import { KeyedList } from './types';

interface Props {
  type: 'ordered' | 'unordered';
  nextPlaceholder: string;
  list: KeyedList<string>;
  setList: (list: KeyedList<string>) => void;
  required?: boolean;
}

function useKeyedList<T>() {
  const [list, setList] = useState([] as KeyedList<T>);
  // const nextId = useIdGenerator();
  return {
    list,
    set(index: number, value: T) {
      const copied = [...list];
      copied[index].value = value;
      setList(copied);
    },
    move(from: number, to: number) {
      setList(arrayMove(list, from, to));
    },
    remove(index: number) {
      setList([...list.slice(0, index), ...list.slice(index + 1)]);
    },
    push(element: T, key: number) {
      setList([
        ...list,
        {
          key,
          value: element
        }
      ]);
    }
  };
}

const ListEditor: React.FC<Props> = ({ list, required, setList, type, nextPlaceholder }) => {
  return (
    <>
      <InnerListEditor
        type={type}
        items={list}
        required={required || false}
        listItemPlaceholder={nextPlaceholder}
        addItem={(value, key) => {
          setList([...list, { key, value }]);
        }}
        setItem={(index, value) => {
          const copied = [...list];
          copied[index].value = value;
          setList(copied);
        }}
        removeItem={index => {
          setList([...list.slice(0, index), ...list.slice(index + 1)]);
        }}
        // getNextItemId={getNextId}
        onSortEnd={({ oldIndex, newIndex }: { oldIndex: number; newIndex: number }) => {
          setList(arrayMove(list, oldIndex, newIndex));
        }}
        helperClass={classes.sortableHeldItem}
        axis='xy'
        useDragHandle
      />
    </>
  );
};

export default ListEditor;
