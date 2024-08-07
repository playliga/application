/**
 * Saves the provided form data as a new career.
 *
 * @module
 */
import React from 'react';
import { Constants } from '@liga/shared';
import { AppStateContext } from '@liga/frontend/redux';

/**
 * Status messages displayed to the user.
 *
 * Sorted by order of operations.
 *
 * @enum
 */
enum Status {
  Init = 'Initializing database...',
  Connecting = 'Connecting to database...',
  Saving = 'Saving player and team data...',
  Worldgen = 'Generating world...',
}

/**
 * Exports this module.
 *
 * @exports
 */
export default function () {
  const { state } = React.useContext(AppStateContext);
  const [status, setStatus] = React.useState(Status.Init);
  const windowData = state.windowData[Constants.WindowIdentifier.Landing];

  // get the latest profile id and
  // increment its id by one
  const latestProfile = Math.max(...state.profiles.map((profile) => profile.id));
  const newSaveId = (isFinite(latestProfile) ? latestProfile : 0) + 1;

  React.useEffect(() => {
    Promise.resolve()
      // create new save and connect to it
      .then(() => api.saves.create(newSaveId))
      .then(() => Promise.resolve(setStatus(Status.Connecting)))
      .then(() => api.database.connect(String(newSaveId)))

      // create the user's new profile
      .then(() => Promise.resolve(setStatus(Status.Saving)))
      .then(() => api.profiles.create(windowData))

      // create calendar entry to start the season and
      // advance by one day to generate the world
      .then(() => Promise.resolve(setStatus(Status.Worldgen)))
      .then(() =>
        api.calendar.create({
          date: windowData.today.toISOString(),
          type: Constants.CalendarEntry.SEASON_START,
        }),
      )
      .then(() => api.calendar.start())

      // open up the main window and close this one
      .then(() => {
        api.window.open(Constants.WindowIdentifier.Main);
        api.window.close(Constants.WindowIdentifier.Landing);
      })

      // there's an issue with react-router causing unnecessary
      // re-renders which triggers multiple saves happening so
      // catch it here and ignore if that's what we ran into
      //
      // @see https://github.com/remix-run/react-router/issues/7634
      .catch(
        (error: Error) =>
          !error.message.search(/unique constraint failed/gi) && Promise.reject(error),
      );
  }, []);

  return (
    <article className="center h-full">
      <header className="stack-y items-center">
        <span className="loading loading-bars loading-lg" />
        <p>{status}</p>
      </header>
    </article>
  );
}
