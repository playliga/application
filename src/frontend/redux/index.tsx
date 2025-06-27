/**
 * Configures this application's state management.
 *
 * @module
 */
import React from 'react';
import reducers from './reducers';
import { AppDispatch, AppState, InitialState } from './state';

/**
 * Creates the application's state context.
 *
 * @constant
 */
export const AppStateContext = React.createContext<{
  state: AppState;
  dispatch: AppDispatch;
}>({
  state: InitialState,
  dispatch: () => null,
});

/**
 * HOC that provides the state to its child components.
 *
 * @param props Root props.
 * @param props.children Children to render.
 * @function
 */
export function AppStateProvider(props: { children: React.ReactNode }) {
  const [state, dispatchBase] = React.useReducer(reducers, InitialState);

  // add thunk support
  const dispatch: AppDispatch = React.useMemo(
    () => (action) => (typeof action === 'function' ? action(dispatch) : dispatchBase(action)),
    [dispatchBase],
  );

  return (
    <AppStateContext.Provider value={{ state, dispatch }}>
      {props.children}
    </AppStateContext.Provider>
  );
}
