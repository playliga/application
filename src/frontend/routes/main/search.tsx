/**
 * Search the player database.
 *
 * @module
 */
import React from 'react';
import cx from 'classnames';
import { random, set } from 'lodash';
import { Constants, Eagers, Util } from '@liga/shared';
import { AppStateContext } from '@liga/frontend/redux';
import { FaSortAmountDown, FaSortAmountDownAlt } from 'react-icons/fa';
import {
  CountrySelect,
  findCountryOptionByValue,
  findTeamOptionByValue,
  TeamSelect,
} from '@liga/frontend/components/select';

/** @constant */
const PAGE_SIZE = 100;

/** @constant */
const NUM_COLUMNS = 6;

/**
 * @param path The sorting property.
 * @param value The sorting value.
 * @function
 */
function parseSortingDirection(path: string, value: unknown) {
  let direction: string | null;

  switch (value) {
    case 'asc':
      direction = 'desc';
      break;
    case 'desc':
      return null;
    default:
      direction = 'asc';
  }

  return set({}, path, direction);
}

/**
 * Builds team query from provided filters.
 *
 * @param federationId    Limit search to a specific federation.
 * @param countryId       Limit search to a specific country.
 * @param tier            Limit search to a specific tier.
 * @function
 */
function buildTeamQuery(
  federationId?: number,
  countryId?: number,
  tier?: number,
): Parameters<typeof api.teams.all>[number] {
  return {
    where: {
      ...(Number.isInteger(tier) ? { tier } : {}),
      country: {
        ...(countryId ? { id: countryId } : {}),
        ...(federationId
          ? {
              continent: {
                federationId,
              },
            }
          : {}),
      },
    },
  };
}

/**
 * Builds player query from provided filters.
 *
 * @param federationId    Limit search to a specific federation.
 * @param countryId       Limit search to a specific country.
 * @param teamId          Limit search to a specific team.
 * @param tier            Limit search to a specific tier.
 * @param transferListed  Whether to search for only transfer listed players.
 * @param orderBy         Sorting direction.
 * @function
 */
function buildPlayerQuery(
  federationId?: number,
  countryId?: number,
  teamId?: number,
  tier?: number,
  transferListed?: boolean,
  orderBy?: ExtractBaseType<Parameters<typeof api.players.all>[number]['orderBy']>,
): Parameters<typeof api.players.all>[number] {
  return {
    ...(orderBy ? { orderBy } : {}),
    where: {
      ...(transferListed ? { transferListed } : {}),
      country: {
        ...(countryId ? { id: countryId } : {}),
        ...(federationId
          ? {
              continent: {
                federationId,
              },
            }
          : {}),
      },
      team: {
        ...(Number.isInteger(tier) ? { tier } : {}),
        ...(teamId ? { id: teamId } : {}),
      },
    },
  };
}

/**
 * Exports this module.
 *
 * @exports
 */
export default function () {
  const { state } = React.useContext(AppStateContext);
  const [numPlayers, setNumPlayers] = React.useState(0);
  const [numPage, setNumPage] = React.useState(1);
  const [federations, setFederations] = React.useState<
    Awaited<ReturnType<typeof api.federations.all>>
  >([]);
  const [teams, setTeams] = React.useState<Awaited<ReturnType<typeof api.teams.all>>>([]);
  const [players, setPlayers] = React.useState<
    Awaited<ReturnType<typeof api.players.all<typeof Eagers.player>>>
  >([]);
  const [working, setWorking] = React.useState(false);
  const [selectedFederationId, setSelectedFederationId] = React.useState<number>();
  const [selectedCountry, setSelectedCountry] =
    React.useState<ReturnType<typeof findCountryOptionByValue>>();
  const [selectedTierId, setSelectedTierId] = React.useState<number>();
  const [selectedTransferStatus, setSelectedTransferStatus] = React.useState<boolean>();
  const [selectedTeam, setSelectedTeam] =
    React.useState<ReturnType<typeof findTeamOptionByValue>>();
  const [selectedPlayerOrderBy, setSelectedPlayerOrderBy] = React.useState<
    ExtractBaseType<Parameters<typeof api.players.all>[number]['orderBy']>
  >({});

  // build query information
  const totalPages = React.useMemo(() => Math.ceil(numPlayers / PAGE_SIZE), [numPlayers]);
  const teamQuery = React.useMemo(
    () => buildTeamQuery(selectedFederationId, selectedCountry?.id, selectedTierId),
    [selectedFederationId, selectedCountry, selectedTierId],
  );
  const playerQuery = React.useMemo(
    () =>
      buildPlayerQuery(
        selectedFederationId,
        selectedCountry?.id,
        selectedTeam?.id,
        selectedTierId,
        selectedTransferStatus,
        selectedPlayerOrderBy,
      ),
    [
      selectedFederationId,
      selectedCountry,
      selectedTeam,
      selectedTierId,
      selectedTransferStatus,
      selectedPlayerOrderBy,
    ],
  );

  // resets the page to a random negative number
  // in order to trigger a new player data fetch
  const triggerPlayerFetch = () => setNumPage(-random(255));

  // initial data fetch
  React.useEffect(() => {
    api.federations.all().then(setFederations);
    api.teams.all().then(setTeams);
    api.players.count(playerQuery.where).then(setNumPlayers);
  }, []);

  // reset country selection when federation changes
  React.useEffect(() => {
    setSelectedCountry(null);
  }, [selectedFederationId]);

  // reset team selection when any of these filters change
  React.useEffect(() => {
    setSelectedTeam(null);
  }, [selectedFederationId, selectedCountry, selectedTierId]);

  // reset page when changing sorting direction
  React.useEffect(triggerPlayerFetch, [selectedPlayerOrderBy]);

  // apply team filters
  React.useEffect(() => {
    api.teams.all(teamQuery).then(setTeams);
  }, [selectedFederationId, selectedCountry]);

  // apply player filters
  React.useEffect(() => {
    setWorking(true);
    api.players.count(playerQuery.where).then(setNumPlayers);
    api.players
      .all({
        ...playerQuery,
        take: PAGE_SIZE,
        skip: PAGE_SIZE * ((numPage <= 0 ? 1 : numPage) - 1),
        include: Eagers.player.include,
      })
      .then((result) => Promise.resolve(setPlayers(result)))
      .then(() => setWorking(false));
  }, [numPage]);

  // massage country data to country selector data structure
  const countrySelectorData = React.useMemo(
    () =>
      state.continents
        .filter((continent) =>
          selectedFederationId ? continent.federationId === selectedFederationId : true,
        )
        .map((continent) => ({
          label: continent.name,
          options: continent.countries.map((country) => ({
            ...country,
            value: country.id,
            label: country.name,
          })),
        })),
    [state.continents, selectedFederationId],
  );

  // massage team data to team selector data structure
  const teamSelectorData = React.useMemo(
    () =>
      Constants.Prestige.filter((_, prestigeIdx) =>
        Number.isInteger(selectedTierId) ? prestigeIdx === selectedTierId : true,
      ).map((prestige) => ({
        label: Constants.IdiomaticTier[prestige],
        options: teams
          .filter((team) => team.tier === Constants.Prestige.findIndex((tier) => tier === prestige))
          .map((team) => ({
            ...team,
            value: team.id,
            label: team.name,
          })),
      })),
    [teams, selectedTierId],
  );

  // quick hack to bypass row height behavior where they
  // try to fill in the remaining height of the table
  const filler = React.useMemo(
    () =>
      players.length < PAGE_SIZE
        ? [...Array(PAGE_SIZE - players.length - 1)].map((_, idx) => idx)
        : [],
    [players],
  );

  return (
    <div className="dashboard">
      <main>
        <form className="form-ios col-2">
          <fieldset>
            <legend className="!border-t-0">Filters</legend>
            <section>
              <header>
                <h3>Federation</h3>
              </header>
              <article>
                <select
                  className="select w-full"
                  onChange={(event) => setSelectedFederationId(Number(event.target.value))}
                  value={selectedFederationId}
                >
                  <option value="">Any</option>
                  {federations
                    .filter(
                      (federation) => federation.slug !== Constants.FederationSlug.ESPORTS_WORLD,
                    )
                    .map((federation) => (
                      <option key={federation.id} value={federation.id}>
                        {federation.name}
                      </option>
                    ))}
                </select>
              </article>
            </section>
            <section>
              <header>
                <h3>Country</h3>
              </header>
              <article>
                <CountrySelect
                  className="w-full"
                  backgroundColor="oklch(var(--b2))"
                  borderColor="transparent"
                  options={countrySelectorData}
                  value={selectedCountry}
                  onChange={(option) =>
                    setSelectedCountry(findCountryOptionByValue(countrySelectorData, option.value))
                  }
                />
              </article>
            </section>
            <section>
              <header>
                <h3>Tier/Prestige</h3>
              </header>
              <article>
                <select
                  className="select w-full"
                  onChange={(event) => setSelectedTierId(Number(event.target.value))}
                  value={selectedTierId}
                >
                  <option value="">Any</option>
                  {Constants.Prestige.map((prestige, prestigeId) => (
                    <option key={prestige} value={prestigeId}>
                      {Constants.IdiomaticTier[prestige]}
                    </option>
                  ))}
                </select>
              </article>
            </section>
            <section>
              <header>
                <h3>Team</h3>
              </header>
              <article>
                <TeamSelect
                  className="w-full"
                  backgroundColor="oklch(var(--b2))"
                  borderColor="transparent"
                  options={teamSelectorData}
                  value={selectedTeam}
                  onChange={(option) =>
                    setSelectedTeam(findTeamOptionByValue(teamSelectorData, option.value))
                  }
                />
              </article>
            </section>
            <section>
              <header>
                <h3>Transfer Status</h3>
              </header>
              <article>
                <select
                  className="select w-full"
                  onChange={(event) => setSelectedTransferStatus(Boolean(event.target.value))}
                  value={String(selectedTransferStatus)}
                >
                  <option value="">Any</option>
                  <option value="true">Transfer Listed</option>
                </select>
              </article>
            </section>
          </fieldset>
          <fieldset>
            <section>
              <button
                type="button"
                className="btn btn-primary rounded-none"
                onClick={triggerPlayerFetch}
              >
                Apply
              </button>
              <button
                type="button"
                className="btn rounded-none"
                onClick={() => {
                  setSelectedCountry(null);
                  setSelectedFederationId('' as unknown as number);
                  setSelectedTierId('' as unknown as number);
                  setSelectedTransferStatus(null);
                  setSelectedTeam(null);
                }}
              >
                Reset Filters
              </button>
            </section>
          </fieldset>
        </form>
        <section>
          <table className="table table-pin-rows table-xs h-full table-fixed">
            <thead>
              <tr>
                <th>Name</th>
                <th>Team</th>
                <th
                  className="cursor-pointer hover:bg-base-300"
                  onClick={() =>
                    setSelectedPlayerOrderBy(
                      parseSortingDirection('team.tier', selectedPlayerOrderBy?.team?.tier),
                    )
                  }
                >
                  <header className="flex items-center justify-center gap-2">
                    Tier
                    <span className={cx(selectedPlayerOrderBy?.team?.tier && 'text-primary')}>
                      {selectedPlayerOrderBy?.team?.tier === 'desc' ? (
                        <FaSortAmountDown />
                      ) : (
                        <FaSortAmountDownAlt />
                      )}
                    </span>
                  </header>
                </th>
                <th
                  className="cursor-pointer hover:bg-base-300"
                  onClick={() =>
                    setSelectedPlayerOrderBy(
                      parseSortingDirection('cost', selectedPlayerOrderBy?.cost),
                    )
                  }
                >
                  <header className="flex items-center justify-center gap-2">
                    Cost
                    <span className={cx(selectedPlayerOrderBy?.cost && 'text-primary')}>
                      {selectedPlayerOrderBy?.cost === 'desc' ? (
                        <FaSortAmountDown />
                      ) : (
                        <FaSortAmountDownAlt />
                      )}
                    </span>
                  </header>
                </th>
                <th
                  className="cursor-pointer hover:bg-base-300"
                  onClick={() =>
                    setSelectedPlayerOrderBy(
                      parseSortingDirection('wages', selectedPlayerOrderBy?.wages),
                    )
                  }
                >
                  <header className="flex items-center justify-center gap-2">
                    Wages
                    <span className={cx(selectedPlayerOrderBy?.wages && 'text-primary')}>
                      {selectedPlayerOrderBy?.wages === 'desc' ? (
                        <FaSortAmountDown />
                      ) : (
                        <FaSortAmountDownAlt />
                      )}
                    </span>
                  </header>
                </th>
                <th className="text-center">Transfer Listed</th>
              </tr>
            </thead>
            <tbody>
              {!!working && (
                <tr>
                  <td colSpan={NUM_COLUMNS} className="text-center">
                    <span className="loading loading-bars loading-lg" />
                  </td>
                </tr>
              )}
              {!working &&
                players.map((player) => (
                  <tr key={player.name}>
                    <td>
                      <span className={cx('fp', 'mr-2', player.country.code.toLowerCase())} />
                      <span>{player.name}</span>
                    </td>
                    <td>
                      {!!player.team && (
                        <>
                          <img
                            src={`resources://blazonry/${player.team.blazon}`}
                            className="mr-2 inline-block size-4"
                          />
                          <span>{player.team.name}</span>
                        </>
                      )}
                    </td>
                    <td className="text-center">
                      {!!player.team &&
                        Constants.IdiomaticTier[Constants.Prestige[player.team.tier]]}
                    </td>
                    <td className="text-center">{Util.formatCurrency(player.cost)}</td>
                    <td className="text-center">{Util.formatCurrency(player.wages)}/wk</td>
                    <td className="text-center">{player.transferListed ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              {!working &&
                !!filler.length &&
                filler.map((_, idx) => (
                  <tr key={`${idx}__filler`}>
                    <td colSpan={NUM_COLUMNS}>&nbsp;</td>
                  </tr>
                ))}
            </tbody>
            <tfoot>
              <tr>
                <th colSpan={NUM_COLUMNS - 1} className="join !table-cell p-0">
                  {[...Array(totalPages)].map((_, idx) => (
                    <button
                      key={`${idx}__pagination`}
                      className={cx(
                        'btn join-item btn-xs',
                        (numPage <= 0 ? 1 : numPage) === idx + 1 && 'btn-active',
                      )}
                      onClick={() => setNumPage(idx + 1)}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </th>
                <th className="text-right font-mono">{numPlayers} Results</th>
              </tr>
            </tfoot>
          </table>
        </section>
      </main>
    </div>
  );
}
