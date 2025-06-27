/**
 * Configures the application state.
 *
 * @module
 */
import type AppInfo from 'package.json';
import Locale from '@liga/locale';
import { Constants, Eagers } from '@liga/shared';

/** @interface */
export interface AppAction<T> {
  type: number;
  payload?: T;
}

/** @interface */
export interface AppState {
  appInfo: typeof AppInfo;
  appStatus: string;
  continents: Array<
    Awaited<ReturnType<typeof api.continents.all<typeof Eagers.continent>>>[number]
  >;
  emails: Awaited<ReturnType<typeof api.emails.all<typeof Eagers.email>>>;
  locale: Awaited<ReturnType<typeof api.app.locale>>;
  playing: boolean;
  profile: Awaited<ReturnType<typeof api.profiles.current<typeof Eagers.profile>>>;
  profiles: Array<AppState['profile']>;
  windowData: Partial<{
    [Constants.WindowIdentifier.Landing]: Parameters<typeof api.profiles.create>[number];
  }>;
  working: boolean;
}

/** @type {AppActions} */
export type AppActions = AppAction<AppState[keyof AppState]>;

/** @type {AppDispatch} */
export type AppDispatch = (action: AppActions | ThunkAction) => void;

/** @type {ThunkAction} */
export type ThunkAction = (dispatch: AppDispatch) => void | Promise<void>;

/** @constant */
export const InitialState: AppState = {
  appInfo: null,
  appStatus: null,
  continents: [],
  emails: [],
  locale: Locale.en,
  playing: false,
  profile: null,
  profiles: [],
  windowData: {
    landing: {
      today: new Date(
        new Date().getFullYear(),
        Constants.Application.SEASON_START_MONTH,
        Constants.Application.SEASON_START_DAY,
      ),
    },
  },
  working: false,
};
