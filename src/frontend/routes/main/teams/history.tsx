/**
 * Team trophy case and competition history route.
 *
 * @module
 */
import React from 'react';
import cx from 'classnames';
import { useOutletContext } from 'react-router-dom';
import { countBy } from 'lodash';
import { Chart, ChartConfiguration } from 'chart.js/auto';
import { Constants, Eagers, Util } from '@liga/shared';
import { AppStateContext } from '@liga/frontend/redux';

/** @constant */
const CHART_CONFIG: Pick<ChartConfiguration<'line'>, 'type' | 'options'> = {
  type: 'line',
  options: {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    responsive: true,
    scales: {
      x: {
        border: {
          dash: [5, 5],
          display: false,
        },
        offset: true,
      },
      y: {
        beginAtZero: true,
        border: {
          dash: [5, 5],
          display: false,
        },
        max: Constants.Prestige.length - 1,
        min: 0,
        offset: true,
        ticks: {
          callback: (value: number) => {
            const tierName = Constants.IdiomaticTier[Constants.Prestige[value]];
            return tierName?.replace(/division/i, '');
          },
        },
      },
    },
  },
};

/**
 * Finds the domestic league division the team
 * was competing in by the provided season.
 *
 * @param competitions  The competitions data.
 * @param season        The season.
 */
function findSeasonDivision(
  competitions: Awaited<ReturnType<typeof api.competitions.all<typeof Eagers.competition>>>,
  season: number,
) {
  const competition = competitions.find(
    (competition) =>
      competition.season === season &&
      competition.tier.league.slug === Constants.LeagueSlug.ESPORTS_LEAGUE,
  );

  if (!competition) {
    return;
  }

  return competition.tier.slug;
}

/**
 * Builds the dataset for the line chart.
 *
 * @param seasons       The seasons.
 * @param competitions  The competitions.
 * @param team          The team.
 * @functon
 */
function buildChartDataset(
  seasons: undefined[],
  competitions: Awaited<ReturnType<typeof api.competitions.all<typeof Eagers.competition>>>,
  team: RouteContextTeams['team'],
) {
  return seasons.map((_, idx) =>
    Constants.Prestige.findIndex((prestige) => {
      const division = findSeasonDivision(competitions, idx + 1);

      // if nothing was found, try to default
      // to the team's current division
      if (!division) {
        return prestige === Constants.Prestige[team.tier];
      }

      return prestige === division;
    }),
  );
}

/**
 * Exports this module.
 *
 * @exports
 */
export default function () {
  const { state } = React.useContext(AppStateContext);
  const { team } = useOutletContext<RouteContextTeams>();
  const [competitions, setCompetitions] =
    React.useState<Awaited<ReturnType<typeof api.competitions.all<typeof Eagers.competition>>>>();
  const [selectedSeasonId, setSelectedSeasonId] = React.useState<number>(-1);
  const refCanvas = React.useRef<HTMLCanvasElement>();

  // grab team competition results
  React.useEffect(() => {
    api.competitions
      .all({
        ...Eagers.competition,
        where: {
          competitors: {
            some: {
              teamId: team.id,
            },
          },
          started: true,
        },
        orderBy: {
          season: 'desc',
        },
      })
      .then(setCompetitions);
  }, [team]);

  // grab team honors
  const honors = React.useMemo(() => {
    if (!competitions) {
      return {};
    }

    const awards = Constants.Awards.filter(
      (award) => award.type === Constants.AwardType.CHAMPION,
    ).map((award) => award.target);

    const found = competitions.filter(
      (competition) =>
        awards.includes(competition.tier.slug as Constants.TierSlug) &&
        competition.competitors.some(
          (competitor) => competitor.teamId === team.id && competitor.position === 1,
        ),
    );

    return countBy(found, (competition) => competition.tier.slug);
  }, [competitions]);

  // build seasons dropdown data and select
  // the latest season by default
  const seasons = React.useMemo(() => [...Array(state?.profile?.season || 0)], [state.profile]);

  React.useEffect(() => {
    if (!seasons.length || selectedSeasonId > 0) {
      return;
    }

    setSelectedSeasonId(seasons.length);
  }, [seasons]);

  // build the line graph
  React.useEffect(() => {
    if (!refCanvas.current) {
      return;
    }

    const chart = new Chart(refCanvas.current, {
      ...CHART_CONFIG,
      data: {
        labels: seasons.map((_, idx) => 'S' + (idx + 1)),
        datasets: [
          {
            borderWidth: 2,
            data: buildChartDataset(seasons, competitions, team),
            tension: 0.0,
          },
        ],
      },
    });

    return () => chart.destroy();
  }, [competitions]);

  if (!competitions) {
    return (
      <section className="center h-full">
        <span className="loading loading-bars" />
      </section>
    );
  }

  return (
    <section className="flex flex-col !overflow-y-hidden">
      <article className="flex h-2/5 flex-col">
        <header className="heading prose max-w-none !border-t-0">
          <h2>Honors</h2>
        </header>
        <aside className="grid h-0 flex-grow grid-cols-8 place-content-center place-items-baseline gap-4">
          {!Object.keys(honors).length && (
            <footer className="col-span-8 flex h-full w-full flex-col items-center justify-center text-center">
              <p>It's looking a bit empty here!</p>
              {team.id === state.profile.teamId && (
                <p>Start stacking up those trophies—your collection awaits!</p>
              )}
              {team.id !== state.profile.teamId && (
                <p>
                  <strong>{team.name}</strong> has not won anything... yet.
                </p>
              )}
            </footer>
          )}
          {Object.keys(honors).map((tierSlug) => (
            <aside
              key={tierSlug + '__award'}
              className="flex flex-col items-center text-center"
              title={Constants.IdiomaticTier[tierSlug]}
            >
              <img
                alt={tierSlug}
                src={`resources://trophies/${tierSlug.replace(':', '-')}.svg`}
                className="w-2/3"
              />
              <p className="text-4xl font-bold">{honors[tierSlug]}</p>
              <p className="text-sm">{Constants.IdiomaticTier[tierSlug]}</p>
            </aside>
          ))}
        </aside>
      </article>
      <article className="grid h-0 flex-grow grid-cols-2 divide-x divide-base-content/10">
        <aside className="flex flex-col">
          <header className="heading prose max-w-none !border-t-0">
            <h2>League History</h2>
          </header>
          {seasons.length > 1 && (
            <figure className="relative h-0 flex-grow">
              <canvas id="line" ref={refCanvas} />
            </figure>
          )}
          {seasons.length <= 1 && (
            <figure className="flex h-0 flex-grow flex-col items-center justify-center p-4 text-center">
              {team.id !== state.profile.teamId && (
                <p>Not enough historical data to generate a graph.</p>
              )}
              {team.id === state.profile.teamId && (
                <p>
                  After one more season, there will be enough data to show you a cool graph of your
                  progress!
                </p>
              )}
            </figure>
          )}
        </aside>
        <aside className="flex flex-col">
          <header className="heading prose max-w-none !border-t-0">
            <h2>Competitions</h2>
          </header>
          <select
            className={cx(
              'select w-full border-0 border-b border-base-content/10 bg-base-200',
              'focus:border-0 focus:border-b disabled:bg-base-200 disabled:text-opacity-100',
            )}
            onChange={(event) => setSelectedSeasonId(Number(event.target.value))}
            value={selectedSeasonId}
          >
            {seasons.map((_, idx) => (
              <option key={idx + 1 + '__season'} value={idx + 1}>
                Season {idx + 1} -&nbsp;
                {
                  Constants.IdiomaticTier[
                    findSeasonDivision(competitions, idx + 1) || Constants.Prestige[team.tier]
                  ]
                }
              </option>
            ))}
          </select>
          <footer className="h-0 flex-grow overflow-y-scroll">
            <table className="table table-pin-rows table-fixed">
              <thead>
                <tr>
                  <th>Name</th>
                  <th title="Position" className="w-1/12 text-center">
                    P
                  </th>
                  <th title="Win" className="w-1/12 text-center">
                    W
                  </th>
                  <th title="Loss" className="w-1/12 text-center">
                    L
                  </th>
                  <th title="Draw" className="w-1/12 text-center">
                    D
                  </th>
                  <th title="Total Points" className="w-1/12 text-center">
                    Pts
                  </th>
                </tr>
              </thead>
              <tbody>
                {competitions
                  .filter((competition) => competition.season === selectedSeasonId)
                  .map((competition) => {
                    const competitor = competition.competitors.find(
                      (competitor) => competitor.teamId === team.id,
                    );
                    if (!competitor) {
                      return;
                    }
                    return (
                      <tr key={competition.id + '__competition__' + competitor.id + '__competitor'}>
                        <td
                          className="truncate"
                          title={
                            competition.federation.slug === Constants.FederationSlug.ESPORTS_WORLD
                              ? `${competition.tier.league.name}: ${Constants.IdiomaticTier[competition.tier.slug]}`
                              : `${competition.federation.name}: ${Constants.IdiomaticTier[competition.tier.slug]}`
                          }
                        >
                          {competition.federation.slug === Constants.FederationSlug.ESPORTS_WORLD
                            ? `${competition.tier.league.name}: ${Constants.IdiomaticTier[competition.tier.slug]}`
                            : `${competition.federation.name}: ${Constants.IdiomaticTier[competition.tier.slug]}`}
                        </td>
                        <td className="text-center">{Util.toOrdinalSuffix(competitor.position)}</td>
                        <td className="text-center">{competitor.win}</td>
                        <td className="text-center">{competitor.loss}</td>
                        <td className="text-center">{competitor.draw}</td>
                        <td className="text-center">{competitor.win * 3 + competitor.draw}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </footer>
        </aside>
      </article>
    </section>
  );
}