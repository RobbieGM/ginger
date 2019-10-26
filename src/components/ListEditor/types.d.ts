export type KeyedItem<T> = {
  key: number;
  value: T;
};

export type KeyedList<T> = KeyedItem<T>[];
