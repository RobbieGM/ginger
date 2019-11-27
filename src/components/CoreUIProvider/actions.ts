import { createAction, Action, ActionWithPayload } from 'store/actions';
import { Snackbar } from 'store/state';

// export const dismissSnackbar = (): ActionType<void> => (dispatch, getState) => {
//   dispatch(createAction('DISMISS_SNACKBAR'));
//   if (getState().queuedSnackbars.length > 0) setTimeout(() => dispatch(dismissSnackbar()), 2000);
// };
export const dismissSnackbar = () => createAction('DISMISS_SNACKBAR');
export type DismissSnackbarAction = Action<'DISMISS_SNACKBAR'>;

// export const showSnackbar = (text: string): ActionType<void> => (dispatch, getState) => {
//   dispatch(createAction('SHOW_SNACKBAR', text));
//   setTimeout(() => {
//     // If this dialog is first in the queue remove it,
//     // If showSnackbar was called while another was already showing
//     if (getState().queuedSnackbars[0] === text) {
//       dispatch(dismissSnackbar());
//     }
//   }, 2000);
// };
export const showSnackbar = (text: string) =>
  createAction('SHOW_SNACKBAR', { text, id: Math.random() });
export type ShowSnackbarAction = ActionWithPayload<'SHOW_SNACKBAR', Snackbar>;

export type SnackbarAction = ShowSnackbarAction | DismissSnackbarAction;
