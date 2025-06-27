/**
 * Configures the state reducers.
 *
 * @module
 */
import { keyBy, merge, values, xorBy } from 'lodash';
import { ReduxActions } from './actions';
import { AppAction, AppActions, AppState, InitialState } from './state';

/**
 * @param state Application state.
 * @param action Redux action.
 * @function
 */
function appInfo(
  state: typeof InitialState.appInfo,
  action: AppAction<typeof InitialState.appInfo>,
) {
  switch (action.type) {
    case ReduxActions.APP_INFO_UPDATE:
      return action.payload as typeof state;
    default:
      return state;
  }
}

/**
 * @param state Application state.
 * @param action Redux action.
 * @function
 */
function appStatus(
  state: typeof InitialState.appStatus,
  action: AppAction<typeof InitialState.appStatus>,
) {
  switch (action.type) {
    case ReduxActions.APP_STATUS_UPDATE:
      return action.payload;
    default:
      return state;
  }
}

/**
 * @param state Application state.
 * @param action Redux action.
 * @function
 */
function continents(
  state: typeof InitialState.continents,
  action: AppAction<typeof InitialState.continents>,
) {
  switch (action.type) {
    case ReduxActions.CONTINENTS_UPDATE:
      return action.payload;
    default:
      return state;
  }
}

/**
 * @param state Application state.
 * @param action Redux action.
 * @function
 */
function emails(state: typeof InitialState.emails, action: AppAction<typeof InitialState.emails>) {
  switch (action.type) {
    case ReduxActions.EMAILS_DELETE:
      return xorBy(state, action.payload, 'id');
    case ReduxActions.EMAILS_UPDATE:
      // merges the two arrays, replacing the entries that overlap with the payload
      return values(merge(keyBy(state, 'id'), keyBy(action.payload, 'id')))
        .sort((a, b) => b.sentAt.valueOf() - a.sentAt.valueOf())
        .map((email) => {
          // sort the email internal entries
          email.dialogues.sort((a, b) => b.sentAt.valueOf() - a.sentAt.valueOf());
          return email;
        });
    default:
      return state;
  }
}

/**
 * @param state Application state.
 * @param action Redux action.
 * @function
 */
function locale(state: typeof InitialState.locale, action: AppAction<typeof InitialState.locale>) {
  switch (action.type) {
    case ReduxActions.LOCALE_UPDATE:
      return action.payload as typeof state;
    default:
      return state;
  }
}

/**
 * @param state Application state.
 * @param action Redux action.
 * @function
 */
function playing(
  state: typeof InitialState.playing,
  action: AppAction<typeof InitialState.playing>,
) {
  switch (action.type) {
    case ReduxActions.PLAYING_UPDATE:
      return action.payload;
    default:
      return state;
  }
}

/**
 * @param state Application state.
 * @param action Redux action.
 * @function
 */
function profile(
  state: typeof InitialState.profile,
  action: AppAction<typeof InitialState.profile>,
) {
  switch (action.type) {
    case ReduxActions.PROFILE_UPDATE:
      return action.payload;
    default:
      return state;
  }
}

/**
 * @param state Application state.
 * @param action Redux action.
 * @function
 */
function profiles(
  state: typeof InitialState.profiles,
  action: AppAction<typeof InitialState.profiles>,
) {
  switch (action.type) {
    case ReduxActions.PROFILES_DELETE: {
      // @todo: support deleting multiple items
      const [item] = action.payload;
      return state.filter((profile) => profile.id !== item.id);
    }
    case ReduxActions.PROFILES_UPDATE:
      return action.payload;
    default:
      return state;
  }
}

/**
 * @param state Application state.
 * @param action Redux action.
 * @function
 */
function windowData(
  state: typeof InitialState.windowData,
  action: AppAction<typeof InitialState.windowData>,
) {
  switch (action.type) {
    case ReduxActions.WINDOW_DATA_UPDATE:
      return merge(state, action.payload);
    default:
      return state;
  }
}

/**
 * @param state Application state.
 * @param action Redux action.
 * @function
 */
function working(
  state: typeof InitialState.working,
  action: AppAction<typeof InitialState.working>,
) {
  switch (action.type) {
    case ReduxActions.WORKING_UPDATE:
      return action.payload;
    default:
      return state;
  }
}

/**
 * Exports this module.
 *
 * @param state Application state.
 * @param action Redux action.
 * @function
 * @exports
 */
export default function (state: AppState, action: AppActions) {
  return {
    appInfo: appInfo(state.appInfo, action as AppAction<typeof state.appInfo>),
    appStatus: appStatus(state.appStatus, action as AppAction<typeof state.appStatus>),
    continents: continents(state.continents, action as AppAction<typeof state.continents>),
    emails: emails(state.emails, action as AppAction<typeof state.emails>),
    locale: locale(state.locale, action as AppAction<typeof state.locale>),
    playing: playing(state.playing, action as AppAction<typeof state.playing>),
    profile: profile(state.profile, action as AppAction<typeof state.profile>),
    profiles: profiles(state.profiles, action as AppAction<typeof state.profiles>),
    windowData: windowData(state.windowData, action as AppAction<typeof state.windowData>),
    working: working(state.working, action as AppAction<typeof state.working>),
  };
}
