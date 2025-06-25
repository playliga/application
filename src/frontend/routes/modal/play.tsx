/**
 * The pregame modal allows users to customize settings
 * or their squad before starting their match.
 *
 * @module
 */
import React from 'react';
import { useLocation } from 'react-router-dom';
import { cloneDeep, differenceBy, isNull, merge, pick, random, sample, set } from 'lodash';
import { Constants, Eagers, Util } from '@liga/shared';
import { cx } from '@liga/frontend/lib';
import { AppStateContext } from '@liga/frontend/redux';
import { useTranslation } from '@liga/frontend/hooks';
import { Image, PlayerCard } from '@liga/frontend/components';
import { FaExclamationTriangle } from 'react-icons/fa';

/** @enum */
enum Tab {
  MAPS,
  SQUADS,
  SETTINGS,
}

/** @interface */
interface MapVetoAction {
  team: Awaited<ReturnType<typeof api.teams.all>>[number];
  type: Constants.MapVetoAction;
  map: string;
}

/** @type {Matches} */
type Matches<T = typeof Eagers.match> = Awaited<ReturnType<typeof api.matches.all<T>>>;

/** @constant */
const CPU_THINKING_TIME_MAX = 3000;

/** @constant */
const CPU_THINKING_TIME_MIN = 1000;

/** @constant */
const LOCAL_STORAGE_KEY = 'settings';

/** @constants */
const SETTINGS_DEFAULT = pick(Constants.Settings, ['matchRules']);

/**
 * Renders an override settings warning.
 *
 * @param props       The root props.
 * @param props.left  The left value to compare.
 * @param props.right The right value to compare.
 * @function
 */
function SettingsOverrideLabel(props: { left: unknown; right: unknown }) {
  if (props.left === props.right) {
    return;
  }

  return (
    <span className="tooltip" data-tip="Overrides the default. Resets after this match ends.">
      <FaExclamationTriangle className="text-warning" />
    </span>
  );
}

/**
 * Exports this module.
 *
 * @exports
 */
export default function () {
  const location = useLocation();
  const t = useTranslation('windows');
  const { state } = React.useContext(AppStateContext);
  const [activeTab, setActiveTab] = React.useState<Tab>(Tab.MAPS);
  const [cpuThinking, setCpuThinking] = React.useState(false);
  const [match, setMatch] = React.useState<Matches[number]>();
  const [settings, setSettings] = React.useState(SETTINGS_DEFAULT);
  const [userSquad, setUserSquad] = React.useState<
    Awaited<ReturnType<typeof api.squad.all<typeof Eagers.player>>>
  >([]);
  const [vetoHistory, setVetoHistory] = React.useState<Array<MapVetoAction>>([]);

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

  // load map veto info
  const vetoSequence = React.useMemo(
    () => (match ? Constants.MapVetoConfig[match.games.length] : []),
    [match],
  );
  const vetoSequenceStep = React.useMemo(
    () => vetoSequence[vetoHistory.length],
    [vetoHistory, vetoSequence],
  );
  const vetoSequenceComplete = React.useMemo(
    () => vetoHistory.length >= vetoSequence.length,
    [vetoHistory, vetoSequence],
  );

  // handle settings updates
  const onSettingsUpdate = (path: string, value: unknown) => {
    const modified = cloneDeep(settings);
    set(modified, path, value);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(modified));
    setSettings(modified);
  };

  // handle map veto selections
  const onVetoSelection = (map: string) => {
    setVetoHistory([
      ...vetoHistory,
      {
        team: match.competitors[vetoSequenceStep.team].team,
        type: vetoSequenceStep.type,
        map,
      },
    ]);
  };

  // handle when cpu makes their map veto
  const cpu = React.useMemo(
    () =>
      !!match && match.competitors.find((competitor) => competitor.teamId !== state.profile.teamId),
    [match, state],
  );
  const cpuIdx = React.useMemo(
    () => !!match && !!cpu && match.competitors.findIndex((competitor) => competitor.id === cpu.id),
    [match, cpu],
  );
  React.useEffect(() => {
    if (!vetoSequenceStep || vetoSequenceStep.team !== cpuIdx) {
      return;
    }

    setCpuThinking(true);

    const pool = Constants.MapPool.filter((mapName) =>
      vetoHistory.every((item) => item.map !== mapName),
    );
    const timeout = setTimeout(
      () => {
        onVetoSelection(sample(pool));
        setCpuThinking(false);
      },
      random(CPU_THINKING_TIME_MIN, CPU_THINKING_TIME_MAX),
    );

    return () => clearTimeout(timeout);
  }, [cpuThinking, vetoSequenceStep, match]);

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
      <section
        role="tablist"
        className="tabs-box tabs border-base-content/10 rounded-none border-y"
      >
        {Object.keys(Tab)
          .filter((tabKey) => isNaN(Number(tabKey)))
          .map((tabKey: keyof typeof Tab) => (
            <a
              key={tabKey + '__tab'}
              role="tab"
              className={cx('tab capitalize', Tab[tabKey] === activeTab && 'tab-active')}
              onClick={() => setActiveTab(Tab[tabKey])}
            >
              {tabKey.replace('_', ' ').toLowerCase()}
            </a>
          ))}
      </section>
      {activeTab === Tab.MAPS && (
        <section className="flex flex-1 flex-col gap-1 overflow-y-scroll">
          {!!vetoSequenceStep && (
            <React.Fragment>
              <p>
                Waiting on {match.competitors[vetoSequenceStep.team].team.name} to&nbsp;
                <strong>{vetoSequenceStep.type.toUpperCase()}</strong> a map...
              </p>
              <p>
                <em>Tip: Click play and have everything auto-picked for you</em>
              </p>
            </React.Fragment>
          )}
          <article
            className="grid h-full flex-1 grid-cols-11 gap-2"
            style={{
              gridTemplateColumns: `repeat(${Constants.MapPool.length}, minmax(0, 1fr))`,
            }}
          >
            {Constants.MapPool.map((mapName) => {
              const picked = vetoHistory.find((item) => item.map === mapName);

              return (
                <figure key={mapName} className="relative h-full w-full">
                  <Image
                    title={Util.convertMapPool(mapName, settingsAll.general.game)}
                    src={Util.convertMapPool(mapName, settingsAll.general.game, true)}
                    onClick={() =>
                      !picked && !vetoSequenceComplete && !cpuThinking && onVetoSelection(mapName)
                    }
                    className={cx(
                      'h-full border object-cover shadow-md',
                      !picked && !vetoSequenceComplete && !cpuThinking && 'cursor-pointer',
                      picked
                        ? picked.type === Constants.MapVetoAction.PICK
                          ? 'border-success shadow-success'
                          : 'border-error shadow-error'
                        : 'border-base-content/50 shadow-base-content/50',
                    )}
                  />
                  {!!picked && (
                    <React.Fragment>
                      <span
                        className={cx(
                          'badge badge-sm absolute top-2 left-1/2 -translate-x-1/2',
                          picked.type === Constants.MapVetoAction.PICK
                            ? 'badge-success'
                            : 'badge-error',
                        )}
                      >
                        {picked.type.toUpperCase()}
                      </span>
                      <Image src={picked.team.blazon} className="absolute bottom-0 size-16" />
                    </React.Fragment>
                  )}
                </figure>
              );
            })}
          </article>
        </section>
      )}
      {activeTab === Tab.SQUADS && (
        <section className="divide-base-content/10 grid flex-1 grid-cols-2 items-start divide-x overflow-y-scroll">
          {match.competitors.map((competitor) => {
            const isUserTeam = competitor.teamId === state.profile.teamId;
            const team = competitor.team;

            // wire user's squad which can be changed
            // on-the-fly to this competitor's squad
            if (isUserTeam) {
              team.players = team.players.map((player) => ({
                ...player,
                starter: userSquad.find((userPlayer) => userPlayer.id === player.id)?.starter,
              }));
            }

            const starters = Util.getSquad(team, state.profile, true);
            const bench = differenceBy(team.players, starters, 'id');
            const squad = { starters, bench };

            return (
              <table key={competitor.id + '__competitor'} className="table-xs table table-fixed">
                {Object.keys(squad).map((key) => (
                  <React.Fragment key={key}>
                    <thead>
                      <tr>
                        <th>{key.toUpperCase()}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {squad[key as keyof typeof squad].map((player) => (
                        <tr key={player.id + '__squad'}>
                          <td
                            title={
                              player.id === state.profile.playerId ? t('shared.you') : undefined
                            }
                            className={cx(
                              'p-0',
                              player.id === state.profile.playerId && 'bg-base-200/50',
                            )}
                          >
                            <PlayerCard
                              collapsed
                              compact
                              key={player.id + '__squad'}
                              className="border-transparent bg-transparent"
                              game={settingsAll.general.game}
                              player={player}
                              noStats={player.id === state.profile.playerId}
                              onClickStarter={
                                isUserTeam &&
                                player.id !== state.profile.playerId &&
                                (userSquad.filter((userPlayer) => userPlayer.starter).length <
                                  Constants.Application.SQUAD_MIN_LENGTH - 1 ||
                                  player.starter) &&
                                (() => {
                                  api.squad
                                    .update({
                                      where: { id: player.id },
                                      data: {
                                        starter: !player.starter,
                                      },
                                    })
                                    .then(setUserSquad);
                                })
                              }
                            />
                          </td>
                        </tr>
                      ))}
                      {squad[key as keyof typeof squad].length === 0 && (
                        <tr>
                          <td className="h-[70px] text-center">
                            <b>{team.name}</b> {t('shared.noBench')}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </React.Fragment>
                ))}
              </table>
            );
          })}
        </section>
      )}
      {activeTab === Tab.SETTINGS && (
        <form className="form-ios flex-1 overflow-y-scroll">
          <fieldset>
            <article>
              <header>
                <p>{t('shared.maxRoundsTitle')}</p>
                <SettingsOverrideLabel
                  left={Number(settings.matchRules.maxRounds)}
                  right={Number(settingsAll.matchRules.maxRounds)}
                />
              </header>
              <aside>
                <select
                  className="select"
                  onChange={(event) => onSettingsUpdate('matchRules.maxRounds', event.target.value)}
                  value={settings.matchRules.maxRounds}
                >
                  {[6, 12, 24, 30].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </aside>
            </article>
            <article>
              <header>
                <p>{t('shared.startMoneyTitle')}</p>
              </header>
              <aside>
                <select
                  className="select"
                  onChange={(event) =>
                    onSettingsUpdate('matchRules.startMoney', event.target.value)
                  }
                  value={settings.matchRules.startMoney}
                >
                  {[800, 10_000].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </aside>
            </article>
            <article>
              <header>
                <p>{t('shared.freezeTimeTitle')}</p>
                <SettingsOverrideLabel
                  left={Number(settings.matchRules.freezeTime)}
                  right={Number(settingsAll.matchRules.freezeTime)}
                />
              </header>
              <aside>
                <select
                  className="select"
                  onChange={(event) =>
                    onSettingsUpdate('matchRules.freezeTime', event.target.value)
                  }
                  value={settings.matchRules.freezeTime}
                >
                  {[7, 15].map((value) => (
                    <option key={value} value={value}>
                      {value}s
                    </option>
                  ))}
                </select>
              </aside>
            </article>
            <article>
              <header>
                <p>{t('shared.mapOverrideTitle')}</p>
                <SettingsOverrideLabel
                  left={Number(settings.matchRules.mapOverride)}
                  right={Number(settingsAll.matchRules.mapOverride)}
                />
              </header>
              <aside>
                <select
                  className="select"
                  onChange={(event) =>
                    onSettingsUpdate(
                      'matchRules.mapOverride',
                      event.target.value === 'none' ? null : event.target.value,
                    )
                  }
                  value={
                    isNull(settings.matchRules.mapOverride) ? '' : settings.matchRules.mapOverride
                  }
                >
                  <option value={null}>none</option>
                  {Constants.MapPool.map((map) => (
                    <option key={map} value={map}>
                      {map}
                    </option>
                  ))}
                </select>
              </aside>
            </article>
            <article>
              <header>
                <p>{t('shared.overtimeTitle')}</p>
                <p>{t('shared.overtimeSubtitle')}</p>
              </header>
              <aside>
                <input
                  type="checkbox"
                  className="toggle"
                  onChange={(event) =>
                    onSettingsUpdate('matchRules.overtime', event.target.checked)
                  }
                  checked={settings.matchRules.overtime}
                  value={String(settings.matchRules.overtime)}
                />
              </aside>
            </article>
          </fieldset>
        </form>
      )}
      <button className="btn btn-xl btn-block btn-primary rounded-none active:translate-0!">
        {t('main.dashboard.play')}
      </button>
    </main>
  );
}
