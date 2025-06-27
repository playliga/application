/**
 * Configures the state actions.
 *
 * @module
 */
import { Util } from '@liga/shared';
import { AppDispatch, AppState } from './state';

/** @enum */
export enum ReduxActions {
  APP_INFO_UPDATE,
  APP_STATUS_UPDATE,
  CONTINENTS_UPDATE,
  EMAILS_UPDATE,
  EMAILS_DELETE,
  LOCALE_UPDATE,
  PLAYING_UPDATE,
  PROFILE_UPDATE,
  PROFILES_DELETE,
  PROFILES_UPDATE,
  WINDOW_DATA_UPDATE,
  WORKING_UPDATE,
}

/**
 * @param payload The redux payload.
 * @function
 */
export function appInfoUpdate(payload: AppState['appInfo']) {
  return {
    type: ReduxActions.APP_INFO_UPDATE,
    payload,
  };
}

/**
 * @param payload The redux payload.
 * @function
 */
export function appStatusUpdate(payload: AppState['appStatus']) {
  return {
    type: ReduxActions.APP_STATUS_UPDATE,
    payload,
  };
}

/**
 * @param payload The redux payload.
 * @function
 */
export function continentsUpdate(payload: AppState['continents']) {
  return {
    type: ReduxActions.CONTINENTS_UPDATE,
    payload,
  };
}

/**
 * @param payload The redux payload.
 * @function
 */
export function emailsUpdate(payload: AppState['emails']) {
  return {
    type: ReduxActions.EMAILS_UPDATE,
    payload,
  };
}

/**
 * @param payload The redux payload.
 * @function
 */
export function emailsDelete(payload: AppState['emails']) {
  return {
    type: ReduxActions.EMAILS_DELETE,
    payload,
  };
}

/**
 * @param payload The redux payload.
 * @function
 */
export function localeUpdate(payload: AppState['locale']) {
  return {
    type: ReduxActions.LOCALE_UPDATE,
    payload,
  };
}

/**
 * @param payload The redux payload.
 * @function
 */
export function playingUpdate(payload: AppState['playing']) {
  return {
    type: ReduxActions.PLAYING_UPDATE,
    payload,
  };
}

/**
 * @param payload The redux payload.
 * @function
 */
export function profileUpdate(payload: AppState['profile']) {
  return {
    type: ReduxActions.PROFILE_UPDATE,
    payload,
  };
}

/**
 * @param payload The redux payload.
 * @function
 */
export function profilesDelete(payload: AppState['profiles']) {
  return {
    type: ReduxActions.PROFILES_DELETE,
    payload,
  };
}

/**
 * @param payload The redux payload.
 * @function
 */
export function profilesUpdate(payload: AppState['profiles']) {
  return {
    type: ReduxActions.PROFILES_UPDATE,
    payload,
  };
}

/**
 * @param payload The redux payload.
 * @function
 */
export function windowDataUpdate(payload: AppState['windowData']) {
  return {
    type: ReduxActions.WINDOW_DATA_UPDATE,
    payload,
  };
}

/**
 * @param payload The redux payload.
 * @function
 */
export function workingUpdate(payload: AppState['working']) {
  return {
    type: ReduxActions.WORKING_UPDATE,
    payload,
  };
}

/**
 * Thunk action that advances the calendar.
 *
 * @param days The number of days to advance.
 * @function
 */
export function calendarAdvance(days?: number) {
  return async (dispatch: AppDispatch) => {
    dispatch(workingUpdate(true));
    await api.calendar.start(days);
    dispatch(workingUpdate(false));
  };
}

/**
 * Thunk action that starts the game server.
 *
 * @function
 */
export function play() {
  return async (dispatch: AppDispatch) => {
    dispatch(playingUpdate(true));
    await Util.sleep(1000);
    await api.play.start();
    dispatch(calendarAdvance(1));
    dispatch(playingUpdate(false));
  };
}
