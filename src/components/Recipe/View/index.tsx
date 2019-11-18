import React, { useContext } from 'react';
import { ArrowLeft } from 'react-feather';
import { HistoryContext } from 'components/HistoryProvider';
import classes from './style.module.scss';
import topBarClasses from '../../../top-bar.module.scss';

interface Props {
  recipeId: string;
}

const RecipeView: React.FC<Props> = ({ recipeId }) => {
  const { goBack } = useContext(HistoryContext);
  return (
    <div className={classes.recipeView}>
      <div className={topBarClasses.topBar}>
        <button className={topBarClasses.button} onClick={goBack} aria-label='Back'>
          <ArrowLeft />
        </button>
        Viewing recipe id {recipeId}
      </div>
      hi
    </div>
  );
};

export default RecipeView;
