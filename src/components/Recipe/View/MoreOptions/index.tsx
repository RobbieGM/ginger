import { Recipe } from 'backend/data-types/Recipe';
import classNames from 'classnames';
import { deleteRecipe, setBookmarkDate } from 'components/Recipe/actions';
import { useEventListener, useMounted } from 'helpers';
import React, { useRef, useState } from 'react';
import { Bookmark, MoreHorizontal, Share, Trash2 } from 'react-feather';
import { useDispatch } from 'react-redux';
import { DispatchType } from 'store/store';
import topBarClasses from '../../../../top-bar.module.scss';
import classes from './style.module.scss';

type MoreOptionsRecipeFields = Pick<Recipe, 'id' | 'name' | 'isMine' | 'bookmarkDate'>;

interface Props {
  recipe: MoreOptionsRecipeFields;
  onDelete?: () => void;
}

function useFrozenValue<T>(currentValue: T, isFrozen: boolean) {
  const prevValueRef = useRef(currentValue);
  if (!isFrozen) {
    prevValueRef.current = currentValue;
  }
  return prevValueRef.current;
}

const RecipeViewMoreOptions: React.FC<Props> = ({ recipe, onDelete }) => {
  const dispatch = useDispatch<DispatchType>();
  const [isVisible, setVisible] = useState(false);
  const isAtAllVisible = useMounted(isVisible, 200 + 50);
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
        aria-label='More options'
      >
        <MoreHorizontal />
      </button>
      <div className={classNames(classes.moreOptionsDropdown, isVisible && classes.open)}>
        {navigator.share && (
          <button onClick={() => navigator.share?.({ title: recipe.name, url: location.href })}>
            <Share />
            Share
          </button>
        )}
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
          <button
            onClick={() => {
              dispatch(deleteRecipe(recipe.id));
              onDelete?.();
            }}
          >
            <Trash2 />
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default RecipeViewMoreOptions;
