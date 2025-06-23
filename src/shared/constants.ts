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
  DATABASES_DIR = 'saves',
  LOCALE_DIR = 'locale',
  GH_API_BODY_LIMIT = 65536,
  LOGGING_LEVEL = 'debug',
  PLUGINS_DIR = 'plugins',
  SQUAD_MIN_LENGTH = 5,
  SEASON_START_DAY = 1,
  SEASON_START_MONTH = 6,
  TRAINING_FREQUENCY = 7,
}

/** @enum */
export enum AwardAction {
  CONFETTI,
  EMAIL,
}

/** @enum */
export enum AwardType {
  CHAMPION,
  PROMOTION,
  QUALIFY,
}

/**
 * XP bonus types.
 *
 * @enum
 */
export enum BonusType {
  MAP,
  SERVER,
  FACILITY,
}

/** @enum */
export enum BotChatter {
  MINIMAL = 'minimal',
  NORMAL = 'normal',
  OFF = 'off',
  RADIO = 'radio',
}

/**
 * Idiomatic bot difficulty names.
 *
 * @enum
 */
export enum BotDifficulty {
  EASY = 'Easy',
  FAIR = 'Fair',
  NORMAL = 'Normal',
  TOUGH = 'Tough',
  HARD = 'Hard',
  VERY_HARD = 'VeryHard',
  EXPERT = 'Expert',
  ELITE = 'Elite',
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
  COMPETITION_END = '/competition/end',
  COMPETITION_START = '/competition/start',
  EMAIL_SEND = '/email/send',
  MATCHDAY_NPC = '/matchday/npc',
  MATCHDAY_USER = '/matchday/user',
  SEASON_START = '/season/start',
  SPONSORSHIP_PARSE = '/sponsorship/parse',
  SPONSORSHIP_PAYMENT = '/sponsorship/payment',
  SPONSORSHIP_RENEW = '/sponsorship/renew',
  TRANSFER_PARSE = '/transfer/parse',
}

/**
 * How often something occurs based off of number of weeks.
 *
 * @enum
 */
export enum CalendarFrequency {
  WEEKLY = 1,
  BI_WEEKLY = 2,
  MONTHLY = 4,
  QUARTERLY = 12,
  YEARLY = 52,
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
 * The possible status for a competition.
 *
 * @enum
 */
export enum CompetitionStatus {
  SCHEDULED,
  STARTED,
  COMPLETED,
}

/** @enum */
export enum ErrorCode {
  ENOENT = 'ENOENT',
  ERUNNING = 'ERUNNING',
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
  CS2 = 'cs2',
  CSGO = 'csgo',
  CSS = 'cssource',
  CZERO = 'czero',
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
  SPONSORS = 'sponsors',
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
 * Support locale types.
 *
 * @enum
 */
export enum LocaleIdentifier {
  EN = 'en',
  ES = 'es',
  FR = 'fr',
}

/**
 * IPC listener route names.
 *
 * @enum
 */
export enum IPCRoute {
  APP_DIALOG = '/app/dialog',
  APP_EXTERNAL = '/app/external',
  APP_LOCALE = '/app/locale',
  APP_INFO = '/app/info',
  APP_STATUS = '/app/status',
  APP_WHATS_NEW = '/app/whatsNew',
  BLAZONRY_ALL = '/blazonry/all',
  BONUS_ALL = '/bonus/all',
  BONUS_BUY = '/bonus/buy',
  CALENDAR_CREATE = '/calendar/create',
  CALENDAR_FIND = '/calendar/find',
  CALENDAR_SIM = '/calendar/sim',
  CALENDAR_START = '/calendar/start',
  CALENDAR_STOP = '/calendar/stop',
  COMPETITIONS_ALL = '/competitions/all',
  COMPETITIONS_FIND = '/competitions/find',
  COMPETITIONS_WINNERS = '/competitions/winners',
  CONFETTI_START = '/confetti/start',
  CONTINENTS_ALL = '/continents/all',
  DATABASE_CONNECT = '/database/connect',
  DATABASE_DISCONNECT = '/database/disconnect',
  EMAILS_ALL = '/emails/all',
  EMAILS_DELETE = '/emails/delete',
  EMAILS_NEW = '/emails/new',
  EMAILS_UPDATE_DIALOGUE = '/emails/update/dialogue',
  EMAILS_UPDATE_MANY = '/emails/update/many',
  FEDERATIONS_ALL = '/federarions/all',
  ISSUES_ALL = '/issues/all',
  ISSUES_CREATE = '/issues/create',
  ISSUES_COMMENTS = '/issues/comments',
  ISSUES_COMMENTS_CREATE = '/issues/comments/create',
  ISSUES_FIND = '/issues/find',
  MATCHES_ALL = '/matches/all',
  MATCHES_COUNT = '/matches/count',
  MATCHES_PREVIOUS = '/matches/previous',
  MATCHES_UPCOMING = '/matches/upcoming',
  MODS_ALL = '/mods/all',
  MODS_DELETE = '/mods/delete',
  MODS_DOWNLOAD = '/mods/download',
  MODS_DOWNLOAD_PROGRESS = '/mods/download-progress',
  MODS_DOWNLOADING = '/mods/downloading',
  MODS_ERROR = '/mods/error',
  MODS_FINISHED = '/mods/finished',
  MODS_GET_INSTALLED = '/mods/get-installed',
  MODS_INSTALLING = '/mods/installing',
  PLAY_START = '/play/start',
  PLAYERS_ALL = '/players/all',
  PLAYERS_COUNT = '/players/count',
  PLAYERS_FIND = '/players/find',
  PLUGINS_CHECKING = '/plugins/checking',
  PLUGINS_DOWNLOADING = '/plugins/downloading',
  PLUGINS_DOWNLOAD_PROGRESS = '/plugins/download-progress',
  PLUGINS_ERROR = '/plugins/error',
  PLUGINS_FINISHED = '/plugins/finished',
  PLUGINS_INSTALLING = '/plugins/installing',
  PLUGINS_NO_UPDATE = '/plugins/noUpdate',
  PLUGINS_START = '/plugins/start',
  PROFILES_CREATE = '/profiles/create',
  PROFILES_CURRENT = '/profiles/current',
  PROFILES_TRAIN = '/profiles/train',
  PROFILES_UPDATE = '/profiles/update',
  SAVES_ALL = '/saves/all',
  SAVES_DELETE = '/saves/delete',
  SPONSORS_ALL = '/sponsors/all',
  SPONSORSHIP_CREATE = '/sponsorship/create',
  SPONSORSHIP_INVITE_ACCEPT = '/sponsorship/invite/accept',
  SPONSORSHIP_INVITE_REJECT = '/sponsorship/invite/reject',
  SPONSORSHIP_RENEW_ACCEPT = '/sponsorship/renew/accept',
  SPONSORSHIP_RENEW_REJECT = '/sponsorship/renew/reject',
  SQUAD_ALL = '/squad/all',
  SQUAD_UPDATE = '/squad/update',
  TEAMS_ALL = '/teams/all',
  TEAMS_CREATE = '/teams/create',
  TEAMS_UPDATE = '/teams/update',
  TIERS_ALL = '/tiers/all',
  TRANSFER_ACCEPT = '/transfer/accept',
  TRANSFER_ALL = '/transfer/all',
  TRANSFER_CREATE = '/transfer/create',
  TRANSFER_REJECT = '/transfer/reject',
  TRANSFER_UPDATE = '/transfer/update',
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

/** @enum */
export enum IssueType {
  BUG,
  FEATURE,
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
 * Sponsor unique identifiers.
 *
 * @enum
 */
export enum SponsorSlug {
  ALOHA_ENERGY = 'aloha-energy',
  BLUEQUIL = 'bluequil',
  GOGTECH = 'gogtech',
  HEAVENCASE = 'heavencase',
  NINEKBET = '9kbet',
  OWNERCARD = 'ownercard',
  PREY = 'prey',
  SKINARCH = 'skinarch',
  WHITE_WOLF = 'white-wolf',
  YNFO = 'ynfo',
  YTL = 'ytl',
}

/**
 * The types of bonuses that can be awarded by sponsors.
 *
 * @enum
 */
export enum SponsorshipBonus {
  PLACEMENT = 'placement',
  QUALIFY = 'qualify',
  TOURNAMENT_WIN = 'tournament_win',
  WIN_STREAK = 'win_streak',
}

/**
 * Sponsor and team status types.
 *
 * @enum
 */
export enum SponsorshipStatus {
  SPONSOR_ACCEPTED,
  SPONSOR_PENDING,
  SPONSOR_REJECTED,
  SPONSOR_TERMINATED,
  TEAM_ACCEPTED,
  TEAM_PENDING,
  TEAM_REJECTED,
  CONTRACT_EXPIRED,
}

/**
 * Sponsor contract requirements.
 *
 * @enum
 */
export enum SponsorshipRequirement {
  EARNINGS = 'earnings',
  PLACEMENT = 'placement',
  RELEGATION = 'relegation',
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
  LEAGUE_ADVANCED_PLAYOFFS = 'league:advanced:playoffs',
  LEAGUE_CUP = 'league:cup',
  LEAGUE_INTERMEDIATE = 'league:intermediate',
  LEAGUE_INTERMEDIATE_PLAYOFFS = 'league:intermediate:playoffs',
  LEAGUE_MAIN = 'league:main',
  LEAGUE_MAIN_PLAYOFFS = 'league:main:playoffs',
  LEAGUE_OPEN = 'league:open',
  LEAGUE_OPEN_PLAYOFFS = 'league:open:playoffs',
  LEAGUE_PREMIER = 'league:premier',
  LEAGUE_PREMIER_PLAYOFFS = 'league:premier:playoffs',
  SPONSORS_BLUEQUIL = 'sponsors:bluequil',
  SPONSORS_HEAVENCASE = 'sponsors:heavencase',
  SPONSORS_NINEKBET = 'sponsors:9kbet',
  SPONSORS_SKINARCH = 'sponsors:skinarch',
  SPONSORS_WHITE_WOLF = 'sponsors:white-wolf',
}

/**
 * Theme settings.
 *
 * @enum
 */
export enum ThemeSetting {
  LIGHT = 'fantasy',
  DARK = 'sunset',
}

/**
 * Theme types.
 *
 * @enum
 */
export enum ThemeType {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
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

/** @enum */
export enum WeaponTemplate {
  AUTO = 'Auto',
  RIFLE = 'Rifle',
  PUNCH = 'Punch',
  SNIPER = 'Sniper',
  POWER = 'Power',
  SHOTGUN = 'Shotgun',
  SPRAY = 'Spray',
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
  LEAGUE_MID_TABLE_START = 5,
  LEAGUE_MID_TABLE_END = 17,
  LEAGUE_RELEGATION_START = 18,
  LEAGUE_RELEGATION_END = 20,
  CIRCUIT_OPEN_PROMOTION_AUTO_START = 1,
  CIRCUIT_OPEN_PROMOTION_AUTO_END = 2,
  CIRCUIT_CLOSED_PROMOTION_AUTO_START = 1,
  CIRCUIT_CLOSED_PROMOTION_AUTO_END = 1,
  CIRCUIT_FINALS_PROMOTION_AUTO_START = 1,
  CIRCUIT_FINALS_PROMOTION_AUTO_END = 2,
  CIRCUIT_PLAYOFFS_PROMOTION_AUTO_START = 1,
  CIRCUIT_PLAYOFFS_PROMOTION_AUTO_END = 4,
  ESWC_CHALLENGERS_PROMOTION_AUTO_START = 1,
  ESWC_CHALLENGERS_PROMOTION_AUTO_END = 2,
  ESWC_LEGENDS_PROMOTION_AUTO_START = 1,
  ESWC_LEGENDS_PROMOTION_AUTO_END = 2,
  ESWC_CHAMPIONS_PROMOTION_AUTO_START = 1,
  ESWC_CHAMPIONS_PROMOTION_AUTO_END = 2,
}

/**
 * Tracks possible competition awards.
 *
 * @constant
 */
export const Awards = [
  {
    on: CalendarEntry.COMPETITION_END,
    target: TierSlug.LEAGUE_OPEN_PLAYOFFS,
    type: AwardType.CHAMPION,
    action: [AwardAction.CONFETTI, AwardAction.EMAIL],
    start: Zones.LEAGUE_PROMOTION_AUTO_START,
  },
  {
    on: CalendarEntry.COMPETITION_END,
    target: TierSlug.LEAGUE_OPEN_PLAYOFFS,
    type: AwardType.PROMOTION,
    action: [AwardAction.CONFETTI, AwardAction.EMAIL],
    start: Zones.LEAGUE_PROMOTION_AUTO_START,
    end: Zones.LEAGUE_PROMOTION_AUTO_END,
  },
  {
    on: CalendarEntry.COMPETITION_END,
    target: TierSlug.LEAGUE_INTERMEDIATE_PLAYOFFS,
    type: AwardType.CHAMPION,
    action: [AwardAction.CONFETTI, AwardAction.EMAIL],
    start: Zones.LEAGUE_PROMOTION_AUTO_START,
  },
  {
    on: CalendarEntry.COMPETITION_END,
    target: TierSlug.LEAGUE_INTERMEDIATE_PLAYOFFS,
    type: AwardType.PROMOTION,
    action: [AwardAction.CONFETTI, AwardAction.EMAIL],
    start: Zones.LEAGUE_PROMOTION_AUTO_START,
    end: Zones.LEAGUE_PROMOTION_AUTO_END,
  },
  {
    on: CalendarEntry.COMPETITION_END,
    target: TierSlug.LEAGUE_MAIN_PLAYOFFS,
    type: AwardType.CHAMPION,
    action: [AwardAction.CONFETTI, AwardAction.EMAIL],
    start: Zones.LEAGUE_PROMOTION_AUTO_START,
  },
  {
    on: CalendarEntry.COMPETITION_END,
    target: TierSlug.LEAGUE_MAIN_PLAYOFFS,
    type: AwardType.PROMOTION,
    action: [AwardAction.CONFETTI, AwardAction.EMAIL],
    start: Zones.LEAGUE_PROMOTION_AUTO_START,
    end: Zones.LEAGUE_PROMOTION_AUTO_END,
  },
  {
    on: CalendarEntry.COMPETITION_END,
    target: TierSlug.LEAGUE_ADVANCED_PLAYOFFS,
    type: AwardType.CHAMPION,
    action: [AwardAction.CONFETTI, AwardAction.EMAIL],
    start: Zones.LEAGUE_PROMOTION_AUTO_START,
  },
  {
    on: CalendarEntry.COMPETITION_END,
    target: TierSlug.LEAGUE_ADVANCED_PLAYOFFS,
    type: AwardType.PROMOTION,
    action: [AwardAction.CONFETTI, AwardAction.EMAIL],
    start: Zones.LEAGUE_PROMOTION_AUTO_START,
    end: Zones.LEAGUE_PROMOTION_AUTO_END,
  },
  {
    on: CalendarEntry.COMPETITION_END,
    target: TierSlug.LEAGUE_PREMIER_PLAYOFFS,
    type: AwardType.CHAMPION,
    action: [AwardAction.CONFETTI, AwardAction.EMAIL],
    start: Zones.LEAGUE_PROMOTION_AUTO_START,
  },
  {
    on: CalendarEntry.COMPETITION_END,
    target: TierSlug.LEAGUE_CUP,
    type: AwardType.CHAMPION,
    action: [AwardAction.CONFETTI, AwardAction.EMAIL],
    start: 1,
  },
  {
    on: CalendarEntry.COMPETITION_END,
    target: TierSlug.CIRCUIT_OPEN,
    type: AwardType.QUALIFY,
    action: [AwardAction.EMAIL],
    start: 0,
    end: Zones.CIRCUIT_OPEN_PROMOTION_AUTO_END,
  },
  {
    on: CalendarEntry.COMPETITION_END,
    target: TierSlug.CIRCUIT_CLOSED,
    type: AwardType.QUALIFY,
    action: [AwardAction.EMAIL],
    start: Zones.CIRCUIT_CLOSED_PROMOTION_AUTO_START,
  },
  {
    on: CalendarEntry.COMPETITION_END,
    target: TierSlug.CIRCUIT_FINALS,
    type: AwardType.QUALIFY,
    action: [AwardAction.EMAIL],
    start: 0,
    end: Zones.CIRCUIT_FINALS_PROMOTION_AUTO_END,
  },
  {
    on: CalendarEntry.COMPETITION_END,
    target: TierSlug.CIRCUIT_PLAYOFFS,
    type: AwardType.CHAMPION,
    action: [AwardAction.CONFETTI, AwardAction.EMAIL],
    start: Zones.CIRCUIT_PLAYOFFS_PROMOTION_AUTO_START,
  },
  {
    on: CalendarEntry.COMPETITION_END,
    target: TierSlug.CIRCUIT_PLAYOFFS,
    type: AwardType.QUALIFY,
    action: [AwardAction.EMAIL],
    start: Zones.CIRCUIT_PLAYOFFS_PROMOTION_AUTO_START,
    end: Zones.CIRCUIT_PLAYOFFS_PROMOTION_AUTO_END,
  },
  {
    on: CalendarEntry.COMPETITION_END,
    target: TierSlug.ESWC_CHALLENGERS,
    type: AwardType.QUALIFY,
    action: [AwardAction.EMAIL],
    start: 0,
    end: Zones.ESWC_CHALLENGERS_PROMOTION_AUTO_END,
  },
  {
    on: CalendarEntry.COMPETITION_END,
    target: TierSlug.ESWC_LEGENDS,
    type: AwardType.QUALIFY,
    action: [AwardAction.EMAIL],
    start: 0,
    end: Zones.ESWC_LEGENDS_PROMOTION_AUTO_END,
  },
  {
    on: CalendarEntry.COMPETITION_END,
    target: TierSlug.ESWC_CHAMPIONS,
    type: AwardType.QUALIFY,
    action: [AwardAction.EMAIL],
    start: 0,
    end: Zones.ESWC_CHAMPIONS_PROMOTION_AUTO_END,
  },
  {
    on: CalendarEntry.COMPETITION_END,
    target: TierSlug.ESWC_PLAYOFFS,
    type: AwardType.CHAMPION,
    action: [AwardAction.CONFETTI, AwardAction.EMAIL],
    start: 1,
  },
  {
    on: CalendarEntry.COMPETITION_END,
    target: TierSlug.SPONSORS_BLUEQUIL,
    type: AwardType.CHAMPION,
    action: [AwardAction.CONFETTI, AwardAction.EMAIL],
    start: 1,
  },
  {
    on: CalendarEntry.COMPETITION_END,
    target: TierSlug.SPONSORS_HEAVENCASE,
    type: AwardType.CHAMPION,
    action: [AwardAction.CONFETTI, AwardAction.EMAIL],
    start: 1,
  },
  {
    on: CalendarEntry.COMPETITION_END,
    target: TierSlug.SPONSORS_NINEKBET,
    type: AwardType.CHAMPION,
    action: [AwardAction.CONFETTI, AwardAction.EMAIL],
    start: 1,
  },
  {
    on: CalendarEntry.COMPETITION_END,
    target: TierSlug.SPONSORS_SKINARCH,
    type: AwardType.CHAMPION,
    action: [AwardAction.CONFETTI, AwardAction.EMAIL],
    start: 1,
  },
  {
    on: CalendarEntry.COMPETITION_END,
    target: TierSlug.SPONSORS_WHITE_WOLF,
    type: AwardType.CHAMPION,
    action: [AwardAction.CONFETTI, AwardAction.EMAIL],
    start: 1,
  },
];

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
  LOGS_DIR: 'logs',
  SERVER_CVAR_GAMEOVER_DELAY: 5,
  SERVER_CVAR_MAXROUNDS: 30,
  SERVER_CVAR_MAXROUNDS_OT: 6,
  SERVER_CVAR_FREEZETIME: 15,
  SQUAD_STARTERS_NUM: 5,
  STEAM_EXE: 'steam.exe',
  STEAM_LIBRARIES_FILE: 'steamapps/libraryfolders.vdf',
  WIN_AWARD_AMOUNT: 100,

  // cs16 settings
  CS16_APPID: 10,
  CS16_BASEDIR: 'steamapps/common/Half-Life',
  CS16_BOT_COMMAND_FILE: 'liga-bots.cfg',
  CS16_BOT_CONFIG: 'botprofile.db',
  CS16_DLL_BOTS: 'dlls/liga.dll',
  CS16_DLL_METAMOD: 'addons/metamod/dlls/metamod.dll',
  CS16_EXE: 'hl.exe',
  CS16_GAMEDIR: 'cstrike',
  CS16_MOTD_HTML_FILE: 'motd.html',
  CS16_MOTD_TXT_FILE: 'motd.txt',
  CS16_SERVER_CONFIG_FILE: 'listenserver.cfg',
  CS16_SERVER_WARMUP_CONFIG_FILE: 'liga-warmup.cfg',

  // cs2 settings
  CS2_APPID: 730,
  CS2_BOT_COMMAND_FILE: 'cfg/liga-bots.cfg',
  CS2_BOT_CONFIG: 'botprofile.db',
  CS2_BASEDIR: 'steamapps/common/Counter-Strike Global Offensive',
  CS2_EXE: 'game/bin/win64/cs2.exe',
  CS2_GAMEDIR: 'game/csgo',
  CS2_GAMEINFO_FILE: 'gameinfo.gi',
  CS2_LOGFILE: 'console.log',
  CS2_SERVER_CONFIG_FILE: 'cfg/listenserver.cfg',
  CS2_VPK_FILE: 'overrides/liga.vpk',

  // csgo settings
  CSGO_APPID: 730,
  CSGO_BETTER_BOTS_NAMES_FILE: 'addons/sourcemod/configs/bot_names.txt',
  CSGO_BOT_COMMAND_FILE: 'cfg/liga-bots.cfg',
  CSGO_BOT_CONFIG: 'botprofile.db',
  CSGO_BASEDIR: 'steamapps/common/Counter-Strike Global Offensive',
  CSGO_EXE: 'csgo.exe',
  CSGO_GAMEDIR: 'csgo',
  CSGO_LANGUAGE_FILE: 'resource/csgo_english.txt',
  CSGO_SERVER_CONFIG_FILE: 'cfg/listenserver.cfg',
  CSGO_STEAM_INF_FILE: 'steam.inf',
  CSGO_VERSION: 2000258,

  // cssource settings
  CSSOURCE_APPID: 240,
  CSSOURCE_BASEDIR: 'steamapps/common/Counter-Strike Source',
  CSSOURCE_BOT_COMMAND_FILE: 'cfg/liga-bots.cfg',
  CSSOURCE_BOT_CONFIG: 'custom/liga/botprofile.db',
  CSSOURCE_EXE: 'cstrike.exe',
  CSSOURCE_GAMEDIR: 'cstrike',
  CSSOURCE_MOTD_HTML_FILE: 'cfg/motd.html',
  CSSOURCE_MOTD_TXT_FILE: 'cfg/motd.txt',
  CSSOURCE_SERVER_CONFIG_FILE: 'cfg/listenserver.cfg',

  // czero
  CZERO_APPID: 80,
  CZERO_BASEDIR: 'steamapps/common/Half-Life',
  CZERO_BOT_COMMAND_FILE: 'liga-bots.cfg',
  CZERO_BOT_CONFIG: 'botprofile.db',
  CZERO_DLL_BOTS: 'dlls/liga.dll',
  CZERO_DLL_METAMOD: 'addons/metamod/dlls/metamod.dll',
  CZERO_EXE: 'hl.exe',
  CZERO_GAMEDIR: 'czero',
  CZERO_MOTD_HTML_FILE: 'motd.html',
  CZERO_MOTD_TXT_FILE: 'motd.txt',
  CZERO_SERVER_CONFIG_FILE: 'listenserver.cfg',
  CZERO_SERVER_WARMUP_CONFIG_FILE: 'liga-warmup.cfg',

  // rcon settings
  RCON_MAX_ATTEMPTS: 10,
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
  [TierSlug.LEAGUE_OPEN_PLAYOFFS]: 'Open Division Playoffs',
  [TierSlug.LEAGUE_CUP]: 'Open Cup',
  [TierSlug.LEAGUE_INTERMEDIATE]: 'Intermediate Division',
  [TierSlug.LEAGUE_INTERMEDIATE_PLAYOFFS]: 'Intermediate Division Playoffs',
  [TierSlug.LEAGUE_MAIN]: 'Main Division',
  [TierSlug.LEAGUE_MAIN_PLAYOFFS]: 'Main Division Playoffs',
  [TierSlug.LEAGUE_ADVANCED]: 'Advanced Division',
  [TierSlug.LEAGUE_ADVANCED_PLAYOFFS]: 'Advanced Division Playoffs',
  [TierSlug.LEAGUE_PREMIER]: 'Premier Division',
  [TierSlug.LEAGUE_PREMIER_PLAYOFFS]: 'Premier Division Playoffs',
  [TierSlug.SPONSORS_BLUEQUIL]: 'BlueQuil Invitational',
  [TierSlug.SPONSORS_HEAVENCASE]: 'HeavenCase Challenge',
  [TierSlug.SPONSORS_NINEKBET]: '9kBet Cup',
  [TierSlug.SPONSORS_SKINARCH]: 'SkinArch Showdown',
  [TierSlug.SPONSORS_WHITE_WOLF]: 'WhiteWolf Invitational',
};

export const IdiomaticSponsorshipStatus: Record<number, string> = {
  [SponsorshipStatus.SPONSOR_ACCEPTED]: 'Sponsor Accepted',
  [SponsorshipStatus.SPONSOR_PENDING]: 'Sponsor Pending',
  [SponsorshipStatus.SPONSOR_REJECTED]: 'Sponsor Rejected',
  [SponsorshipStatus.SPONSOR_TERMINATED]: 'Sponsor Terminated',
  [SponsorshipStatus.TEAM_ACCEPTED]: 'Team Accepted',
  [SponsorshipStatus.TEAM_PENDING]: 'Team Pending',
  [SponsorshipStatus.TEAM_REJECTED]: 'Team Rejected',
  [SponsorshipStatus.CONTRACT_EXPIRED]: 'Contract Expired',
};

/** @constant */
export const IdiomaticTransferStatus: Record<number, string> = {
  [TransferStatus.PLAYER_ACCEPTED]: 'Player Accepted',
  [TransferStatus.PLAYER_PENDING]: 'Player Pending',
  [TransferStatus.PLAYER_REJECTED]: 'Player Rejected',
  [TransferStatus.TEAM_ACCEPTED]: 'Team Accepted',
  [TransferStatus.TEAM_PENDING]: 'Team Pending',
  [TransferStatus.TEAM_REJECTED]: 'Team Rejected',
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
  'de_ancient',
  'de_anubis',
  'de_vertigo',
  'de_cache',
];

/**
 * Replacement maps for game variants.
 *
 * @constant
 */
export const MapPoolReplacements: Record<string, Record<string, string>> = {
  [Game.CS16]: {
    de_mirage: 'de_cpl_strike',
    de_overpass: 'de_cpl_fire',
    de_ancient: 'de_cpl_mill',
    de_anubis: 'de_cbble',
    de_vertigo: 'de_dust2',
    de_cache: 'de_dust2',
  },
  [Game.CS2]: {
    de_cache: 'de_dust2',
    de_tuscan: 'de_dust2',
  },
  [Game.CSS]: {
    de_mirage: 'de_cpl_strike',
    de_overpass: 'de_russka',
    de_ancient: 'de_dust2',
    de_anubis: 'de_cbble',
    de_vertigo: 'de_dust2',
    de_cache: 'de_dust2',
  },
  [Game.CZERO]: {
    de_dust2: 'de_dust2_cz',
    de_inferno: 'de_inferno_cz',
    de_mirage: 'de_czl_freight',
    de_overpass: 'de_russka_cz',
    de_tuscan: 'de_dust2_cz',
    de_ancient: 'de_czl_karnak',
    de_anubis: 'de_czl_silo',
    de_vertigo: 'de_dust2_cz',
    de_cache: 'de_dust2_cz',
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
  [LeagueSlug.SPONSORS]: {
    1: 50, // monday
    2: 'auto', // tuesday
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
 * Prize pool distribution ranges.
 *
 * @constant
 */
export const PrizePool: Record<TierSlug | string, { total: number; distribution: Array<number> }> =
  {
    [TierSlug.CIRCUIT_OPEN]: { total: 0, distribution: [] },
    [TierSlug.CIRCUIT_CLOSED]: { total: 0, distribution: [] },
    [TierSlug.CIRCUIT_FINALS]: { total: 0, distribution: [] },
    [TierSlug.CIRCUIT_PLAYOFFS]: { total: 25_000, distribution: [50, 35, 15] },
    [TierSlug.ESWC_CHALLENGERS]: { total: 0, distribution: [] },
    [TierSlug.ESWC_LEGENDS]: { total: 0, distribution: [] },
    [TierSlug.ESWC_CHAMPIONS]: { total: 0, distribution: [] },
    [TierSlug.ESWC_PLAYOFFS]: { total: 75_000, distribution: [50, 35, 15] },
    [TierSlug.LEAGUE_OPEN]: { total: 2_000, distribution: [50, 35, 15] },
    [TierSlug.LEAGUE_OPEN_PLAYOFFS]: { total: 0, distribution: [] },
    [TierSlug.LEAGUE_CUP]: { total: 5_000, distribution: [75, 25] },
    [TierSlug.LEAGUE_INTERMEDIATE]: { total: 3_000, distribution: [50, 35, 15] },
    [TierSlug.LEAGUE_INTERMEDIATE_PLAYOFFS]: { total: 0, distribution: [] },
    [TierSlug.LEAGUE_MAIN]: { total: 4_000, distribution: [50, 35, 15] },
    [TierSlug.LEAGUE_MAIN_PLAYOFFS]: { total: 0, distribution: [] },
    [TierSlug.LEAGUE_ADVANCED]: { total: 5_000, distribution: [50, 35, 15] },
    [TierSlug.LEAGUE_ADVANCED_PLAYOFFS]: { total: 0, distribution: [] },
    [TierSlug.LEAGUE_PREMIER]: { total: 10_000, distribution: [50, 35, 15] },
    [TierSlug.LEAGUE_PREMIER_PLAYOFFS]: { total: 0, distribution: [] },
    [TierSlug.SPONSORS_BLUEQUIL]: { total: 8000, distribution: [50, 35, 15] },
    [TierSlug.SPONSORS_HEAVENCASE]: { total: 6000, distribution: [50, 35, 15] },
    [TierSlug.SPONSORS_NINEKBET]: { total: 6000, distribution: [50, 35, 15] },
    [TierSlug.SPONSORS_SKINARCH]: { total: 3000, distribution: [50, 35, 15] },
    [TierSlug.SPONSORS_WHITE_WOLF]: { total: 5000, distribution: [50, 35, 15] },
  };

/**
 * Settings for the application and their defaults.
 *
 * @constant
 */
export const Settings = {
  general: {
    game: Game.CSGO,
    logLevel: Application.LOGGING_LEVEL,
    simulationMode: SimulationMode.DEFAULT,
    steamPath: null as string,
    gamePath: null as string,
    botChatter: BotChatter.RADIO,
    gameLaunchOptions: null as string,
    theme: ThemeType.SYSTEM,
    botDifficulty: null as string,
    locale: null as LocaleIdentifier,
  },
  calendar: {
    ignoreExits: false,
    maxIterations: 15,
    unit: CalendarUnit.DAY,
  },
  matchRules: {
    freezeTime: 7,
    mapOverride: null as string,
    maxRounds: 6,
    overtime: true,
    startMoney: 10_000,
  },
};

/**
 * Sponsor contract conditions.
 *
 * @constant
 */
export const SponsorContract: Record<
  SponsorSlug,
  {
    bonuses: Array<{
      type: SponsorshipBonus | SponsorshipRequirement;
      condition?: string | number;
      amount?: number;
    }>;
    requirements: Array<{
      type: SponsorshipBonus | SponsorshipRequirement;
      condition?: string | number;
      amount?: number;
    }>;
    terms: Array<{
      length: number;
      frequency: CalendarFrequency;
      amount: number;
    }>;
    tiers?: Array<TierSlug>;
    tournament?: TierSlug;
  }
> = {
  [SponsorSlug.ALOHA_ENERGY]: {
    bonuses: [
      {
        type: SponsorshipBonus.QUALIFY,
        condition: TierSlug.CIRCUIT_FINALS,
        amount: 5000,
      },
      {
        type: SponsorshipBonus.WIN_STREAK,
        condition: 5,
        amount: 5000,
      },
    ],
    requirements: [
      {
        type: SponsorshipRequirement.PLACEMENT,
        condition: 10,
      },
    ],
    terms: [
      {
        length: 2,
        frequency: CalendarFrequency.MONTHLY,
        amount: 500,
      },
    ],
    tiers: [TierSlug.LEAGUE_ADVANCED, TierSlug.LEAGUE_PREMIER],
  },
  [SponsorSlug.BLUEQUIL]: {
    bonuses: [
      {
        type: SponsorshipBonus.PLACEMENT,
        condition: Zones.LEAGUE_PROMOTION_AUTO_END,
        amount: 5000,
      },
      {
        type: SponsorshipBonus.TOURNAMENT_WIN,
        condition: Zones.LEAGUE_PROMOTION_AUTO_START,
        amount: 5000,
      },
      {
        type: SponsorshipBonus.WIN_STREAK,
        condition: 5,
        amount: 5000,
      },
    ],
    requirements: [
      {
        type: SponsorshipRequirement.EARNINGS,
        condition: 1000,
      },
      {
        type: SponsorshipRequirement.RELEGATION,
        condition: Zones.LEAGUE_RELEGATION_START,
      },
    ],
    terms: [
      {
        length: 2,
        frequency: CalendarFrequency.BI_WEEKLY,
        amount: 2000,
      },
    ],
    tiers: [TierSlug.LEAGUE_PREMIER],
    tournament: TierSlug.SPONSORS_BLUEQUIL,
  },
  [SponsorSlug.GOGTECH]: {
    bonuses: [
      {
        type: SponsorshipBonus.PLACEMENT,
        condition: Zones.LEAGUE_PROMOTION_AUTO_END,
        amount: 5000,
      },
      {
        type: SponsorshipBonus.TOURNAMENT_WIN,
        condition: Zones.LEAGUE_PROMOTION_AUTO_START,
        amount: 5000,
      },
      {
        type: SponsorshipBonus.WIN_STREAK,
        condition: 5,
        amount: 5000,
      },
    ],
    requirements: [
      {
        type: SponsorshipRequirement.EARNINGS,
        condition: 1000,
      },
      {
        type: SponsorshipRequirement.RELEGATION,
        condition: Zones.LEAGUE_RELEGATION_START,
      },
    ],
    terms: [
      {
        length: 2,
        frequency: CalendarFrequency.BI_WEEKLY,
        amount: 2000,
      },
    ],
    tiers: [TierSlug.LEAGUE_PREMIER],
  },
  [SponsorSlug.HEAVENCASE]: {
    bonuses: [
      {
        type: SponsorshipBonus.QUALIFY,
        condition: TierSlug.CIRCUIT_FINALS,
        amount: 5000,
      },
      {
        type: SponsorshipBonus.WIN_STREAK,
        condition: 5,
        amount: 5000,
      },
    ],
    requirements: [
      {
        type: SponsorshipRequirement.PLACEMENT,
        condition: 8,
      },
    ],
    terms: [
      {
        length: 2,
        frequency: CalendarFrequency.MONTHLY,
        amount: 500,
      },
    ],
    tiers: [TierSlug.LEAGUE_ADVANCED, TierSlug.LEAGUE_PREMIER],
    tournament: TierSlug.SPONSORS_HEAVENCASE,
  },
  [SponsorSlug.NINEKBET]: {
    bonuses: [
      {
        type: SponsorshipBonus.QUALIFY,
        condition: TierSlug.CIRCUIT_FINALS,
        amount: 5000,
      },
      {
        type: SponsorshipBonus.WIN_STREAK,
        condition: 5,
        amount: 5000,
      },
    ],
    requirements: [
      {
        type: SponsorshipRequirement.PLACEMENT,
        condition: 8,
      },
    ],
    terms: [
      {
        length: 2,
        frequency: CalendarFrequency.MONTHLY,
        amount: 500,
      },
    ],
    tiers: [TierSlug.LEAGUE_ADVANCED, TierSlug.LEAGUE_PREMIER],
    tournament: TierSlug.SPONSORS_NINEKBET,
  },
  [SponsorSlug.OWNERCARD]: {
    bonuses: [
      {
        type: SponsorshipBonus.PLACEMENT,
        condition: Zones.LEAGUE_PROMOTION_AUTO_END,
        amount: 5000,
      },
      {
        type: SponsorshipBonus.TOURNAMENT_WIN,
        condition: Zones.LEAGUE_PROMOTION_AUTO_START,
        amount: 5000,
      },
      {
        type: SponsorshipBonus.WIN_STREAK,
        condition: 5,
        amount: 5000,
      },
    ],
    requirements: [
      {
        type: SponsorshipRequirement.EARNINGS,
        condition: 1000,
      },
      {
        type: SponsorshipRequirement.RELEGATION,
        condition: Zones.LEAGUE_RELEGATION_START,
      },
    ],
    terms: [
      {
        length: 2,
        frequency: CalendarFrequency.MONTHLY,
        amount: 500,
      },
    ],
    tiers: [TierSlug.LEAGUE_PREMIER],
  },
  [SponsorSlug.PREY]: {
    bonuses: [
      {
        type: SponsorshipBonus.PLACEMENT,
        condition: Zones.LEAGUE_PROMOTION_AUTO_END,
        amount: 5000,
      },
      {
        type: SponsorshipBonus.TOURNAMENT_WIN,
        condition: Zones.LEAGUE_PROMOTION_AUTO_START,
        amount: 5000,
      },
      {
        type: SponsorshipBonus.WIN_STREAK,
        condition: 5,
        amount: 5000,
      },
    ],
    requirements: [
      {
        type: SponsorshipRequirement.EARNINGS,
        condition: 1000,
      },
      {
        type: SponsorshipRequirement.RELEGATION,
        condition: Zones.LEAGUE_RELEGATION_START,
      },
    ],
    terms: [
      {
        length: 2,
        frequency: CalendarFrequency.MONTHLY,
        amount: 500,
      },
    ],
    tiers: [TierSlug.LEAGUE_PREMIER],
  },
  [SponsorSlug.SKINARCH]: {
    bonuses: [
      {
        type: SponsorshipBonus.PLACEMENT,
        condition: 8,
        amount: 5000,
      },
      {
        type: SponsorshipBonus.QUALIFY,
        condition: TierSlug.CIRCUIT_FINALS,
        amount: 5000,
      },
      {
        type: SponsorshipBonus.WIN_STREAK,
        condition: 5,
        amount: 5000,
      },
    ],
    requirements: [
      {
        type: SponsorshipRequirement.PLACEMENT,
        condition: 10,
      },
    ],
    terms: [
      {
        length: 2,
        frequency: CalendarFrequency.MONTHLY,
        amount: 500,
      },
    ],
    tiers: [TierSlug.LEAGUE_MAIN, TierSlug.LEAGUE_ADVANCED],
    tournament: TierSlug.SPONSORS_SKINARCH,
  },
  [SponsorSlug.WHITE_WOLF]: {
    bonuses: [
      {
        type: SponsorshipBonus.PLACEMENT,
        condition: 8,
        amount: 5000,
      },
      {
        type: SponsorshipBonus.QUALIFY,
        condition: TierSlug.CIRCUIT_FINALS,
        amount: 5000,
      },
      {
        type: SponsorshipBonus.WIN_STREAK,
        condition: 5,
        amount: 5000,
      },
    ],
    requirements: [
      {
        type: SponsorshipRequirement.PLACEMENT,
        condition: 10,
      },
    ],
    terms: [
      {
        length: 2,
        frequency: CalendarFrequency.MONTHLY,
        amount: 500,
      },
    ],
    tiers: [TierSlug.LEAGUE_ADVANCED],
    tournament: TierSlug.SPONSORS_WHITE_WOLF,
  },
  [SponsorSlug.YNFO]: {
    bonuses: [
      {
        type: SponsorshipBonus.PLACEMENT,
        condition: Zones.LEAGUE_PROMOTION_AUTO_END,
        amount: 5000,
      },
      {
        type: SponsorshipBonus.TOURNAMENT_WIN,
        condition: Zones.LEAGUE_PROMOTION_AUTO_START,
        amount: 5000,
      },
      {
        type: SponsorshipBonus.WIN_STREAK,
        condition: 5,
        amount: 5000,
      },
    ],
    requirements: [
      {
        type: SponsorshipRequirement.EARNINGS,
        condition: 1000,
      },
      {
        type: SponsorshipRequirement.RELEGATION,
        condition: Zones.LEAGUE_RELEGATION_START,
      },
    ],
    terms: [
      {
        length: 2,
        frequency: CalendarFrequency.MONTHLY,
        amount: 500,
      },
    ],
    tiers: [TierSlug.LEAGUE_PREMIER],
  },
  [SponsorSlug.YTL]: {
    bonuses: [
      {
        type: SponsorshipBonus.PLACEMENT,
        condition: Zones.LEAGUE_PROMOTION_AUTO_END,
        amount: 5000,
      },
      {
        type: SponsorshipBonus.TOURNAMENT_WIN,
        condition: Zones.LEAGUE_PROMOTION_AUTO_START,
        amount: 5000,
      },
      {
        type: SponsorshipBonus.WIN_STREAK,
        condition: 5,
        amount: 5000,
      },
    ],
    requirements: [
      {
        type: SponsorshipRequirement.EARNINGS,
        condition: 1000,
      },
      {
        type: SponsorshipRequirement.RELEGATION,
        condition: Zones.LEAGUE_RELEGATION_START,
      },
    ],
    terms: [
      {
        length: 2,
        frequency: CalendarFrequency.MONTHLY,
        amount: 500,
      },
    ],
    tiers: [TierSlug.LEAGUE_PREMIER],
  },
};

/**
 * Match config for tiers such as
 * the number of games per match.
 *
 * The array index represents the round
 * counting back from the grand-final.
 *
 * For example, an array of `[7, 5, 3]`:
 * - grand-final is bo7
 * - semi-final is bo5
 * - quarter-final is bo3
 *
 * @constant
 */
export const TierMatchConfig: Record<string, Array<number>> = {
  [TierSlug.CIRCUIT_PLAYOFFS]: [3, 3],
  [TierSlug.ESWC_PLAYOFFS]: [5, 3],
  [TierSlug.LEAGUE_ADVANCED_PLAYOFFS]: [3, 3],
  [TierSlug.LEAGUE_CUP]: [3, 3],
  [TierSlug.LEAGUE_INTERMEDIATE_PLAYOFFS]: [3, 3],
  [TierSlug.LEAGUE_MAIN_PLAYOFFS]: [3, 3],
  [TierSlug.LEAGUE_OPEN_PLAYOFFS]: [3, 3],
  [TierSlug.LEAGUE_PREMIER_PLAYOFFS]: [3, 3],
  [TierSlug.SPONSORS_BLUEQUIL]: [3, 3],
  [TierSlug.SPONSORS_HEAVENCASE]: [3, 3],
  [TierSlug.SPONSORS_NINEKBET]: [3, 3],
  [TierSlug.SPONSORS_SKINARCH]: [3, 3],
  [TierSlug.SPONSORS_WHITE_WOLF]: [3, 3],
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

  // how much percent to add (per dollar) over the wages
  PBX_PLAYER_HIGHBALL_MODIFIER: 0.01,

  // is the player willing to lower their wages?
  PBX_PLAYER_LOWBALL_OFFER: 10,

  // how likely is the player willing
  // to move to another region
  PBX_PLAYER_RELOCATE: 10,

  // how much percent to add (per dollar) over the selling price
  PBX_TEAM_HIGHBALL_MODIFIER: 0.01,

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

/**
 * Game weapon templates derived from their
 * respective `BotProfile.db` file.
 *
 * @constant
 */
export const WeaponTemplates = {
  [Game.CS16]: {
    [WeaponTemplate.AUTO]: [] as Array<string>,
    [WeaponTemplate.RIFLE]: ['m4a1', 'ak47', 'famas', 'galil', 'mp5'],
    [WeaponTemplate.PUNCH]: ['aug', 'sg552', 'famas', 'galil', 'mp5'],
    [WeaponTemplate.SNIPER]: ['awp', 'famas', 'galil', 'mp5'],
    [WeaponTemplate.POWER]: ['m249', 'xm1014', 'm3', 'famas', 'galil', 'mp5'],
    [WeaponTemplate.SHOTGUN]: ['xm1014', 'm3', 'famas', 'galil', 'mp5'],
    [WeaponTemplate.SPRAY]: ['p90', 'tmp', 'mac10', 'mp5'],
  },
  [Game.CS2]: {
    [WeaponTemplate.AUTO]: [] as Array<string>,
    [WeaponTemplate.RIFLE]: ['m4a1', 'ak47', 'famas', 'galilar', 'mp7'],
    [WeaponTemplate.PUNCH]: ['aug', 'sg556', 'famas', 'galilar', 'mp7'],
    [WeaponTemplate.SNIPER]: ['awp', 'famas', 'galilar', 'mp7'],
    [WeaponTemplate.POWER]: ['m249', 'xm1014', 'nova', 'famas', 'galilar', 'mp7'],
    [WeaponTemplate.SHOTGUN]: ['xm1014', 'nova', 'famas', 'galilar', 'mp7'],
    [WeaponTemplate.SPRAY]: ['p90', 'mp9', 'mac10', 'mp7'],
  },
  [Game.CSGO]: {
    [WeaponTemplate.AUTO]: [] as Array<string>,
    [WeaponTemplate.RIFLE]: ['m4a1', 'ak47', 'famas', 'galilar', 'mp7'],
    [WeaponTemplate.PUNCH]: ['aug', 'sg556', 'famas', 'galilar', 'mp7'],
    [WeaponTemplate.SNIPER]: ['awp', 'famas', 'galilar', 'mp7'],
    [WeaponTemplate.POWER]: ['m249', 'xm1014', 'nova', 'famas', 'galilar', 'mp7'],
    [WeaponTemplate.SHOTGUN]: ['xm1014', 'nova', 'famas', 'galilar', 'mp7'],
    [WeaponTemplate.SPRAY]: ['p90', 'mp9', 'mac10', 'mp7'],
  },
  [Game.CSS]: {
    [WeaponTemplate.AUTO]: [] as Array<string>,
    [WeaponTemplate.RIFLE]: ['m4a1', 'ak47', 'famas', 'galil', 'mp5'],
    [WeaponTemplate.PUNCH]: ['aug', 'sg552', 'famas', 'galil', 'mp5'],
    [WeaponTemplate.SNIPER]: ['awp', 'famas', 'galil', 'mp5'],
    [WeaponTemplate.POWER]: ['m249', 'xm1014', 'm3', 'famas', 'galil', 'mp5'],
    [WeaponTemplate.SHOTGUN]: ['xm1014', 'm3', 'famas', 'galil', 'mp5'],
    [WeaponTemplate.SPRAY]: ['p90', 'tmp', 'mac10', 'mp5'],
  },
  [Game.CZERO]: {
    [WeaponTemplate.AUTO]: [] as Array<string>,
    [WeaponTemplate.RIFLE]: ['m4a1', 'ak47', 'famas', 'galil', 'mp5'],
    [WeaponTemplate.PUNCH]: ['aug', 'sg552', 'famas', 'galil', 'mp5'],
    [WeaponTemplate.SNIPER]: ['awp', 'famas', 'galil', 'mp5'],
    [WeaponTemplate.POWER]: ['m249', 'xm1014', 'm3', 'famas', 'galil', 'mp5'],
    [WeaponTemplate.SHOTGUN]: ['xm1014', 'm3', 'famas', 'galil', 'mp5'],
    [WeaponTemplate.SPRAY]: ['p90', 'tmp', 'mac10', 'mp5'],
  },
};
