import React, { useState, useRef, useContext } from 'react';
import { X, Image, Check } from 'react-feather';
import classNames from 'classnames';
import ListEditor from 'components/ListEditor';
import { KeyedList } from 'components/ListEditor/types';
import { ModalDialogContext } from 'components/ModalDialogProvider';
import { RecipeInput } from 'backend/api-input/RecipeInput';
import classes from './style.module.scss';
import listEditorClasses from '../../ListEditor/style.module.scss';
import VisibilityChooser from './VisibilityChooser';

interface Props {
  intent: 'create' | 'edit';
  close: () => void;
  onSubmit: (recipe: Omit<RecipeInput, 'id'>) => void;
}

const RecipeEditor: React.FC<Props> = ({ intent, close: forceClose, onSubmit }) => {
  const [recipeName, setRecipeName] = useState('');
  const [isPrivate, setPrivate] = useState(false);
  const [imageURL, setImageUrl] = useState('');
  const [prepTime, setPrepTime] = useState<number | undefined>();
  const [cookTime, setCookTime] = useState<number | undefined>();
  const [ingredients, setIngredients] = useState([] as KeyedList<string>);
  const [steps, setSteps] = useState([] as KeyedList<string>);

  const imageInput = useRef<HTMLInputElement>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const { showModalDialog } = useContext(ModalDialogContext);
  function promptImageFileInput() {
    if (imageInput && imageInput.current) {
      imageInput.current.click();
    }
  }
  function setImage(files: FileList | null) {
    if (files && files[0]) {
      const file = files[0];
      if (['image/png', 'image/jpeg'].includes(file.type)) {
        const url = URL.createObjectURL(file);
        setImageUrl(url);
      }
    }
  }
  async function close() {
    const hasUnsavedData = [
      recipeName,
      imageURL,
      prepTime,
      cookTime,
      ingredients.length,
      steps.length
    ].some(x => x);
    if (hasUnsavedData) {
      const result = await showModalDialog({
        title: 'Discard Recipe?',
        message: <p>Unsaved changes will be lost.</p>,
        buttons: ['Cancel', 'Discard'],
        lastButtonClass: 'red'
      });
      if (result === 'Discard') {
        forceClose();
      }
    } else {
      forceClose();
    }
  }
  function submit() {
    if (
      recipeName &&
      prepTime != null &&
      cookTime != null &&
      ingredients.length > 0 &&
      steps.length > 0
    ) {
      onSubmit({
        name: recipeName,
        prepTime,
        cookTime,
        ingredients: ingredients.map(x => x.value),
        directions: steps.map(x => x.value),
        imageURL,
        isPrivate,
        lastModified: new Date()
      });
    }
  }
  return (
    <div className={classes.recipeEditorContainer}>
      <div className={classes.topBar}>
        <button className={classes.closeButton} onClick={close}>
          <X />
        </button>
        {intent === 'create' ? 'Create recipe' : 'Edit recipe'}
      </div>
      <form
        action='#'
        className={classNames(
          classes.form,
          submitAttempted && [classes.submitAttempted, listEditorClasses.showInvalid]
        )}
        onSubmit={() => {
          submit();
          return false;
        }}
      >
        <section className={classes.basicInfo}>
          <div className={classes.otherMetadata}>
            <h2>
              <input
                onChange={event => setRecipeName(event.target.value)}
                className='reset'
                required
                maxLength={60}
                placeholder='Recipe Title'
              />
            </h2>
            <VisibilityChooser isPrivate={isPrivate} setPrivate={setPrivate} />
            <input
              type='number'
              min={0}
              className={`${classes.timeInput} reset`}
              required
              onChange={event => setPrepTime(parseInt(event.target.value, 10))}
              placeholder='Prep time (min)'
            />
            <input
              type='number'
              min={0}
              className={`${classes.timeInput} reset`}
              required
              onChange={event => setCookTime(parseInt(event.target.value, 10))}
              placeholder='Cook time (min)'
            />
          </div>
          <div>
            <input
              type='file'
              ref={imageInput}
              accept='image/*'
              style={{ display: 'none' }}
              tabIndex={-1}
              onChange={event => setImage(event.target.files)}
            />
            <button
              className={classNames(classes.imageUploadContainer, {
                [classes.hasImage]: !!imageURL
              })}
              type='button'
              onClick={promptImageFileInput}
              style={imageURL ? { backgroundImage: `url(${imageURL})` } : undefined}
            >
              <Image size={48} strokeWidth={1} />
              <span>Add a picture of your recipe</span>
            </button>
          </div>
        </section>
        <h3>Ingredients</h3>
        <ListEditor
          list={ingredients}
          setList={setIngredients}
          type='unordered'
          required
          nextPlaceholder='Add an ingredient...'
        />
        <h3>Preparation</h3>
        <ListEditor
          list={steps}
          setList={setSteps}
          type='ordered'
          required
          nextPlaceholder='Add an instruction...'
        />
        <button className={classes.submit} type='submit' onClick={() => setSubmitAttempted(true)}>
          <Check size={18} />
          {intent === 'create' ? 'Create' : 'Save changes'}
        </button>
      </form>
    </div>
  );
};

export default RecipeEditor;
