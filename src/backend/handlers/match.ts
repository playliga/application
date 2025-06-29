/**
 * Match IPC handlers.
 *
 * @module
 */
import Tournament from '@liga/shared/tournament';
import { ipcMain } from 'electron';
import { differenceBy } from 'lodash';
import { Constants, Eagers } from '@liga/shared';
import { DatabaseClient } from '@liga/backend/lib';
import { Prisma } from '@prisma/client';

/**
 * Register the IPC event handlers.
 *
 * @function
 */
export default function () {
  ipcMain.handle(
    Constants.IPCRoute.MATCH_UPDATE_MAP_LIST,
    async (_, id: number, maps: Array<string>) => {
      const match = await DatabaseClient.prisma.match.findFirst({
        ...Eagers.match,
        where: { id },
      });

      // update the tourney object metadata with the map list
      const tournament = Tournament.restore(JSON.parse(match.competition.tournament));
      tournament.$base.findMatch(JSON.parse(match.payload)).data['maps'] = maps;

      // update the match database record with the map list
      return DatabaseClient.prisma.match.update({
        where: { id },
        data: {
          competition: {
            update: {
              tournament: JSON.stringify(tournament.save()),
            },
          },
          games: {
            update: match.games.map((game, gameIdx) => ({
              where: { id: game.id },
              data: {
                map: maps[gameIdx],
                // ensure competitors have been added
                // to the current game in the series
                //
                // @todo: remove after beta
                ...(async () => {
                  const missingTeams = differenceBy(match.competitors, game.teams, 'teamId');

                  if (!missingTeams.length) {
                    return {};
                  }

                  return {
                    create: missingTeams.map((missingTeam) => ({
                      seed: missingTeam.seed,
                      teamId: missingTeam.teamId,
                    })),
                  };
                })(),
              },
            })),
          },
        },
      });
    },
  );
  ipcMain.handle(Constants.IPCRoute.MATCHES_ALL, (_, query: Prisma.MatchFindManyArgs) =>
    DatabaseClient.prisma.match.findMany(query),
  );
  ipcMain.handle(Constants.IPCRoute.MATCHES_COUNT, (_, where?: Prisma.MatchWhereInput) =>
    DatabaseClient.prisma.match.count({ where }),
  );
  ipcMain.handle(
    Constants.IPCRoute.MATCHES_PREVIOUS,
    async (_, query: Partial<Prisma.MatchFindManyArgs> = {}, id: number, limit = 5) => {
      const profile = await DatabaseClient.prisma.profile.findFirst();
      return DatabaseClient.prisma.match.findMany({
        ...query,
        take: limit,
        where: {
          date: {
            lte: profile.date.toISOString(),
          },
          competitors: {
            some: {
              teamId: id,
            },
          },
          status: Constants.MatchStatus.COMPLETED,
        },
        orderBy: {
          date: 'desc',
        },
      });
    },
  );
  ipcMain.handle(
    Constants.IPCRoute.MATCHES_UPCOMING,
    async (_, query: Partial<Prisma.MatchFindManyArgs> = {}, limit = 5) => {
      const profile = await DatabaseClient.prisma.profile.findFirst();
      return DatabaseClient.prisma.match.findMany({
        ...query,
        take: limit,
        where: {
          date: {
            gte: profile.date.toISOString(),
          },
          competitors: {
            some: {
              teamId: profile.teamId,
            },
          },
          status: {
            lt: Constants.MatchStatus.COMPLETED,
          },
        },
        orderBy: {
          date: 'asc',
        },
      });
    },
  );
}
