import React, { useState } from 'react';
import { X } from 'react-feather';
import ListEditor from 'components/ListEditor';
import { KeyedList } from 'components/ListEditor/types';
import classes from './style.module.scss';

interface Props {
  close: () => void;
}

const NewRecipeForm: React.FC<Props> = ({ close }) => {
  const [recipeName, setRecipeName] = useState('');
  const [ingredients, setIngredients] = useState([] as KeyedList<string>);
  const [steps, setSteps] = useState([] as KeyedList<string>);
  return (
    <div className={classes.newRecipeFormContainer}>
      <div className={classes.topBar}>
        <button className={`reset ${classes.closeButton}`} onClick={close}>
          <X />
        </button>
        Create recipe
      </div>
      <div className={classes.form}>
        <h2>
          <input
            onChange={event => setRecipeName(event.target.value)}
            placeholder='Recipe Title'
            className='reset'
          />
        </h2>
        <h3>Ingredients</h3>
        <ListEditor
          list={ingredients}
          setList={setIngredients}
          type='unordered'
          nextPlaceholder='Add an ingredient...'
        />
        <h3>Preparation</h3>
        <ListEditor
          list={steps}
          setList={setSteps}
          type='ordered'
          nextPlaceholder='Add an instruction...'
        />
      </div>
    </div>
  );
};

export default NewRecipeForm;
