/**
 * Electron API context bridge functions.
 *
 * @note The shared module can't be imported because this module breaks, for some reason.
 * @see https://www.electronjs.org/docs/latest/tutorial/ipc#ipc-channels
 * @module
 */
import * as Constants from '@liga/shared/constants';
import * as Eagers from '@liga/shared/eagers';
import type AppInfo from 'package.json';
import type { Prisma, Profile, Team, Calendar } from '@prisma/client';
import { ipcRenderer } from 'electron';

/** @type {IPCRendererCallback} */
type IPCRendererCallback = (...args: unknown[]) => void;

/**
 * Exports this module.
 *
 * @exports
 */
export default {
  app: {
    dialog: (parentId: string, options: Electron.OpenDialogOptions) =>
      ipcRenderer.invoke(
        Constants.IPCRoute.APP_DIALOG,
        parentId,
        options,
      ) as Promise<Electron.OpenDialogReturnValue>,
    external: (url: string) => ipcRenderer.invoke(Constants.IPCRoute.APP_EXTERNAL, url),
    info: () => ipcRenderer.invoke(Constants.IPCRoute.APP_INFO) as Promise<typeof AppInfo>,
    issue: (data: unknown) =>
      ipcRenderer.invoke(Constants.IPCRoute.APP_ISSUE, data) as Promise<unknown>,
    status: () => ipcRenderer.invoke(Constants.IPCRoute.APP_STATUS),
  },
  blazonry: {
    all: () => ipcRenderer.invoke(Constants.IPCRoute.BLAZONRY_ALL),
  },
  bonus: {
    all: () =>
      ipcRenderer.invoke(Constants.IPCRoute.BONUS_ALL) as Promise<
        Array<Prisma.BonusGetPayload<unknown>>
      >,
    buy: (id: number) => ipcRenderer.invoke(Constants.IPCRoute.BONUS_BUY, id) as Promise<unknown>,
  },
  calendar: {
    create: (data: Prisma.CalendarCreateInput) =>
      ipcRenderer.invoke(Constants.IPCRoute.CALENDAR_CREATE, data) as Promise<Calendar>,
    sim: () => ipcRenderer.invoke(Constants.IPCRoute.CALENDAR_SIM),
    start: (max?: number) => ipcRenderer.invoke(Constants.IPCRoute.CALENDAR_START, max),
  },
  competitions: {
    all: <T = typeof Eagers.competition>(query: Prisma.CompetitionFindManyArgs) =>
      ipcRenderer.invoke(Constants.IPCRoute.COMPETITIONS_ALL, query) as Promise<
        Array<Prisma.CompetitionGetPayload<T>>
      >,
  },
  continents: {
    all: <T = typeof Eagers.continent>(query: Prisma.ContinentFindManyArgs) =>
      ipcRenderer.invoke(Constants.IPCRoute.CONTINENTS_ALL, query) as Promise<
        Array<Prisma.ContinentGetPayload<T>>
      >,
  },
  database: {
    connect: (id?: string) => ipcRenderer.invoke(Constants.IPCRoute.DATABASE_CONNECT, id),
    disconnect: () => ipcRenderer.invoke(Constants.IPCRoute.DATABASE_DISCONNECT),
  },
  emails: {
    all: <T = typeof Eagers.email>(query: Prisma.EmailFindManyArgs = Eagers.email) =>
      ipcRenderer.invoke(Constants.IPCRoute.EMAILS_ALL, query) as Promise<
        Array<Prisma.EmailGetPayload<T>>
      >,
    delete: (ids: Array<number>) =>
      ipcRenderer.invoke(Constants.IPCRoute.EMAILS_DELETE, ids) as Promise<unknown>,
    updateDialogue: <T = typeof Eagers.email>(query: Prisma.DialogueUpdateArgs) =>
      ipcRenderer.invoke(Constants.IPCRoute.EMAILS_UPDATE_DIALOGUE, query) as Promise<
        Prisma.EmailGetPayload<T>
      >,
    updateMany: <T = typeof Eagers.email>(query: Prisma.EmailUpdateManyArgs) =>
      ipcRenderer.invoke(Constants.IPCRoute.EMAILS_UPDATE_MANY, query) as Promise<
        Array<Prisma.EmailGetPayload<T>>
      >,
  },
  federations: {
    all: <T = unknown>() =>
      ipcRenderer.invoke(Constants.IPCRoute.FEDERATIONS_ALL) as Promise<
        Array<Prisma.FederationGetPayload<T>>
      >,
  },
  ipc: {
    invoke: (route: string, payload: unknown) =>
      ipcRenderer.invoke(route, payload) as Promise<unknown>,
    on: (route: string, cb: IPCRendererCallback) => ipcRenderer.on(route, (_, args) => cb(args)),
  },
  matches: {
    all: <T = typeof Eagers.match>(query: Prisma.MatchFindManyArgs) =>
      ipcRenderer.invoke(Constants.IPCRoute.MATCHES_ALL, query) as Promise<
        Array<Prisma.MatchGetPayload<T>>
      >,
    upcoming: <T = typeof Eagers.match>(
      query?: Partial<Prisma.MatchFindManyArgs>,
      limit?: number,
    ) =>
      ipcRenderer.invoke(Constants.IPCRoute.MATCHES_UPCOMING, query, limit) as Promise<
        Array<Prisma.MatchGetPayload<T>>
      >,
  },
  play: {
    start: () => ipcRenderer.invoke(Constants.IPCRoute.PLAY_START),
  },
  players: {
    all: <T = typeof Eagers.player>(query?: Prisma.PlayerFindManyArgs) =>
      ipcRenderer.invoke(Constants.IPCRoute.PLAYERS_ALL, query) as Promise<
        Array<Prisma.PlayerGetPayload<T>>
      >,
    count: (where?: Prisma.PlayerWhereInput) =>
      ipcRenderer.invoke(Constants.IPCRoute.PLAYERS_COUNT, where) as Promise<number>,
  },
  profiles: {
    create: (data: {
      user?: Partial<Prisma.PlayerGetPayload<unknown>>;
      team?: Partial<Prisma.TeamGetPayload<unknown>>;
      today?: Date;
    }) => ipcRenderer.invoke(Constants.IPCRoute.PROFILES_CREATE, data) as Promise<Profile>,
    current: <T = typeof Eagers.profile>() =>
      ipcRenderer.invoke(Constants.IPCRoute.PROFILES_CURRENT) as Promise<
        Prisma.ProfileGetPayload<T>
      >,
    train: (bonusIds: Array<number>) =>
      ipcRenderer.invoke(Constants.IPCRoute.PROFILES_TRAIN, bonusIds) as Promise<unknown>,
    update: <T = unknown>(query: Prisma.ProfileUpdateArgs) =>
      ipcRenderer.invoke(Constants.IPCRoute.PROFILES_UPDATE, query) as Promise<
        Prisma.ProfileGetPayload<T>
      >,
  },
  saves: {
    all: <T = typeof Eagers.profile>() =>
      ipcRenderer.invoke(Constants.IPCRoute.SAVES_ALL) as Promise<
        Array<Prisma.ProfileGetPayload<T>>
      >,
    create: (id: number) => ipcRenderer.invoke(Constants.IPCRoute.SAVES_CREATE, id),
    delete: (id: number) => ipcRenderer.invoke(Constants.IPCRoute.SAVES_DELETE, id),
  },
  squad: {
    all: <T = typeof Eagers.player>() =>
      ipcRenderer.invoke(Constants.IPCRoute.SQUAD_ALL) as Promise<
        Array<Prisma.PlayerGetPayload<T>>
      >,
    update: <T = typeof Eagers.player>(query: Prisma.PlayerUpdateArgs) =>
      ipcRenderer.invoke(Constants.IPCRoute.SQUAD_UPDATE, query) as Promise<
        Array<Prisma.PlayerGetPayload<T>>
      >,
  },
  teams: {
    all: <T = unknown>(query?: Prisma.TeamFindManyArgs) =>
      ipcRenderer.invoke(Constants.IPCRoute.TEAMS_ALL, query) as Promise<
        Array<Prisma.TeamGetPayload<T>>
      >,
    create: (data: Prisma.TeamCreateInput) =>
      ipcRenderer.invoke(Constants.IPCRoute.TEAMS_CREATE, data) as Promise<Team>,
    update: <T = unknown>(query: Prisma.TeamUpdateArgs) =>
      ipcRenderer.invoke(Constants.IPCRoute.TEAMS_UPDATE, query) as Promise<
        Prisma.TeamGetPayload<T>
      >,
  },
  transfers: {
    accept: (id: number) => ipcRenderer.invoke(Constants.IPCRoute.TRANSFER_ACCEPT, id),
    all: <T = typeof Eagers.transfer>(query: Prisma.TransferFindManyArgs) =>
      ipcRenderer.invoke(Constants.IPCRoute.TRANSFER_ALL, query) as Promise<
        Array<Prisma.TransferGetPayload<T>>
      >,
    create: (
      transfer: Partial<Prisma.TransferCreateInput>,
      offer: Partial<Prisma.OfferCreateInput>,
    ) =>
      ipcRenderer.invoke(Constants.IPCRoute.TRANSFER_CREATE, transfer, offer) as Promise<
        Prisma.TransferGetPayload<typeof Eagers.transfer>
      >,
    reject: (id: number) => ipcRenderer.invoke(Constants.IPCRoute.TRANSFER_REJECT, id),
  },
  updater: {
    install: () => ipcRenderer.send(Constants.IPCRoute.UPDATER_INSTALL),
    start: () => ipcRenderer.send(Constants.IPCRoute.UPDATER_START),
  },
  window: {
    close: (id: string) => ipcRenderer.send(Constants.IPCRoute.WINDOW_CLOSE, id),
    open: (id: string) => ipcRenderer.send(Constants.IPCRoute.WINDOW_OPEN, id),
    send: <T = unknown>(id: string, data: T) =>
      ipcRenderer.send(Constants.IPCRoute.WINDOW_SEND, id, data),
  },
};
