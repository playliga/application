/**
 * Shared constants and enums between main and renderer process.
 *
 * It is important to be careful with not importing any packages
 * specific to either platform as it may cause build failures.
 *
 * @module
 */

/**
 * Generic settings and configuration.
 *
 * @enum
 */
export enum Application {
  CALENDAR_DATE_FORMAT = 'yyyy/MM/dd',
  DATABASE_NAME_FORMAT = 'save_%s.db',
  LOGGING_LEVEL = 'info',
  SQUAD_MIN_LENGTH = 5,
  SEASON_START_DAY = 1,
  SEASON_START_MONTH = 6,
  TRAINING_FREQUENCY = 7,
}

/**
 * Autofill syntax action types.
 *
 * @enum
 */
export enum AutofillAction {
  EXCLUDE = 'exclude',
  FALLBACK = 'fallback',
  INCLUDE = 'include',
}

/**
 * XP bonus types.
 *
 * @enum
 */
export enum BonusType {
  MAP,
  SERVER,
}

/**
 * Upper and lower bracket identifiers.
 *
 * @enum
 */
export enum BracketIdentifier {
  UPPER = 1,
  LOWER = 2,
}

/**
 * Bracket round friendly names.
 *
 * @enum
 */
export enum BracketRoundName {
  RO32 = 'RO32',
  RO16 = 'RO16',
  QF = 'Quarterfinals',
  SF = 'Semifinals',
  GF = 'Grand Final',
}

/**
 * Calendar loop entry types.
 *
 * @enum
 */
export enum CalendarEntry {
  COMPETITION_START = '/competition/start',
  EMAIL_SEND = '/email/send',
  MATCHDAY_NPC = '/matchday/npc',
  MATCHDAY_USER = '/matchday/user',
  SEASON_START = '/season/start',
  TRANSFER_PARSE = '/transfer/parse',
}

/**
 * Calendar units.
 *
 * @enum
 */
export enum CalendarUnit {
  DAY = 'days',
  WEEK = 'weeks',
  MONTH = 'months',
  YEAR = 'years',
}

/**
 * Federation unique identifiers.
 *
 * @enum
 */
export enum FederationSlug {
  ESPORTS_AMERICAS = 'americas',
  ESPORTS_EUROPA = 'europa',
  ESPORTS_WORLD = 'world',
}

/**
 * Game variants.
 *
 * @enum
 */
export enum Game {
  CS16 = 'cs16',
  CSGO = 'csgo',
  CSS = 'cssource',
}

/**
 * League unique identifiers.
 *
 * @enum
 */
export enum LeagueSlug {
  ESPORTS_CIRCUIT = 'esc',
  ESPORTS_LEAGUE = 'esl',
  ESPORTS_LEAGUE_CUP = 'eslc',
  ESPORTS_WORLD_CUP = 'eswc',
}

/**
 * Electron log level.
 *
 * @enum
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  VERBOSE = 'verbose',
  DEBUG = 'debug',
  SILLY = 'silly',
}

/**
 * IPC listener route names.
 *
 * @enum
 */
export enum IPCRoute {
  APP_DIALOG = '/app/dialog',
  APP_INFO = '/app/info',
  APP_STATUS = '/app/status',
  BLAZONRY_ALL = '/blazonry/all',
  BONUS_ALL = '/bonus/all',
  BONUS_BUY = '/bonus/buy',
  CALENDAR_CREATE = '/calendar/create',
  CALENDAR_SIM = '/calendar/sim',
  CALENDAR_START = '/calendar/start',
  CALENDAR_STOP = '/calendar/stop',
  COMPETITIONS_ALL = '/competitions/all',
  CONTINENTS_ALL = '/continents/all',
  DATABASE_CONNECT = '/database/connect',
  DATABASE_DISCONNECT = '/database/disconnect',
  EMAILS_ALL = '/emails/all',
  EMAILS_DELETE = '/emails/delete',
  EMAILS_NEW = '/emails/new',
  EMAILS_UPDATE_DIALOGUE = '/emails/update/dialogue',
  EMAILS_UPDATE_MANY = '/emails/update/many',
  FEDERATIONS_ALL = '/federarions/all',
  MATCHES_ALL = '/matches/all',
  MATCHES_UPCOMING = '/matches/upcoming',
  PLAY_START = '/play/start',
  PLAYERS_ALL = '/players/all',
  PLAYERS_COUNT = '/players/count',
  PROFILES_CREATE = '/profiles/create',
  PROFILES_CURRENT = '/profiles/current',
  PROFILES_TRAIN = '/profiles/train',
  PROFILES_UPDATE = '/profiles/update',
  SAVES_ALL = '/saves/all',
  SAVES_CREATE = '/saves/create',
  SAVES_DELETE = '/saves/delete',
  SQUAD_ALL = '/squad/all',
  SQUAD_UPDATE = '/squad/update',
  TEAMS_ALL = '/teams/all',
  TEAMS_CREATE = '/teams/create',
  TEAMS_UPDATE = '/teams/update',
  TRANSFER_ACCEPT = '/transfer/accept',
  TRANSFER_ALL = '/transfer/all',
  TRANSFER_CREATE = '/transfer/create',
  TRANSFER_REJECT = '/transfer/reject',
  UPDATER_CHECKING = '/updater/checking',
  UPDATER_DOWNLOADING = '/updater/downloading',
  UPDATER_FINISHED = '/updater/finished',
  UPDATER_INSTALL = '/updater/install',
  UPDATER_NO_UPDATE = '/updater/noUpdate',
  UPDATER_START = '/updater/start',
  WINDOW_CLOSE = '/window/close',
  WINDOW_SEND = '/window/send',
  WINDOW_OPEN = '/window/open',
}

/**
 * The possible outcomes for a match between two teams.
 *
 * @enum
 */
export enum MatchResult {
  WIN,
  DRAW,
  LOSS,
}

/**
 * The possible status for a match.
 *
 * @enum
 */
export enum MatchStatus {
  // the two matches leading to this one are not completed yet
  LOCKED,

  // one team is ready and waiting for the other one
  WAITING,

  // both teams are ready to start
  READY,

  // the match is completed
  COMPLETED,
}

/**
 * Persona role names.
 *
 * @enum
 */
export enum PersonaRole {
  ASSISTANT = 'Assistant Manager',
  MANAGER = 'Manager',
}

/**
 * Tier unique identifiers.
 *
 * @enum
 */
export enum TierSlug {
  CIRCUIT_OPEN = 'circuit:open',
  CIRCUIT_CLOSED = 'circuit:closed',
  CIRCUIT_FINALS = 'circuit:finals',
  CIRCUIT_PLAYOFFS = 'circuit:playoffs',
  ESWC_CHALLENGERS = 'eswc:challengers',
  ESWC_LEGENDS = 'eswc:legends',
  ESWC_CHAMPIONS = 'eswc:champions',
  ESWC_PLAYOFFS = 'eswc:playoffs',
  LEAGUE_ADVANCED = 'league:advanced',
  LEAGUE_CUP = 'league:cup',
  LEAGUE_INTERMEDIATE = 'league:intermediate',
  LEAGUE_MAIN = 'league:main',
  LEAGUE_OPEN = 'league:open',
  LEAGUE_PREMIER = 'league:premier',
}

/**
 * Score simulation modes.
 *
 * @enum
 */
export enum SimulationMode {
  DEFAULT = 'default',
  DRAW = 'draw',
  LOSE = 'lose',
  WIN = 'win',
}

/**
 * Theme settings.
 *
 * @enum
 */
export enum ThemeSettings {
  LIGHT = 'corporate',
  DARK = 'business',
}

/**
 * Threading status types.
 *
 * @enum
 */
export enum ThreadingStatus {
  COMPLETED = 'completed',
  FAILED = 'failed',
  RUNNING = 'running',
}

/**
 * Types of threading targets, or functions
 * that will run in their own thread.
 *
 * @enum
 */
export enum ThreadingTarget {
  FIBONACCI = 'fibonacci',
  LISTING = 'listing',
}

/** @enum */
export enum TransferStatus {
  TEAM_ACCEPTED,
  TEAM_PENDING,
  TEAM_REJECTED,
  PLAYER_ACCEPTED,
  PLAYER_PENDING,
  PLAYER_REJECTED,
}

/**
 * Browser Window unique identifier names.
 *
 * @enum
 */
export enum WindowIdentifier {
  Landing = 'landing',
  Main = 'main',
  Modal = 'modal',
  Splash = 'splash',
  Threading = 'threading',
}

/**
 * Promotion and relegation zones.
 *
 * @enum
 */
export enum Zones {
  LEAGUE_PROMOTION_AUTO_START = 1,
  LEAGUE_PROMOTION_AUTO_END = 3,
  LEAGUE_PROMOTION_PLAYOFFS_START = 3,
  LEAGUE_PROMOTION_PLAYOFFS_END = 6,
  LEAGUE_MID_TABLE_START = 4,
  LEAGUE_MID_TABLE_END = 17,
  LEAGUE_RELEGATION_START = 18,
  LEAGUE_RELEGATION_END = 20,
  CIRCUIT_OPEN_PROMOTION_AUTO_START = 1,
  CIRCUIT_OPEN_PROMOTION_AUTO_END = 2,
  CIRCUIT_CLOSED_PROMOTION_AUTO_START = 1,
  CIRCUIT_CLOSED_PROMOTION_AUTO_END = 1,
  CIRCUIT_FINALS_PROMOTION_AUTO_START = 1,
  CIRCUIT_FINALS_PROMOTION_AUTO_END = 2,
  ESWC_CHALLENGERS_PROMOTION_AUTO_START = 1,
  ESWC_CHALLENGERS_PROMOTION_AUTO_END = 2,
  ESWC_LEGENDS_PROMOTION_AUTO_START = 1,
  ESWC_LEGENDS_PROMOTION_AUTO_END = 2,
  ESWC_CHAMPIONS_PROMOTION_AUTO_START = 1,
  ESWC_CHAMPIONS_PROMOTION_AUTO_END = 2,
}

/**
 * Game settings.
 *
 * @constant
 */
export const GameSettings = {
  // general settings
  BOT_VOICEPITCH_MAX: 125,
  BOT_VOICEPITCH_MIN: 80,
  BOT_WEAPONPREFS_PROBABILITY_RIFLE: 3,
  BOT_WEAPONPREFS_PROBABILITY_SNIPER: 1,
  GAMES_BASEDIR: 'games',
  SERVER_CVAR_MAXROUNDS: 30,
  SERVER_CVAR_MAXROUNDS_OT: 6,
  SERVER_CVAR_FREEZETIME: 15,
  SQUAD_STARTERS_NUM: 5,
  STEAM_EXE: 'steam.exe',
  WIN_AWARD_AMOUNT: 100,

  // cs16 settings
  CS16_APPID: 10,
  CS16_BASEDIR: 'steamapps/common/Half-Life',
  CS16_BOT_CONFIG: 'botprofile.db',
  CS16_DLL_BOTS: 'dlls/liga.dll',
  CS16_DLL_METAMOD: 'addons/metamod/dlls/metamod.dll',
  CS16_EXE: 'hl.exe',
  CS16_GAMEDIR: 'cstrike',
  CS16_LOGFILE: 'qconsole.log',
  CS16_MOTD_HTML_FILE: 'motd.html',
  CS16_MOTD_TXT_FILE: 'motd.txt',
  CS16_SERVER_CONFIG_FILE: 'listenserver.cfg',
  CS16_SERVER_WARMUP_CONFIG_FILE: 'liga-warmup.cfg',

  // csgo settings
  CSGO_APPID: 730,
  CSGO_BOT_CONFIG: 'botprofile.db',
  CSGO_BASEDIR: 'steamapps/common/Counter-Strike Global Offensive',
  CSGO_EXE: 'csgo.exe',
  CSGO_GAMEDIR: 'csgo',
  CSGO_LANGUAGE_FILE: 'resource/csgo_english.txt',
  CSGO_LOGFILE: 'logs/liga.log',
  CSGO_SERVER_CONFIG_FILE: 'cfg/listenserver.cfg',

  // cssource settings
  CSSOURCE_APPID: 240,
  CSSOURCE_BASEDIR: 'steamapps/common/Counter-Strike Source',
  CSSOURCE_BOT_CONFIG: 'custom/liga/botprofile.db',
  CSSOURCE_EXE: 'hl2.exe',
  CSSOURCE_GAMEDIR: 'cstrike',
  CSSOURCE_LOGFILE: 'logs/liga.log',
  CSSOURCE_MOTD_HTML_FILE: 'cfg/motd.html',
  CSSOURCE_MOTD_TXT_FILE: 'cfg/motd.txt',
  CSSOURCE_SERVER_CONFIG_FILE: 'cfg/listenserver.cfg',

  // rcon settings
  RCON_MAX_ATTEMPTS: 15,
  RCON_PASSWORD: 'liga',
  RCON_PORT: 27015,
};

/**
 * Idiomatic version of tier names.
 *
 * @constant
 */
export const IdiomaticTier: Record<TierSlug | string, string> = {
  [TierSlug.CIRCUIT_OPEN]: 'Open Qualifiers',
  [TierSlug.CIRCUIT_CLOSED]: 'Closed Qualifiers',
  [TierSlug.CIRCUIT_FINALS]: 'Finals',
  [TierSlug.CIRCUIT_PLAYOFFS]: 'Finals Playoffs',
  [TierSlug.ESWC_CHALLENGERS]: 'Challengers Stage',
  [TierSlug.ESWC_LEGENDS]: 'Legends Stage',
  [TierSlug.ESWC_CHAMPIONS]: 'Champions Stage',
  [TierSlug.ESWC_PLAYOFFS]: 'Champions Stage Playoffs',
  [TierSlug.LEAGUE_OPEN]: 'Open Division',
  [TierSlug.LEAGUE_CUP]: 'Open Cup',
  [TierSlug.LEAGUE_INTERMEDIATE]: 'Intermediate Division',
  [TierSlug.LEAGUE_MAIN]: 'Main Division',
  [TierSlug.LEAGUE_ADVANCED]: 'Advanced Division',
  [TierSlug.LEAGUE_PREMIER]: 'Premier Division',
};

/**
 * Competition map pool.
 *
 * @constant
 */
export const MapPool = [
  'de_dust2',
  'de_inferno',
  'de_mirage',
  'de_nuke',
  'de_overpass',
  'de_train',
  'de_tuscan',
];

/**
 * Replacement maps for game variants.
 *
 * @constant
 */
export const MapPoolReplacements: Record<string, Record<string, string>> = {
  [Game.CS16]: {
    de_mirage: 'de_cpl_strike',
    de_tuscan: 'de_cpl_mill',
    de_overpass: 'de_cpl_fire',
  },
  [Game.CSS]: {
    de_mirage: 'de_cpl_strike',
    de_overpass: 'de_cbble',
  },
};

/**
 * Eligible days of the week for competitions to hold matches.
 *
 * Each day of the week caries its own probability weight.
 * The lower the value the less chance a match will be
 * held on that day of the week.
 *
 * @constant
 */
export const MatchDayWeights: Record<string, Record<number, number | 'auto'>> = {
  [LeagueSlug.ESPORTS_LEAGUE_CUP]: {
    1: 50, // monday
    2: 'auto', // tuesday
  },
  [LeagueSlug.ESPORTS_CIRCUIT]: {
    3: 50, // wednesday
    4: 'auto', // thursday
  },
  [LeagueSlug.ESPORTS_WORLD_CUP]: {
    3: 50, // wednesday
    4: 'auto', // thursday
  },
  [LeagueSlug.ESPORTS_LEAGUE]: {
    5: 20, // friday
    6: 'auto', // saturday
    0: 'auto', // sunday
  },
};

/**
 * Player wages sorted by tiers.
 *
 * Each tier is split into top, mid, and low positions
 * which affects the wages and player costs.
 *
 * @property percent    Percentage considered for the current tier.
 * @property low        Lowest wage possible for this tier.
 * @property high       Highest wage possible for this tier.
 * @property multiplier Player cost is calculated by multiplying the wages by this number.
 * @constant
 */
export const PlayerWages = {
  [TierSlug.LEAGUE_ADVANCED]: [{ percent: 20, low: 1_000, high: 5_000, multiplier: 2 }],
  [TierSlug.LEAGUE_PREMIER]: [
    { percent: 20, low: 5_000, high: 10_000, multiplier: 2 },
    { percent: 80, low: 10_000, high: 15_000, multiplier: 4 },
    { percent: 20, low: 15_000, high: 20_000, multiplier: 6 },
  ],
};

/**
 * Prestige affect probability weights when
 * simulating games and generating scores.
 *
 * The league tiers serve as a good base
 * to determine prestige order.
 *
 * @constant
 */
export const Prestige = [
  TierSlug.LEAGUE_OPEN,
  TierSlug.LEAGUE_INTERMEDIATE,
  TierSlug.LEAGUE_MAIN,
  TierSlug.LEAGUE_ADVANCED,
  TierSlug.LEAGUE_PREMIER,
];

/**
 * Settings for the application and their defaults.
 *
 * @constant
 */
export const Settings = {
  general: {
    game: Game.CS16,
    logLevel: Application.LOGGING_LEVEL,
    simulationMode: SimulationMode.DEFAULT,
    steamPath: null as string,
  },
  calendar: {
    ignoreExits: false,
    maxIterations: 15,
    unit: CalendarUnit.DAY,
  },
  matchRules: {
    mapOverride: null as string,
    maxRounds: 6,
    freezeTime: 7,
  },
};

/**
 * Promotion and relegation zones per tier.
 *
 * @constant
 */
export const TierZones: Record<string | 'default', number[][]> = {
  default: [
    [Zones.LEAGUE_PROMOTION_AUTO_START, Zones.LEAGUE_PROMOTION_AUTO_END],
    [Zones.LEAGUE_PROMOTION_PLAYOFFS_START, Zones.LEAGUE_PROMOTION_PLAYOFFS_END],
    [Zones.LEAGUE_RELEGATION_START, Zones.LEAGUE_RELEGATION_END],
  ],
  [TierSlug.CIRCUIT_OPEN]: [
    [Zones.CIRCUIT_OPEN_PROMOTION_AUTO_START, Zones.CIRCUIT_OPEN_PROMOTION_AUTO_END],
  ],
  [TierSlug.CIRCUIT_CLOSED]: [
    [Zones.CIRCUIT_CLOSED_PROMOTION_AUTO_START, Zones.CIRCUIT_CLOSED_PROMOTION_AUTO_END],
  ],
  [TierSlug.CIRCUIT_FINALS]: [
    [Zones.CIRCUIT_FINALS_PROMOTION_AUTO_START, Zones.CIRCUIT_FINALS_PROMOTION_AUTO_END],
  ],
  [TierSlug.ESWC_CHALLENGERS]: [
    [Zones.ESWC_CHALLENGERS_PROMOTION_AUTO_START, Zones.ESWC_CHALLENGERS_PROMOTION_AUTO_END],
  ],
  [TierSlug.ESWC_LEGENDS]: [
    [Zones.ESWC_LEGENDS_PROMOTION_AUTO_START, Zones.ESWC_LEGENDS_PROMOTION_AUTO_END],
  ],
  [TierSlug.ESWC_CHAMPIONS]: [
    [Zones.ESWC_CHAMPIONS_PROMOTION_AUTO_START, Zones.ESWC_CHAMPIONS_PROMOTION_AUTO_END],
  ],
};

/**
 * Transfer settings when accepting transfer offers.
 *
 * @constant
 */
export const TransferSettings = {
  // how long do teams and players take to respond
  RESPONSE_MIN_DAYS: 1,
  RESPONSE_MAX_DAYS: 3,

  // is the player willing to lower their wages?
  PBX_PLAYER_LOWBALL_OFFER: 10,

  // how likely is the player willing
  // to move to another region
  PBX_PLAYER_RELOCATE: 10,

  // is the team willing to lower their fee?
  PBX_TEAM_LOWBALL_OFFER: 10,

  // how likely is the team willing to sell
  // their non-transfer-listed player
  PBX_TEAM_SELL_UNLISTED: 10,

  // what are the chances a team will consider
  // sending an offer to the user today?
  PBX_USER_CONSIDER: 5,

  // probability weights when choosing the prestige level of teams
  // that would be interested in buying a player from the user.
  PBX_USER_PRESTIGE_WEIGHTS: [0.5, 90, 2],

  // continue with the transfer even if the user
  // does not have any transfer listed players
  PBX_USER_SELL_UNLISTED: 25,

  // whom from the user's squad should we target
  //
  // each probability maps to an index within
  // the user's players array which should
  // ideally be sorted by their xp
  PBX_USER_TARGET: [90, 5],
};
