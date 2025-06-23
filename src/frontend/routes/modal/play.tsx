/**
 * The pregame modal allows users to customize settings
 * or their squad before starting their match.
 *
 * @module
 */
import React from 'react';
import { useLocation } from 'react-router-dom';
import { merge, pick } from 'lodash';
import { Constants, Eagers, Util } from '@liga/shared';
import { AppStateContext } from '@liga/frontend/redux';
import { useTranslation } from '@liga/frontend/hooks';
import { Image } from '@liga/frontend/components';

/** @type {Matches} */
type Matches<T = typeof Eagers.match> = Awaited<ReturnType<typeof api.matches.all<T>>>;

/** @constant */
const LOCAL_STORAGE_KEY = 'settings';

/** @constants */
const SETTINGS_DEFAULT = pick(Constants.Settings, ['matchRules']);

/**
 * Exports this module.
 *
 * @exports
 */
export default function () {
  const location = useLocation();
  const t = useTranslation('windows');
  const { state } = React.useContext(AppStateContext);
  const [settings, setSettings] = React.useState(SETTINGS_DEFAULT);
  const [match, setMatch] = React.useState<Matches[number]>();

  // we only want to maintain and override specific settings
  // and not copy/merge with the whole object
  const settingsAll = React.useMemo(
    () => !!state.profile && Util.loadSettings(state.profile.settings),
    [],
  );
  const settingsLocal = React.useMemo(
    () =>
      !!localStorage.getItem(LOCAL_STORAGE_KEY) &&
      merge(
        settings,
        JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) as typeof Constants.Settings,
      ),
    [],
  );

  // initial data load
  React.useEffect(() => {
    if (!location.state) {
      return;
    }

    api.matches
      .all({
        where: {
          id: location.state,
        },
        include: Eagers.match.include,
      })
      .then((matches) => setMatch(matches[0]));
  }, []);

  // load settings
  React.useEffect(() => {
    if (settingsLocal) {
      setSettings(settingsLocal);
    } else {
      setSettings(pick(settingsAll, ['matchRules']));
    }
  }, [settingsLocal, settingsAll]);

  // grab basic match info
  const game = React.useMemo(() => match && match.games[0], [match]);
  const [home, away] = React.useMemo(() => (match ? match.competitors : []), [match]);

  if (!state.profile || !match) {
    return (
      <main className="h-screen w-screen">
        <section className="center h-full">
          <span className="loading loading-bars" />
        </section>
      </main>
    );
  }

  return (
    <main className="flex h-screen w-full flex-col">
      <header className="breadcrumbs border-base-content/10 bg-base-200 sticky top-0 z-30 overflow-x-visible border-b px-2 text-sm">
        <ul>
          <li>
            <span>
              {match.competition.tier.league.name}:&nbsp;
              {Constants.IdiomaticTier[match.competition.tier.slug]}
            </span>
          </li>
          <li>
            {match.competition.tier.groupSize
              ? `${t('shared.matchday')} ${match.round}`
              : Util.parseCupRounds(match.round, match.totalRounds)}
          </li>
          <li>{Util.convertMapPool(game.map, settingsAll.general.game)}</li>
        </ul>
      </header>
      <section className="card image-full h-16 rounded-none drop-shadow-md before:rounded-none!">
        <figure>
          <Image
            className="h-full w-full"
            src={Util.convertMapPool(game.map, settingsAll.general.game, true)}
          />
        </figure>
        <header className="card-body grid grid-cols-3 place-items-center p-0">
          <article className="grid w-full grid-cols-2 place-items-center font-black">
            <img src={home.team.blazon} className="size-8" />
            <p>{home.team.name}</p>
          </article>
          <article className="center text-2xl font-bold">
            <p>vs</p>
          </article>
          <article className="grid w-full grid-cols-2 place-items-center font-black">
            <p>{away.team.name}</p>
            <img src={away.team.blazon} className="size-8" />
          </article>
        </header>
      </section>
    </main>
  );
}
