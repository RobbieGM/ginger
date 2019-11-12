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

const ListEditor: React.FC<Props> = ({
  list,
  required = false,
  setList,
  type,
  nextPlaceholder
}) => {
  return (
    <>
      <InnerListEditor
        type={type}
        items={list}
        required={required}
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
