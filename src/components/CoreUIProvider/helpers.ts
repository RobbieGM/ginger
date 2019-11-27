import { OperationResult } from 'urql/dist/types/types';
import { DispatchType } from 'store/store';
import { showSnackbar } from './actions';

/**
 * Shows an error message with CoreUIProvider if the given operation fails
 *
 * @param errorMessage The error message to show
 * @param dispatch A dispatch function for the store
 * @param result The operation to show an error for if it fails
 */
export const showErrorIfPresent = (
  errorMessage: string,
  dispatch: DispatchType,
  ignoreIfOffline = false
) => (result: OperationResult<any>) => {
  const ignored = ignoreIfOffline && !navigator.onLine;
  if (result.error != null && !ignored) {
    dispatch(showSnackbar(errorMessage));
  }
};
