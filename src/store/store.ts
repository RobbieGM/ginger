/* eslint-disable no-underscore-dangle */
import storage from 'redux-persist/lib/storage';
import { persistStore, persistReducer, createTransform } from 'redux-persist';
import {
  createStore,
  combineReducers,
  ReducersMapObject,
  Store,
  AnyAction,
  compose,
  applyMiddleware
} from 'redux';
import thunk from 'redux-thunk';
import * as reducers from './reducers';
import AppState, { PartialRecipe } from './state';
import { AppAction } from './actions';
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
            const recipes = stateToBeSaved as PartialRecipe[];
            return recipes.filter(recipe => recipe.bookmarkDate !== undefined);
          }
          return stateToBeSaved;
        }) // ,
        // createCompressor()
      ]
    },
    rootReducer
  ),
  compose(
    applyMiddleware(thunk),
    window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__() : (x: any) => x
  )
);

export const storePersistor = persistStore((store as unknown) as Store<any, AnyAction>, {});
