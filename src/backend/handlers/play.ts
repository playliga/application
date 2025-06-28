/**
 * Play IPC handlers.
 *
 * @module
 */
import log from 'electron-log';
import { ipcMain } from 'electron';
import { flatten, merge } from 'lodash';
import { Bot, Constants, Eagers, Util } from '@liga/shared';
import {
  DatabaseClient,
  Game,
  Scorebot,
  Simulator,
  WindowManager,
  Worldgen,
} from '@liga/backend/lib';

/**
 * Register the IPC event handlers.
 *
 * @function
 */
export default function () {
  ipcMain.handle(Constants.IPCRoute.PLAY_START, async (_, spectating?: boolean) => {
    // grab today's match
    const profile = await DatabaseClient.prisma.profile.findFirst(Eagers.profile);
    const entry = await DatabaseClient.prisma.calendar.findFirst({
      where: {
        date: profile.date,
        type: Constants.CalendarEntry.MATCHDAY_USER,
      },
    });
    const match = await DatabaseClient.prisma.match.findFirst({
      where: {
        id: Number(entry.payload),
      },
      include: Eagers.match.include,
    });

    // minimize main window
    const mainWindow = WindowManager.get(Constants.WindowIdentifier.Main);
    mainWindow.minimize();

    // load on-the-fly settings
    let settingsLocalStorage: string;

    try {
      settingsLocalStorage = await mainWindow.webContents.executeJavaScript(
        'localStorage.getItem("settings");',
      );
    } catch (_) {
      log.warn('Could not load on-the-fly settings.');
    }

    if (settingsLocalStorage) {
      const settingsLocal = JSON.parse(settingsLocalStorage);
      const settingsRemote = Util.loadSettings(profile.settings);
      profile.settings = JSON.stringify(merge({}, settingsRemote, settingsLocal));
    }

    // start the server and play the match
    const gameServer = new Game.Server(profile, match, null, spectating);
    await gameServer.start();

    // game over; collect postgame info
    const [homeScore, awayScore] = gameServer.result.score;
    const [home, away] = match.competitors;
    const gameScore = {
      [home.id]: homeScore,
      [away.id]: awayScore,
    };
    const players = flatten(gameServer.competitors.map((competitor) => competitor.team.players));

    // clean up on-the-fly settings
    if (settingsLocalStorage) {
      try {
        await mainWindow.webContents.executeJavaScript('localStorage.removeItem("settings");');
      } catch (_) {
        log.warn('Could not remove on-the-fly settings.');
      }
    }

    // add the user's team back into the mix
    players.push(profile.player);

    // update the match record and create the match events database entries
    await DatabaseClient.prisma.match.update({
      where: { id: match.id },
      data: {
        status: Constants.MatchStatus.COMPLETED,
        competitors: {
          update: match.competitors.map((competitor) => ({
            where: { id: competitor.id },
            data: {
              score: gameScore[competitor.id],
              result: Simulator.getMatchResult(competitor.id, gameScore),
            },
          })),
        },
        players: {
          connect: players.map((player) => ({ id: player.id })),
        },
        events: {
          create: gameServer.scorebotEvents.map((event) => {
            switch (event.type) {
              case Scorebot.EventIdentifier.PLAYER_ASSISTED: {
                const eventAssisted = event.payload as Scorebot.EventPayloadPlayerAssisted;
                const assist = players.find((player) => player.name === eventAssisted.assist.name);
                const victim = players.find((player) => player.name === eventAssisted.victim.name);
                return {
                  half: eventAssisted.half,
                  payload: JSON.stringify(event),
                  timestamp: eventAssisted.timestamp,
                  assist: {
                    connect: {
                      id: assist?.id || profile.playerId,
                    },
                  },
                  victim: {
                    connect: {
                      id: victim?.id || profile.playerId,
                    },
                  },
                };
              }
              case Scorebot.EventIdentifier.PLAYER_KILLED: {
                const eventKilled = event.payload as Scorebot.EventPayloadPlayerKilled;
                const attacker = players.find(
                  (player) => player.name === eventKilled.attacker.name,
                );
                const victim = players.find((player) => player.name === eventKilled.victim.name);
                return {
                  half: eventKilled.half,
                  headshot: eventKilled.headshot,
                  payload: JSON.stringify(event),
                  timestamp: eventKilled.timestamp,
                  weapon: eventKilled.weapon,
                  attacker: {
                    connect: {
                      id: attacker?.id || profile.playerId,
                    },
                  },
                  victim: {
                    connect: {
                      id: victim?.id || profile.playerId,
                    },
                  },
                };
              }
              default: {
                const eventRoundOver = event.payload as Scorebot.EventPayloadRoundOver;
                // swap the winner depending on the half number
                const winnerIdx = eventRoundOver.half
                  ? 1 - eventRoundOver.winner
                  : eventRoundOver.winner;
                return {
                  half: eventRoundOver.half,
                  payload: JSON.stringify(event),
                  result: eventRoundOver.event,
                  timestamp: eventRoundOver.timestamp,
                  winner: {
                    connect: {
                      id: match.competitors[winnerIdx].id,
                    },
                  },
                };
              }
            }
          }),
        },
      },
    });

    // give training boosts to squad if they won
    const userTeam = match.competitors.find((competitor) => competitor.teamId === profile.teamId);
    const matchResult = Simulator.getMatchResult(userTeam.id, gameScore);

    if (matchResult === Constants.MatchResult.WIN) {
      const bonuses = [
        {
          id: -1,
          type: Constants.BonusType.SERVER,
          name: 'Win Bonus',
          stats: JSON.stringify({ skill: 1, agression: 1, reactionTime: 1, attackDelay: 1 }),
          cost: -1,
          profileId: -1,
        },
      ];
      await DatabaseClient.prisma.$transaction(
        Bot.Exp.trainAll(profile.team.players, bonuses).map((player) =>
          DatabaseClient.prisma.player.update({
            where: { id: player.id },
            data: player.xp,
          }),
        ),
      );
    }

    // check if user won any awards
    await Worldgen.sendUserAward(match.competition);

    // restore window and open the play modal
    mainWindow.restore();
    WindowManager.send(Constants.WindowIdentifier.Modal, {
      target: '/postgame',
      payload: match.id,
    });

    return Promise.resolve();
  });
}
