import React, { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Share, Copy, Bookmark, Edit2, Trash2, MoreHorizontal } from 'react-feather';
import classNames from 'classnames';
import { setBookmarkDate } from 'components/Recipe/actions';
import { Recipe } from 'store/state';
import { useEventListener, useMounted } from 'helpers';
import { DispatchType } from 'store/store';
import classes from './style.module.scss';
import topBarClasses from '../../../../top-bar.module.scss';

type MoreOptionsRecipeFields = Pick<Recipe, 'id' | 'name' | 'isMine' | 'bookmarkDate'>;

interface Props {
  recipe: MoreOptionsRecipeFields;
}

function useFrozenValue<T>(currentValue: T, isFrozen: boolean) {
  const prevValueRef = useRef(currentValue);
  if (!isFrozen) {
    prevValueRef.current = currentValue;
  }
  return prevValueRef.current;
}

const RecipeViewMoreOptions: React.FC<Props> = ({ recipe }) => {
  const dispatch = useDispatch<DispatchType>();
  const [isVisible, setVisible] = useState(false);
  const isAtAllVisible = useMounted(isVisible, 200);
  const delayedBookmarkDate = useFrozenValue(recipe.bookmarkDate, isAtAllVisible);
  useEventListener(document.body, 'click', () => {
    if (isVisible) setVisible(false);
  });

  return (
    <div className={classes.moreOptionsContainer}>
      <button
        className={`${topBarClasses.button} ${classes.moreOptionsButton}`}
        onClick={() => {
          setVisible(true);
        }}
      >
        <MoreHorizontal />
      </button>
      <div
        // eslint-disable-next-line no-undef
        className={classNames(classes.moreOptionsDropdown, isVisible && classes.open)}
      >
        {navigator.share && (
          <button onClick={() => navigator.share?.({ title: recipe.name, url: location.href })}>
            <Share />
            Share
          </button>
        )}
        <button>
          <Copy />
          Make a copy
        </button>
        {delayedBookmarkDate == null ? (
          <button onClick={() => dispatch(setBookmarkDate(recipe.id, Date.now()))}>
            <Bookmark />
            Add to saved
          </button>
        ) : (
          <button onClick={() => dispatch(setBookmarkDate(recipe.id, undefined))}>
            <Bookmark />
            Remove from saved
          </button>
        )}
        {recipe.isMine && (
          <>
            <button>
              <Edit2 />
              Edit
            </button>
            <button>
              <Trash2 />
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default RecipeViewMoreOptions;
