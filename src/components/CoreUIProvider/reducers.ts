import { AppAction } from 'store/actions';
import { Snackbar } from 'store/state';

export function queuedSnackbars(state: Snackbar[] = [], action: AppAction): Snackbar[] {
  switch (action.type) {
    case 'SHOW_SNACKBAR':
      return [...state, action.payload];
    case 'DISMISS_SNACKBAR':
      return state.slice(1);
    default:
      return state;
  }
}
