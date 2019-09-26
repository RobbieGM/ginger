import * as reducers from './reducers';
import {
  createStore,
  combineReducers,
  ReducersMapObject,
  Store,
  AnyAction
} from 'redux';
import AppState, { Recipe } from './state';
import { AppAction } from './actions';
import { persistStore, persistReducer, createTransform } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
// import createCompressor from 'redux-persist-transform-compress';

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__: any;
  }
}

const rootReducer = combineReducers((reducers as unknown) as ReducersMapObject<
  AppState,
  AppAction
>);

export const store = createStore(
  persistReducer<AppState, AppAction>(
    {
      key: 'root',
      storage,
      transforms: [
        createTransform((stateToBeSaved, key) => {
          if (key === 'recipes') {
            const recipes = stateToBeSaved as Recipe[];
            return recipes.filter(recipe => recipe.bookmarkDate !== undefined);
          }
          return stateToBeSaved;
        }) // ,
        // createCompressor()
      ]
    },
    rootReducer
  ),
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

export const storePersistor = persistStore(
  (store as unknown) as Store<any, AnyAction>,
  {}
);
