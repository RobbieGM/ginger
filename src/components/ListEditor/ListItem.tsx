import React from 'react';
import classNames from 'classnames';
import { Move, X } from 'react-feather';
import { SortableHandle, SortableElement } from 'react-sortable-hoc';
import classes from './style.module.scss';

const DragHandle = SortableHandle(() => (
  // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
  <div
    className={`${classes.iconContainer} ${classes.dragHandle}`}
    tabIndex={0}
    aria-label='Move'
    role='button'
  >
    <Move />
  </div>
));

interface Props {
  content: string;
  marker?: string;
  onChange: (value: string) => void;
  onRemove: () => void;
  placeholder: string;
  required: boolean;
  /**
   * If true, this list item is non-deletable and non-movable. Should only be at the end of a list, representing a potential item.
   */
  isStub: boolean;
}

const ListItem: React.FC<Props> = ({
  content,
  marker,
  required,
  onChange,
  onRemove,
  isStub,
  placeholder
}) => (
  <div className={classNames(classes.listItem, { [classes.stub]: isStub })}>
    {!isStub && (
      <div className={classes.buttonContainer}>
        <button
          type='button'
          className={classes.iconContainer}
          onClick={onRemove}
          aria-label='Remove'
        >
          <X />
        </button>
        <DragHandle />
      </div>
    )}
    {marker && <span className={classes.listNumber}>{marker}</span>}
    <input
      type='text'
      required={required}
      value={content}
      onChange={event => onChange(event.target.value)}
      placeholder={placeholder}
      className='reset'
    />
  </div>
);

export default SortableElement(ListItem);
