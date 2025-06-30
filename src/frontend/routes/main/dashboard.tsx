/**
 * The main browser window dashboard.
 *
 * @module
 */
import React from 'react';
import { addDays, format } from 'date-fns';
import { Constants, Eagers, Util } from '@liga/shared';
import { cx } from '@liga/frontend/lib';
import { AppStateContext } from '@liga/frontend/redux';
import { calendarAdvance, play } from '@liga/frontend/redux/actions';
import { useTranslation } from '@liga/frontend/hooks';
import { Standings, Image, Historial } from '@liga/frontend/components';
import {
  FaCalendarDay,
  FaChartBar,
  FaCloudMoon,
  FaCog,
  FaExclamationTriangle,
  FaForward,
  FaMapSigns,
  FaStream,
  FaTv,
} from 'react-icons/fa';

/** @interface */
interface StatusBannerProps {
  error: string;
}

/** @constant */
const NUM_UPCOMING = 5 + 1; // adds an extra for "next match"

/** @constant */
const NUM_PREVIOUS = 5;

/**
 * Application status error banner.
 *
 * @param props The root props.
 * @function
 */
export function StatusBanner(props: StatusBannerProps) {
  const t = useTranslation('windows');

  if (!props.error) {
    return null;
  }

  const error = React.useMemo(
    () => JSON.parse(props.error) as NodeJS.ErrnoException,
    [props.error],
  );

  // figure out which game is not installed
  const message = React.useMemo(() => {
    if (error.code !== Constants.ErrorCode.ENOENT && error.code !== Constants.ErrorCode.ERUNNING) {
      return;
    }

    const [, match] = error.path.match(/((?:csgo|cstrike|cs2|hl|steam)\.exe)/) || [];
    return match;
  }, [error]);

  return (
    <section className="alert alert-warning flex h-8 justify-center rounded-none p-0">
      <FaExclamationTriangle />
      {error.code === Constants.ErrorCode.ENOENT &&
        (message === Constants.GameSettings.CS16_EXE ||
          message === Constants.GameSettings.CSSOURCE_EXE ||
          message === Constants.GameSettings.STEAM_EXE) && (
          <p>
            {message} {t('main.dashboard.gameNotDetected')}
          </p>
        )}

      {error.code === Constants.ErrorCode.ENOENT && message === Constants.GameSettings.CSGO_EXE && (
        <React.Fragment>
          <p>{t('main.dashboard.csgoNotDetected')}</p>
          <button
            className="btn btn-neutral btn-sm rounded-none"
            onClick={() => {
              api.window.send<ModalRequest>(Constants.WindowIdentifier.Modal, {
                target: '/markdown/' + message,
              });
            }}
          >
            {t('shared.details')}
          </button>
        </React.Fragment>
      )}

      {error.code === Constants.ErrorCode.ERUNNING && (
        <p>
          {message} {t('main.dashboard.runningError')}
        </p>
      )}

      {!!error.path.includes('plugins') && <p>{t('main.dashboard.pluginsError')}</p>}
    </section>
  );
}

/**
 * Exports this module.
 *
 * @exports
 */
export default function () {
  const t = useTranslation('windows');
  const { state, dispatch } = React.useContext(AppStateContext);
  const [settings, setSettings] = React.useState(Constants.Settings);
  const [upcoming, setUpcoming] = React.useState<
    Awaited<ReturnType<typeof api.matches.upcoming<typeof Eagers.match>>>
  >([]);
  const [matchHistorial, setMatchHistorial] = React.useState<Array<typeof upcoming>>([[], []]);
  const [previous, setPrevious] = React.useState<typeof upcoming>([]);

  // load settings
  React.useEffect(() => {
    if (!state.profile) {
      return;
    }

    setSettings(Util.loadSettings(state.profile.settings));
  }, [state.profile]);

  // fetch upcoming list of matches
  React.useEffect(() => {
    if (!state.profile) {
      return;
    }

    api.matches.upcoming(Eagers.match, NUM_UPCOMING).then(setUpcoming);
  }, [state.profile]);

  // fetch match historial for match preview
  React.useEffect(() => {
    const [nextMatch] = upcoming.slice(0, 1);

    if (!nextMatch) {
      return;
    }

    Promise.all(
      nextMatch.competitors.map((competitor) =>
        api.matches.previous(Eagers.match, competitor.teamId),
      ),
    ).then(setMatchHistorial);
  }, [upcoming]);

  // fetch previous matches if no upcoming matches
  React.useEffect(() => {
    const [nextMatch] = upcoming.slice(0, 1);

    if (nextMatch || !state.profile) {
      return;
    }

    api.matches.previous(Eagers.match, state.profile.teamId).then(setPrevious);
  }, [upcoming, state.profile]);

  // fill in rows if not enough upcoming matches
  const upcomingFiller = React.useMemo(
    () => [...Array(Math.max(0, NUM_UPCOMING - (upcoming.length || 1)))],
    [upcoming],
  );

  // check if its matchday
  const isMatchday = React.useMemo(
    () =>
      state.profile &&
      upcoming.length &&
      upcoming[0]?.date.toISOString() === state.profile.date.toISOString(),
    [upcoming, state.profile],
  );

  // grab next match info
  const [spotlight] = React.useMemo(() => upcoming.slice(0, 1), [upcoming]);

  // grab standings info
  const [standings] = React.useMemo(
    () => (spotlight ? upcoming.slice(0, 1) : previous),
    [spotlight, previous],
  );

  // grab user's team info
  const userTeam = React.useMemo(
    () =>
      !!standings &&
      standings.competition.competitors.find(
        (competitor) => competitor.teamId === state.profile.teamId,
      ),
    [standings, state.profile],
  );

  // grab competitors by user's group
  const userGroupCompetitors = React.useMemo(
    () =>
      !!standings &&
      !!standings.competition.tier.groupSize &&
      standings.competition.competitors
        .filter((competitor) => competitor.group === userTeam.group)
        .sort((a, b) => a.position - b.position),
    [standings, userTeam],
  );

  return (
    <div className="dashboard">
      {/** PLAYING MODAL */}
      <dialog className={cx('modal', state.playing && 'modal-open')}>
        <section className="modal-box">
          <h3 className="text-lg">{t('main.dashboard.playingMatchTitle')}</h3>
          <p className="py-4">{t('main.dashboard.playingMatchSubtitle')}</p>
        </section>
      </dialog>

      {/** SETTINGS VALIDATION WARNING BANNER */}
      <StatusBanner error={state.appStatus} />

      {/** MAIN CONTENT */}
      <main>
        {/** LEFT COLUMN */}
        <div className="stack-y gap-0!">
          <section className="stack-y gap-0!">
            <header className="prose border-t-0!">
              <h2>{t('main.dashboard.headerUpcomingMatches')}</h2>
            </header>
            <table className="table table-fixed">
              <tbody>
                {upcoming.slice(1, NUM_UPCOMING).map((match) => {
                  const opponent = match.competitors.find(
                    (competitor) => competitor.teamId !== state.profile.teamId,
                  );
                  return (
                    <tr key={`${match.id}__match_upcoming`}>
                      <td className="w-1/6" title={format(match.date, 'PPPP')}>
                        {format(match.date, 'MM/dd')}
                      </td>
                      <td className="w-3/6 truncate" title={opponent?.team.name || '-'}>
                        <img
                          src={opponent?.team.blazon || 'resources://blazonry/009400.png'}
                          className="mr-2 inline-block size-4"
                        />
                        <span>{opponent?.team.name || '-'}</span>
                      </td>
                      <td
                        className="w-2/6 truncate"
                        title={`${match.competition.tier.league.name}: ${Constants.IdiomaticTier[match.competition.tier.slug]}`}
                      >
                        {Constants.IdiomaticTier[match.competition.tier.slug]}
                      </td>
                    </tr>
                  );
                })}
                {upcomingFiller.map((_, idx) => (
                  <tr key={`${idx}__filler_match_upcoming`} className="text-muted">
                    <td className="w-1/6">
                      {state.profile
                        ? format(
                            addDays(
                              !upcoming.length ? state.profile.date : upcoming.slice(-1)[0].date,
                              idx + 1,
                            ),
                            'MM/dd',
                          )
                        : '-'}
                    </td>
                    <td className="w-3/6 truncate">{t('main.dashboard.noMatchScheduled')}</td>
                    <td className="w-2/6">-</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          <section className="stack-y gap-0!">
            <header className="prose">
              <h2>{t('shared.standings')}</h2>
            </header>
            {!standings && (
              <article key="empty__standings" className="card h-32 rounded-none">
                <aside className="card-body items-center justify-center">
                  <p className="grow-0">{t('main.dashboard.noStandings')}</p>
                </aside>
              </article>
            )}
            {!!standings &&
              !!spotlight &&
              (() => {
                if (standings.competition.tier.groupSize) {
                  return (
                    <article className="stack-y divide-base-content/10 !gap-0 divide-y">
                      <aside className="stack-x items-center px-2">
                        <Image
                          className="size-16"
                          src={Util.getCompetitionLogo(
                            spotlight.competition.tier.slug,
                            spotlight.competition.federation.slug,
                          )}
                        />
                        <header>
                          <h3>{spotlight.competition.tier.league.name}</h3>
                          <h4>{Constants.IdiomaticTier[spotlight.competition.tier.slug]}</h4>
                          <h5>
                            {t('shared.matchday')} {spotlight.round}
                          </h5>
                        </header>
                      </aside>
                      <Standings
                        compact
                        highlight={state.profile.teamId}
                        competitors={userGroupCompetitors}
                        title={
                          standings.competition.tier.league.slug ===
                          Constants.LeagueSlug.ESPORTS_LEAGUE
                            ? Constants.IdiomaticTier[standings.competition.tier.slug]
                            : `${t('shared.group')} ${Util.toAlpha(userTeam.group)}`
                        }
                        zones={
                          standings.competition.status === Constants.CompetitionStatus.STARTED &&
                          (Constants.TierZones[standings.competition.tier.slug] ||
                            Constants.TierZones.default)
                        }
                      />
                    </article>
                  );
                }

                return (
                  <article className="stack-y divide-base-content/10 !gap-0 divide-y">
                    <aside className="stack-x items-center px-2">
                      <Image
                        className="size-16"
                        src={Util.getCompetitionLogo(
                          spotlight.competition.tier.slug,
                          spotlight.competition.federation.slug,
                        )}
                      />
                      <header>
                        <h3>{spotlight.competition.tier.league.name}</h3>
                        <h4>{Constants.IdiomaticTier[spotlight.competition.tier.slug]}</h4>
                        <h5>
                          {spotlight.competition.tier.groupSize
                            ? `${t('shared.matchday')} ${spotlight.round}`
                            : Util.parseCupRounds(spotlight.round, spotlight.totalRounds)}
                        </h5>
                      </header>
                    </aside>
                    <aside className="grid grid-cols-2 place-items-center">
                      {standings.competitors.map((competitor) => (
                        <header
                          key={`${competitor.id}__cup_splotlight_header`}
                          className="heading w-full border-y-0! py-2! text-center"
                        >
                          <p>{competitor.team.name}</p>
                        </header>
                      ))}
                    </aside>
                    <aside className="grid grid-cols-2 place-items-center pb-2">
                      {standings.competitors.map((competitor) => (
                        <figure key={`${competitor.id}__cup_splotlight`} className="center">
                          <Image
                            title={competitor.team.name}
                            src={competitor.team.blazon}
                            className="size-32"
                          />
                        </figure>
                      ))}
                    </aside>
                    <aside className="text-center">
                      <button
                        className="btn btn-block rounded-none border-x-0"
                        onClick={() => {
                          api.window.send<ModalRequest>(Constants.WindowIdentifier.Modal, {
                            target: '/brackets',
                            payload: standings.competitionId,
                          });
                        }}
                      >
                        {t('main.dashboard.viewBracket')}
                      </button>
                    </aside>
                  </article>
                );
              })()}
          </section>
        </div>

        {/** RIGHT COLUMN */}
        <div className="stack-y gap-0!">
          <section className="divide-base-content/10 grid grid-cols-6 divide-x">
            <button
              title={t('main.dashboard.advanceCalendar')}
              className="day day-btn border-t-0"
              disabled={!state.profile || state.working || isMatchday}
              onClick={() => !state.working && !isMatchday && dispatch(calendarAdvance())}
            >
              <figure>
                <FaForward />
              </figure>
            </button>
            {!state.profile &&
              [...Array(5)].map((_, idx) => (
                <article
                  key={`${idx}__calendar_loading`}
                  className="day h-32 items-center justify-center border-t-0"
                >
                  <span className="loading loading-spinner loading-sm" />
                </article>
              ))}
            {!!state.profile &&
              [...Array(5)].map((_, idx) => {
                const today = addDays(state.profile.date, idx);
                const isActive = idx === 0;
                const entry = upcoming.find(
                  (match) => match.date.toISOString() === today.toISOString(),
                );
                const opponent = entry?.competitors?.find(
                  (competitor) => competitor.teamId !== state.profile.teamId,
                );

                return (
                  <article
                    key={`${idx}__calendar`}
                    className={cx('day border-t-0', isActive && 'day-active')}
                  >
                    <figure>
                      {isActive && (
                        <React.Fragment>
                          <p>{format(today, 'MMM')}</p>
                          <p>{format(today, 'y')}</p>
                        </React.Fragment>
                      )}
                      {!isActive && opponent && (
                        <img src={opponent.team.blazon} title={opponent.team.name} />
                      )}
                      {!isActive && !opponent && <FaCloudMoon />}
                    </figure>
                    <aside>
                      <h2>{format(today, 'd')}</h2>
                      <p>
                        {isActive && format(today, 'E')}
                        {!isActive && opponent && t('main.dashboard.match')}
                        {!isActive && !opponent && t('main.dashboard.rest')}
                      </p>
                    </aside>
                  </article>
                );
              })}
          </section>
          {(() => {
            // placeholder while things are loading
            // or if there are no matches
            if (!spotlight) {
              return (
                <section className="card image-full card-sm h-80 flex-grow rounded-none before:rounded-none! before:opacity-50!">
                  <figure>
                    <Image
                      className="h-full w-full"
                      src={Util.convertMapPool('de_dust2', Constants.Game.CSGO, true)}
                    />
                  </figure>
                  <article className="card-body items-center justify-center">
                    {t('main.dashboard.noMatch')}
                  </article>
                </section>
              );
            }

            // the suffix is either the current position
            // or their league tier if it's a cup
            const disabled = state.working || !isMatchday;
            const [home, away] = spotlight.competitors;
            const [homeHistorial, awayHistorial] = matchHistorial;
            const [homeSuffix, awaySuffix] = [home, away].map((competitor) => {
              if (!spotlight.competition.tier.groupSize) {
                return Constants.IdiomaticTier[Constants.Prestige[competitor.team.tier]];
              }

              return Util.toOrdinalSuffix(
                userGroupCompetitors.findIndex((a) => a.teamId === competitor.teamId) + 1,
              );
            });

            return (
              <section className="card image-full card-sm h-80 flex-grow rounded-none before:rounded-none!">
                <figure>
                  <Image
                    className="h-full w-full"
                    src={Util.convertMapPool(spotlight.games[0].map, settings.general.game, true)}
                  />
                </figure>
                <article className="card-body">
                  <header className="grid h-full grid-cols-3 place-items-center">
                    <aside className="stack-y items-center">
                      <img src={home.team.blazon} className="size-32" />
                      <Historial matches={homeHistorial} teamId={home.teamId} />
                      <div className="text-center">
                        <p>{home.team.name}</p>
                        <p>
                          <small>{homeSuffix}</small>
                        </p>
                      </div>
                    </aside>
                    <aside className="center h-full gap-4">
                      <Image
                        title={`${spotlight.competition.tier.league.name}: ${Constants.IdiomaticTier[spotlight.competition.tier.slug]}`}
                        className="size-24"
                        src={Util.getCompetitionLogo(
                          spotlight.competition.tier.slug,
                          spotlight.competition.federation.slug,
                        )}
                      />
                      <p>
                        <em>{format(spotlight.date, 'PPPP')}</em>
                      </p>
                      <ul>
                        <li className="stack-x items-center">
                          <FaMapSigns />
                          <span>
                            {Util.convertMapPool(spotlight.games[0].map, settings.general.game)}
                          </span>
                        </li>
                        <li className="stack-x items-center">
                          <FaCalendarDay />
                          <span>
                            {spotlight.competition.tier.groupSize
                              ? `${t('shared.matchday')} ${spotlight.round}`
                              : Util.parseCupRounds(spotlight.round, spotlight.totalRounds)}
                          </span>
                        </li>
                        <li className="stack-x items-center">
                          <FaStream />
                          <span>
                            {t('shared.bestOf')}&nbsp;
                            {spotlight.games.length}
                          </span>
                        </li>
                      </ul>
                    </aside>
                    <aside className="stack-y items-center">
                      <img src={away.team.blazon} className="size-32" />
                      <Historial matches={awayHistorial} teamId={away.teamId} />
                      <div className="text-center">
                        <p>{away.team.name}</p>
                        <p>
                          <small>{awaySuffix}</small>
                        </p>
                      </div>
                    </aside>
                  </header>
                  <footer className="join justify-center">
                    <button
                      title={t('main.dashboard.matchSetup')}
                      className="btn join-item"
                      disabled={disabled || !!state.appStatus}
                      onClick={() =>
                        api.window.send<ModalRequest>(Constants.WindowIdentifier.Modal, {
                          target: '/pregame',
                          payload: spotlight.id,
                        })
                      }
                    >
                      <FaCog />
                    </button>
                    <button
                      className="btn btn-primary join-item btn-wide"
                      disabled={disabled || !!state.appStatus}
                      onClick={() => {
                        if (spotlight.games.length > 1) {
                          return api.window.send<ModalRequest>(Constants.WindowIdentifier.Modal, {
                            target:
                              spotlight.status === Constants.MatchStatus.PLAYING
                                ? '/postgame'
                                : '/play',
                            payload: spotlight.id,
                          });
                        }
                        dispatch(play());
                      }}
                    >
                      {t('main.dashboard.play')}
                    </button>
                    <button
                      className="btn join-item btn-wide"
                      disabled={disabled}
                      onClick={() => api.calendar.sim().then(() => dispatch(calendarAdvance(1)))}
                    >
                      {t('main.dashboard.simulate')}
                    </button>
                    <button
                      title={t('main.dashboard.spectateMatch')}
                      className="btn btn-secondary join-item"
                      disabled={disabled || !!state.appStatus}
                      onClick={() => dispatch(play())}
                    >
                      <FaTv />
                    </button>
                  </footer>
                </article>
              </section>
            );
          })()}
          <section className="divide-base-content/10 grid grid-cols-2 divide-x">
            {((!!spotlight && spotlight.competitors) || [...Array(2)]).map(
              (competitor, competitorIdx) => {
                const matches = competitor ? matchHistorial[competitorIdx] : [];
                const previousFiller = [...Array(Math.max(0, NUM_PREVIOUS - matches.length))];
                return (
                  <article
                    key={`${competitor?.id}_${competitorIdx}__match_previous`}
                    className="stack-y gap-0!"
                  >
                    <header className="prose">
                      <h4 className="truncate">
                        {competitor?.team?.name ? `${competitor.team.name}'s` : ''}&nbsp;
                        {t('main.dashboard.headerRecentMatches')}
                      </h4>
                    </header>
                    <table className="table table-fixed">
                      <tbody>
                        {!!matches.length &&
                          matches.slice(0, NUM_PREVIOUS).map((match) => {
                            const opponent = match.competitors.find(
                              (c) => c.teamId !== competitor.teamId,
                            );
                            const result = match.competitors.find(
                              (c) => c.teamId === competitor.teamId,
                            )?.result;
                            const onClick =
                              match._count.events > 0
                                ? () =>
                                    api.window.send<ModalRequest>(
                                      Constants.WindowIdentifier.Modal,
                                      {
                                        target: '/postgame',
                                        payload: match.id,
                                      },
                                    )
                                : null;

                            return (
                              <tr
                                key={`${match.id}__match_previous`}
                                onClick={onClick}
                                className={cx(onClick && 'hover:bg-base-content/10 cursor-pointer')}
                              >
                                <td
                                  className={cx('w-1/12', !onClick && 'text-muted')}
                                  title={
                                    onClick
                                      ? t('shared.viewMatchDetails')
                                      : t('shared.noMatchDetails')
                                  }
                                >
                                  <FaChartBar />
                                </td>
                                <td className="w-1/12" title={format(match.date, 'PPPP')}>
                                  {format(match.date, 'MM/dd')}
                                </td>
                                <td
                                  className={cx(
                                    'w-3/12 text-center',
                                    Util.getResultTextColor(result),
                                  )}
                                >
                                  {match.competitors
                                    .map((competitor) => competitor.score)
                                    .join(' : ') || '-'}
                                </td>
                                <td className="w-4/12 truncate" title={opponent?.team.name || '-'}>
                                  {!!opponent?.team && (
                                    <img
                                      className="mr-2 inline-block size-4"
                                      src={
                                        opponent?.team.blazon || 'resources://blazonry/009400.png'
                                      }
                                    />
                                  )}
                                  <span>{opponent?.team.name || 'BYE'}</span>
                                </td>
                                <td
                                  className="w-3/12 truncate"
                                  title={`${match.competition.tier.league.name}: ${Constants.IdiomaticTier[match.competition.tier.slug]}`}
                                >
                                  {Constants.IdiomaticTier[match.competition.tier.slug]}
                                </td>
                              </tr>
                            );
                          })}
                        {previousFiller.map((_, idx) => (
                          <tr key={`${idx}__filler_match_previous`} className="text-muted">
                            <td className="w-1/12">
                              {state.profile
                                ? format(
                                    addDays(
                                      !matches.length
                                        ? state.profile.date
                                        : matches.slice(-1)[0].date,
                                      idx - 1,
                                    ),
                                    'MM/dd',
                                  )
                                : '-'}
                            </td>
                            <td className="w-4/12 text-center">-</td>
                            <td className="w-4/12">{t('shared.noRecentMatch')}</td>
                            <td className="w-3/12">-</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </article>
                );
              },
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
