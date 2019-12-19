import { RecipeInput } from 'backend/api-input/RecipeInput';
import classNames from 'classnames';
import { CoreUIContext } from 'components/CoreUIProvider';
import { showSnackbar } from 'components/CoreUIProvider/actions';
import ListEditor from 'components/ListEditor';
import { KeyedList } from 'components/ListEditor/types';
import React, { useContext, useRef, useState } from 'react';
import { Check, Image, X } from 'react-feather';
import { useDispatch } from 'react-redux';
import { Dispatch } from 'redux';
import { AppAction } from 'store/actions';
import topBarClasses from '../../../top-bar.module.scss';
import listEditorClasses from '../../ListEditor/style.module.scss';
import { useImageUpload } from './helpers';
import classes from './style.module.scss';
import VisibilityChooser from './VisibilityChooser';

interface Props {
  intent: 'create' | 'edit';
  close: () => void;
  onSubmit: (recipe: Omit<RecipeInput, 'id'>) => void;
}

const RecipeEditor: React.FC<Props> = ({ intent, close: forceClose, onSubmit }) => {
  const [recipeName, setRecipeName] = useState('');
  const [isPrivate, setPrivate] = useState(false);
  const {
    imageURL,
    uploading: imageUploading,
    error: imageUploadError,
    upload: uploadImage
  } = useImageUpload();
  const [prepTime, setPrepTime] = useState<number | undefined>();
  const [cookTime, setCookTime] = useState<number | undefined>();
  const [servings, setServings] = useState<number | undefined>();
  const [ingredients, setIngredients] = useState([] as KeyedList<string>);
  const [directions, setSteps] = useState([] as KeyedList<string>);

  const imageInput = useRef<HTMLInputElement>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const dispatch = useDispatch<Dispatch<AppAction>>();
  const { showModalDialog } = useContext(CoreUIContext);

  function promptImageFileInput() {
    if (imageInput && imageInput.current) {
      imageInput.current.click();
    }
  }
  async function setImage(files: FileList | null) {
    if (files == null || files[0] == null) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      dispatch(showSnackbar('That file is not an image'));
      return;
    }
    uploadImage(file);
  }
  async function close() {
    const hasUnsavedData = [
      recipeName,
      imageURL,
      prepTime,
      cookTime,
      ingredients.length,
      directions.length
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
      servings != null &&
      ingredients.length > 0 &&
      directions.length > 0
    ) {
      onSubmit({
        name: recipeName,
        prepTime,
        cookTime,
        servings,
        ingredients: ingredients.map(x => x.value),
        directions: directions.map(x => x.value),
        imageURL,
        isPrivate,
        lastModified: Date.now()
      });
    }
  }
  return (
    <div className={classes.recipeEditorContainer}>
      <div className={topBarClasses.topBar}>
        <button className={topBarClasses.button} onClick={close} aria-label='Close'>
          <X />
        </button>
        {intent === 'create' ? 'Create recipe' : 'Edit recipe'}
      </div>
      <form
        className={classNames(
          classes.form,
          submitAttempted && [classes.submitAttempted, listEditorClasses.showInvalid]
        )}
        onSubmit={event => {
          submit();
          event.preventDefault();
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
              className={`${classes.input} reset`}
              required
              onChange={event => setPrepTime(parseInt(event.target.value, 10))}
              placeholder='Prep time (min)'
            />
            <input
              type='number'
              min={0}
              className={`${classes.input} reset`}
              required
              onChange={event => setCookTime(parseInt(event.target.value, 10))}
              placeholder='Cook time (min)'
            />
            <input
              type='number'
              min={0}
              className={`${classes.input} reset`}
              required
              onChange={event => setServings(parseInt(event.target.value, 10))}
              placeholder='Servings'
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
          list={directions}
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
