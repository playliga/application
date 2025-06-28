/**
 * Game management module.
 *
 * @module
 */
import * as FileManager from './file-manager';
import * as PluginManager from './plugins';
import * as RCON from './rcon';
import * as Scorebot from './scorebot';
import * as Sqrl from 'squirrelly';
import * as VDF from './vdf';
import * as VPK from './vpk';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import util from 'node:util';
import log from 'electron-log';
import { spawn, ChildProcessWithoutNullStreams, exec as execSync } from 'node:child_process';
import { app } from 'electron';
import { glob } from 'glob';
import { Prisma, Profile } from '@prisma/client';
import { compact, flatten, random, startCase, uniq } from 'lodash';
import { Constants, Bot, Chance, Util, Eagers, Dedent, is } from '@liga/shared';

/**
 * Promisified version of `exec`.
 *
 * @constant
 */
const exec = util.promisify(execSync);

/**
 * Track the game process instance at the module level so
 * other modules know if the app has launched the process
 * or if it was launched by something else.
 *
 * @constant
 */
let gameClientProcess: ChildProcessWithoutNullStreams;

/**
 * Custom error to throw when a process
 * has been detected as running.
 *
 * @class
 */
class ProcessRunningError extends Error {
  errno: number;
  code: string;
  path: string;

  constructor(message: string) {
    super();
    this.errno = -1337;
    this.code = Constants.ErrorCode.ERUNNING;
    this.path = message;
  }
}

/**
 * Get Steam's installation path.
 *
 * @function
 */
export async function discoverSteamPath() {
  if (is.osx()) {
    return `${os.homedir()}/Library/Application Support/Steam`;
  }

  // get steam path from windows registry
  // @todo: error handling
  const [arch] = os.arch().match(/\d+/);
  const regPath = `HKLM:/SOFTWARE${Number(arch) === 64 && '/Wow6432Node'}/Valve/Steam`;
  const { stdout } = await exec(`Get-ItemPropertyValue -Path '${regPath}' -Name InstallPath`, {
    shell: 'powershell.exe',
  });
  return stdout.trim();
}

/**
 * Get a game's installation root by their enum id.
 *
 * @param enumId    The game enum id.
 * @param steamPath The steam path.
 * @function
 */
export async function discoverGamePath(enumId: string, steamPath?: string) {
  if (!steamPath) {
    steamPath = await discoverSteamPath();
  }

  // get the game app id from its short name
  const id = (() => {
    switch (enumId) {
      case Constants.Game.CS16:
        return Constants.GameSettings.CS16_APPID;
      case Constants.Game.CSS:
        return Constants.GameSettings.CSSOURCE_APPID;
      case Constants.Game.CZERO:
        return Constants.GameSettings.CZERO_APPID;
      default:
        return Constants.GameSettings.CSGO_APPID;
    }
  })();

  // the libraries manifest file contains a dictionary
  // containing installed game enums
  const librariesFileContent = await fs.promises.readFile(
    path.join(steamPath, Constants.GameSettings.STEAM_LIBRARIES_FILE),
    'utf8',
  );
  const { libraryfolders } = VDF.parse(librariesFileContent);

  // find the folder containing the game id
  const library = Object.values(libraryfolders).find((folder: Record<string, unknown>) => {
    return Object.keys(folder.apps).includes(String(id));
  }) as Record<string, unknown>;

  // if none is found, throw an error
  if (!library) {
    throw Error(`${enumId} not found!`);
  }

  // otherwise return the path
  return Promise.resolve(library.path as string);
}

/**
 * Gets the specified game's executable.
 *
 * @param game      The game.
 * @param rootPath  The game's root directory.
 * @function
 */
export function getGameExecutable(game: string, rootPath: string | null) {
  switch (game) {
    case Constants.Game.CS16:
      return path.join(
        rootPath || '',
        Constants.GameSettings.CS16_BASEDIR,
        Constants.GameSettings.CS16_EXE,
      );
    case Constants.Game.CS2:
      return path.join(
        rootPath || '',
        Constants.GameSettings.CS2_BASEDIR,
        Constants.GameSettings.CS2_EXE,
      );
    case Constants.Game.CSS:
      return path.join(
        rootPath || '',
        Constants.GameSettings.CSSOURCE_BASEDIR,
        Constants.GameSettings.CSSOURCE_EXE,
      );
    case Constants.Game.CZERO:
      return path.join(
        rootPath || '',
        Constants.GameSettings.CZERO_BASEDIR,
        Constants.GameSettings.CZERO_EXE,
      );
    default:
      return path.join(
        rootPath || '',
        Constants.GameSettings.CSGO_BASEDIR,
        Constants.GameSettings.CSGO_EXE,
      );
  }
}

/**
 * Gets the specified game's log file.
 *
 * @param game      The game.
 * @param rootPath  The game's root directory.
 * @function
 */
export async function getGameLogFile(game: string, rootPath: string) {
  const basePath = (() => {
    switch (game) {
      case Constants.Game.CS16:
        return path.join(
          rootPath,
          Constants.GameSettings.CS16_BASEDIR,
          Constants.GameSettings.CS16_GAMEDIR,
          Constants.GameSettings.LOGS_DIR,
        );
      case Constants.Game.CS2:
        return path.join(
          rootPath,
          Constants.GameSettings.CS2_BASEDIR,
          Constants.GameSettings.CS2_GAMEDIR,
          Constants.GameSettings.LOGS_DIR,
        );
      case Constants.Game.CSS:
        return path.join(
          rootPath,
          Constants.GameSettings.CSSOURCE_BASEDIR,
          Constants.GameSettings.CSSOURCE_GAMEDIR,
          Constants.GameSettings.LOGS_DIR,
        );
      case Constants.Game.CZERO:
        return path.join(
          rootPath,
          Constants.GameSettings.CZERO_BASEDIR,
          Constants.GameSettings.CZERO_GAMEDIR,
          Constants.GameSettings.LOGS_DIR,
        );
      default:
        return path.join(
          rootPath,
          Constants.GameSettings.CSGO_BASEDIR,
          Constants.GameSettings.CSGO_GAMEDIR,
          Constants.GameSettings.LOGS_DIR,
        );
    }
  })();

  // bail early if the logs path does not exist
  try {
    await fs.promises.access(basePath, fs.constants.F_OK);
  } catch (_) {
    return Promise.resolve('');
  }

  // grab log files and sort by newest
  const files = await glob('*.log', { cwd: basePath, withFileTypes: true, stat: true });
  files.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

  if (!files.length) {
    return '';
  }

  return files[0].fullpath();
}

/**
 * Throws an exception if the specified game is running.
 *
 * @todo        add macos support
 * @param name  The name of the process to look for.
 * @function
 */
export async function isRunningAndThrow(name: string) {
  const { stdout } = await exec('tasklist');
  const isRunning = stdout.includes(path.basename(name));

  if (isRunning && !gameClientProcess) {
    throw new ProcessRunningError(`${name} is running!`);
  }
}

/**
 * The game server.
 *
 * @class
 */
export class Server {
  private baseDir: string;
  private botCommandFile: string;
  private botConfigFile: string;
  private gameDir: string;
  private gameClientProcess: ChildProcessWithoutNullStreams;
  private match: Prisma.MatchGetPayload<typeof Eagers.match>;
  private matchGame: Server['match']['games'][number];
  private motdTxtFile: string;
  private motdHTMLFile: string;
  private profile: Profile;
  private rcon: RCON.Client;
  private scorebot: Scorebot.Watcher;
  private serverConfigFile: string;
  private settings: typeof Constants.Settings;
  private spectating?: boolean;
  private weaponPbxWeight: Record<string, number>;
  public competitors: Server['match']['competitors'];
  public log: log.LogFunctions;
  public result: Scorebot.EventPayloadGameOver;

  /**
   * Tracks the match's scorebot events in memory.
   *
   * @constant
   */
  public scorebotEvents: Array<{
    type: Scorebot.EventIdentifier;
    payload:
      | Scorebot.EventPayloadPlayerAssisted
      | Scorebot.EventPayloadPlayerKilled
      | Scorebot.EventPayloadRoundOver;
  }>;

  /**
   * Constructor.
   *
   * @param profile       The user profile object.
   * @param match         The match object.
   * @param gameOverride  Game override.
   * @param spectating    Whether user is spectating this match.
   */
  constructor(
    profile: Server['profile'],
    match: Server['match'],
    gameOverride?: Constants.Game,
    spectating?: boolean,
  ) {
    // set up plain properties
    this.log = log.scope('gameserver');
    this.match = match;
    this.matchGame = match.games.find((game) => game.status !== Constants.MatchStatus.COMPLETED);
    this.profile = profile;
    this.settings = Util.loadSettings(profile.settings);
    this.scorebotEvents = [];
    this.spectating = Boolean(spectating);

    // handle game override
    if (gameOverride) {
      this.settings.general.game = gameOverride;
    }

    // set up properties dependent on game version
    switch (this.settings.general.game) {
      case Constants.Game.CS16:
        this.baseDir = Constants.GameSettings.CS16_BASEDIR;
        this.botCommandFile = Constants.GameSettings.CS16_BOT_COMMAND_FILE;
        this.botConfigFile = Constants.GameSettings.CS16_BOT_CONFIG;
        this.gameDir = Constants.GameSettings.CS16_GAMEDIR;
        this.motdTxtFile = Constants.GameSettings.CS16_MOTD_TXT_FILE;
        this.motdHTMLFile = Constants.GameSettings.CS16_MOTD_HTML_FILE;
        this.serverConfigFile = Constants.GameSettings.CS16_SERVER_CONFIG_FILE;
        break;
      case Constants.Game.CS2:
        this.baseDir = Constants.GameSettings.CS2_BASEDIR;
        this.botCommandFile = Constants.GameSettings.CSSOURCE_BOT_COMMAND_FILE;
        this.botConfigFile = Constants.GameSettings.CS2_BOT_CONFIG;
        this.gameDir = Constants.GameSettings.CS2_GAMEDIR;
        this.serverConfigFile = Constants.GameSettings.CS2_SERVER_CONFIG_FILE;
        break;
      case Constants.Game.CSS:
        this.baseDir = Constants.GameSettings.CSSOURCE_BASEDIR;
        this.botCommandFile = Constants.GameSettings.CSGO_BOT_COMMAND_FILE;
        this.botConfigFile = Constants.GameSettings.CSSOURCE_BOT_CONFIG;
        this.gameDir = Constants.GameSettings.CSSOURCE_GAMEDIR;
        this.motdTxtFile = Constants.GameSettings.CSSOURCE_MOTD_TXT_FILE;
        this.motdHTMLFile = Constants.GameSettings.CSSOURCE_MOTD_HTML_FILE;
        this.serverConfigFile = Constants.GameSettings.CSSOURCE_SERVER_CONFIG_FILE;
        break;
      case Constants.Game.CZERO:
        this.baseDir = Constants.GameSettings.CZERO_BASEDIR;
        this.botCommandFile = Constants.GameSettings.CZERO_BOT_COMMAND_FILE;
        this.botConfigFile = Constants.GameSettings.CZERO_BOT_CONFIG;
        this.gameDir = Constants.GameSettings.CZERO_GAMEDIR;
        this.motdTxtFile = Constants.GameSettings.CZERO_MOTD_TXT_FILE;
        this.motdHTMLFile = Constants.GameSettings.CZERO_MOTD_HTML_FILE;
        this.serverConfigFile = Constants.GameSettings.CZERO_SERVER_CONFIG_FILE;
        break;
      default:
        this.baseDir = Constants.GameSettings.CSGO_BASEDIR;
        this.botCommandFile = Constants.GameSettings.CSSOURCE_BOT_COMMAND_FILE;
        this.botConfigFile = Constants.GameSettings.CSGO_BOT_CONFIG;
        this.gameDir = Constants.GameSettings.CSGO_GAMEDIR;
        this.serverConfigFile = Constants.GameSettings.CSGO_SERVER_CONFIG_FILE;
        break;
    }

    // build competitors data
    this.competitors = match.competitors.map((competitor) => ({
      ...competitor,
      team: {
        ...competitor.team,
        players: Util.getSquad(
          competitor.team,
          this.profile,
          false,
          this.spectating && Constants.Application.SQUAD_MIN_LENGTH,
        ),
      },
    }));

    // set up weapon preference weights
    this.weaponPbxWeight = {
      [Constants.WeaponTemplate.RIFLE]: Constants.GameSettings.BOT_WEAPONPREFS_PROBABILITY_RIFLE,
      [Constants.WeaponTemplate.SNIPER]: Constants.GameSettings.BOT_WEAPONPREFS_PROBABILITY_SNIPER,
    };
  }

  /**
   * Gets the hostname for the game server.
   *
   * @function
   */
  private get hostname() {
    const { federation, tier } = this.match.competition;
    const idiomaticTierName = Constants.IdiomaticTier[tier.slug];
    return `${tier.league.name}: ${startCase(federation.slug)} | ${idiomaticTierName}`;
  }

  /**
   * Gets the map for the match.
   *
   * @function
   */
  private get map() {
    return this.settings.matchRules.mapOverride || this.matchGame.map;
  }

  /**
   * Determines whether overtime is allowed.
   *
   * @function
   */
  private get overtime() {
    // override if playoff match
    if (!this.match.competition.tier.groupSize) {
      return true;
    }

    return this.settings.matchRules.overtime;
  }

  /**
   * Gets the path to the resources folder depending
   * on the current runtime environment.
   *
   * @function
   */
  private get resourcesPath() {
    return process.env['NODE_ENV'] === 'cli' || is.dev()
      ? path.normalize(path.join(process.env.INIT_CWD, 'src/resources'))
      : process.resourcesPath;
  }

  /**
   * Gets the user's custom launch arguments.
   *
   * @function
   */
  private get userArgs() {
    if (this.settings.general.gameLaunchOptions) {
      return this.settings.general.gameLaunchOptions.split(' ');
    }

    return [];
  }

  /**
   * Cleans up processes and other things after
   * closing the game server or client.
   *
   * @function
   */
  private async cleanup() {
    this.log.info('Cleaning up...');

    // clean up connections to processes and/or files
    await this.scorebot.quit();
    gameClientProcess = null;

    // restore files
    return FileManager.restore(
      path.join(this.settings.general.gamePath, this.baseDir, this.gameDir),
    );
  }

  /**
   * Patches the `configs/bot_names.txt` file for the CSGOBetterBots plugin to
   * pick up Elite-level bots as Pros and improve their aim and behaviors.
   *
   * @note csgo only.
   * @function
   */
  private async generateBetterBotsConfig() {
    // bail early if not csgo
    if (this.settings.general.game !== Constants.Game.CSGO) {
      return;
    }

    // bail early if the bot names txt file is not found
    const original = path.join(
      this.settings.general.gamePath,
      this.baseDir,
      this.gameDir,
      Constants.GameSettings.CSGO_BETTER_BOTS_NAMES_FILE,
    );

    try {
      await fs.promises.access(original, fs.constants.F_OK);
    } catch (error) {
      this.log.warn(error);
      return;
    }

    // find the last occurrence of `}`
    const content = await fs.promises.readFile(original, 'utf8');
    const lastBracketIndex = content.lastIndexOf('}');

    if (lastBracketIndex === -1) {
      this.log.warn('Invalid bot_names.txt format: Missing closing bracket.');
      return;
    }

    // create list of bots that are elite level and
    // add them to the list of pro bot names
    const names = flatten(this.competitors.map((competitor) => competitor.team.players)).map(
      (player) => {
        const xp = new Bot.Exp(JSON.parse(player.stats));
        const difficulty = xp.getBotTemplate().name;

        if (difficulty !== Constants.BotDifficulty.ELITE) {
          return;
        }

        return `"${player.name}"\t\t\t"LIGA"`;
      },
    );

    // bail early if there are no players to insert
    if (!names.length) {
      return;
    }

    // insert new names before the last `}`
    const contentNew =
      content.slice(0, lastBracketIndex) +
      '\t' +
      compact(names).join('\n\t') +
      '\n' +
      content.slice(lastBracketIndex);
    return fs.promises.writeFile(original, contentNew, 'utf8');
  }

  /**
   * Generates the bot config.
   *
   * @function
   */
  private async generateBotConfig() {
    const original = path.join(
      this.settings.general.gamePath,
      this.baseDir,
      this.gameDir,
      this.botConfigFile,
    );
    const template = await fs.promises.readFile(original, 'utf8');
    const [home, away] = this.competitors;
    return fs.promises.writeFile(
      original,
      Sqrl.render(
        template,
        {
          home: home.team.players.map(this.generateBotDifficulty.bind(this)),
          away: away.team.players.map(this.generateBotDifficulty.bind(this)),
        },
        {
          autoEscape: false,
        },
      ),
    );
  }

  /**
   * Generates the bot profile template
   * for the provided player object.
   *
   * @note  The bot profile template uses 8-width tab indentation.
   * @param player The player object.
   * @function
   */
  private generateBotDifficulty(player: Server['competitors'][number]['team']['players'][number]) {
    const xp = new Bot.Exp(JSON.parse(player.stats));
    const difficulty = xp.getBotTemplate().name;
    const weapon = player.weapon as Constants.WeaponTemplate;
    const voice = random(
      Constants.GameSettings.BOT_VOICEPITCH_MIN,
      Constants.GameSettings.BOT_VOICEPITCH_MAX,
    );

    // if no weapon template was selected we pick one for them
    if (!weapon || weapon === Constants.WeaponTemplate.AUTO) {
      return Dedent.dedent`
        ${difficulty}+${Chance.roll(this.weaponPbxWeight)} "${player.name}"
                Skill = ${Math.floor(xp.stats.skill)}
                Aggression = ${Math.floor(xp.stats.aggression)}
                ReactionTime = ${xp.stats.reactionTime.toFixed(1)}
                AttackDelay = ${xp.stats.attackDelay.toFixed(1)}
                VoicePitch = ${voice}
        End\n
      `;
    }

    // otherwise, generate their weapon preferences on the fly
    //
    // we have to first build the base string and then insert the
    // array of weapons using string format otherwise dedent will
    // strip the newline and tab characters from the string.
    const base = Dedent.dedent`
      ${difficulty} "${player.name}"
              Skill = ${Math.floor(xp.stats.skill)}
              Aggression = ${Math.floor(xp.stats.aggression)}
              ReactionTime = ${xp.stats.reactionTime.toFixed(1)}
              AttackDelay = ${xp.stats.attackDelay.toFixed(1)}
              VoicePitch = ${voice}
              %s
      End\n
    `;
    const weaponPrefs = Constants.WeaponTemplates[this.settings.general.game][weapon]
      .map((template) => `WeaponPreference = ${template}`)
      .join('\n\t');
    return util.format(base, weaponPrefs);
  }

  /**
   * Patches the `steam.inf` file to restore
   * CS:GO inventory interactions.
   *
   * Since the file  is controlled client-side we
   * cannot patch it from the SourceMod plugin.
   *
   * @note csgo only.
   * @function
   */
  private async generateInventoryConfig() {
    const original = path.join(
      this.settings.general.gamePath,
      this.baseDir,
      this.gameDir,
      Constants.GameSettings.CSGO_STEAM_INF_FILE,
    );
    const template = await fs.promises.readFile(original, 'utf8');
    const content = template
      .replace(/ClientVersion=[\d]+/g, `ClientVersion=${Constants.GameSettings.CSGO_VERSION}`)
      .replace(/ServerVersion=[\d]+/g, `ServerVersion=${Constants.GameSettings.CSGO_VERSION}`);
    return fs.promises.writeFile(original, content, 'utf8');
  }

  /**
   * Generates the MOTD text file.
   *
   * @note cs16, czero, and css only.
   * @function
   */
  private async generateMOTDConfig() {
    // figure out paths
    const gameBasePath = path.join(this.settings.general.gamePath, this.baseDir, this.gameDir);

    // get team positions
    const [home, away] = this.competitors;
    const [homeStats, awayStats] = [
      this.match.competition.competitors.find((competitor) => competitor.teamId === home.teamId),
      this.match.competition.competitors.find((competitor) => competitor.teamId === away.teamId),
    ];

    // generate the motd text file which simply redirects
    // to the html one and bypasses the 1KB file limit
    const txtSource = path.join(gameBasePath, this.motdTxtFile);
    const txtTemplate = await fs.promises.readFile(txtSource, 'utf8');
    const txtContent = Sqrl.render(txtTemplate, {
      target: path.join(gameBasePath, this.motdHTMLFile),
    });

    // generate the motd html file
    const htmlSource = path.join(gameBasePath, this.motdHTMLFile);
    const htmlTemplate = await fs.promises.readFile(htmlSource, 'utf8');
    const htmlContent = Sqrl.render(htmlTemplate, {
      title: this.hostname.split('|')[0],
      subtitle: this.hostname.split('|')[1],
      stage:
        !this.match.competition.tier.groupSize &&
        Util.parseCupRounds(this.match.round, this.match.totalRounds),
      home: {
        name: home.team.name,
        subtitle: this.match.competition.tier.groupSize
          ? Util.toOrdinalSuffix(homeStats.position)
          : Constants.IdiomaticTier[Constants.Prestige[home.team.tier]],
        logo: await this.getTeamLogo(home.team.blazon),
      },
      away: {
        name: away.team.name,
        subtitle: this.match.competition.tier.groupSize
          ? Util.toOrdinalSuffix(awayStats.position)
          : Constants.IdiomaticTier[Constants.Prestige[away.team.tier]],
        logo: await this.getTeamLogo(away.team.blazon),
      },
      standings:
        this.match.competition.tier.groupSize &&
        this.match.competition.competitors
          .filter((competitor) => competitor.group === homeStats.group)
          .sort((a, b) => a.position - b.position),
    });

    // generate both motd files
    return Promise.all([
      fs.promises.writeFile(txtSource, txtContent),
      fs.promises.writeFile(htmlSource, htmlContent),
    ]);
  }

  /**
   * Patches the scoreboard so that it doesn't show BOT
   * in the prefix or ping column for the players.
   *
   * Since the prefix is controlled client-side we
   * cannot patch it from the SourceMod plugin.
   *
   * @note csgo only.
   * @function
   */
  private async generateScoreboardConfig() {
    const original = path.join(
      this.settings.general.gamePath,
      this.baseDir,
      this.gameDir,
      Constants.GameSettings.CSGO_LANGUAGE_FILE,
    );
    const template = await fs.promises.readFile(original, 'utf16le');
    const content = template
      .replace(/"SFUI_bot_decorated_name"[\s]+"BOT %s1"/g, '"SFUI_bot_decorated_name" "%s1"')
      .replace(/"SFUI_scoreboard_lbl_bot"[\s]+"BOT"/g, '"SFUI_scoreboard_lbl_bot" "5"');
    return fs.promises.writeFile(original, content, 'utf16le');
  }

  /**
   * Generates the server configuration file.
   *
   * @function
   */
  private async generateServerConfig() {
    // set up the server config paths
    const original = path.join(
      this.settings.general.gamePath,
      this.baseDir,
      this.gameDir,
      this.serverConfigFile,
    );
    const template = await fs.promises.readFile(original, 'utf8');

    // set up the bot command config paths
    const botCommandOriginal = path.join(
      this.settings.general.gamePath,
      this.baseDir,
      this.gameDir,
      this.botCommandFile,
    );
    const botsCommandTemplate = await fs.promises.readFile(botCommandOriginal, 'utf8');

    // get team positions
    const [home, away] = this.competitors;
    const [homeStats, awayStats] = [
      this.match.competition.competitors.find((competitor) => competitor.teamId === home.teamId),
      this.match.competition.competitors.find((competitor) => competitor.teamId === away.teamId),
    ];

    // generate bot commands
    const bots = flatten(
      this.competitors.map((competitor, idx) =>
        competitor.team.players.map((player) => {
          // difficulty modifiers do not apply to the user's
          // team unless they are in spectating mode
          if (
            this.settings.general.botDifficulty &&
            (competitor.teamId !== this.profile.teamId || this.spectating)
          ) {
            player.stats = JSON.stringify(
              Bot.Templates.find(
                (template) => template.name === this.settings.general.botDifficulty,
              ).stats,
            );
          }

          const xp = new Bot.Exp(JSON.parse(player.stats));
          return {
            difficulty: xp.getBotTemplate().difficulty,
            name: player.name,
            team: idx === 0 ? 't' : 'ct',
          };
        }),
      ),
    );

    // write the config files
    return Promise.all([
      fs.promises.writeFile(
        botCommandOriginal,
        Sqrl.render(botsCommandTemplate, { bots }, { autoEscape: false }),
      ),
      fs.promises.writeFile(
        original,
        Sqrl.render(template, {
          // general
          demo: true,
          freezetime: this.settings.matchRules.freezeTime,
          hostname: this.hostname,
          maxrounds: this.settings.matchRules.maxRounds,
          ot: +this.overtime,
          rcon_password: Constants.GameSettings.RCON_PASSWORD,
          teamname_t: home.team.name,
          teamname_ct: away.team.name,
          gameover_delay: Constants.GameSettings.SERVER_CVAR_GAMEOVER_DELAY,
          bot_chatter: this.settings.general.botChatter,
          spectating: +this.spectating,

          // csgo only
          match_stat: this.match.competition.tier.name,
          teamflag_t: home.team.country.code,
          teamflag_ct: away.team.country.code,
          shortname_t: home.team.slug,
          shortname_ct: away.team.slug,
          stat_t: Util.toOrdinalSuffix(homeStats.position),
          stat_ct: Util.toOrdinalSuffix(awayStats.position),
        }),
      ),
    ]);
  }

  /**
   * Generates the VPK for game customizations.
   *
   * @function
   */
  private async generateVPK() {
    // create the temp folder we'll be making the VPK from
    const vpkSource = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'liga'));

    // copy bot profile
    const botProfilePath = path.join(
      this.settings.general.gamePath,
      this.baseDir,
      this.gameDir,
      this.botConfigFile,
    );

    try {
      await fs.promises.copyFile(
        botProfilePath,
        path.join(vpkSource, path.basename(botProfilePath)),
      );
    } catch (error) {
      this.log.error(error);
    }

    // copy the language file with the patched bot prefix names
    //
    // @todo: extract the language file from the cs2 vpk
    const languageFileSource = path.join(
      PluginManager.getPath(),
      Constants.Game.CS2,
      Constants.GameSettings.CSGO_LANGUAGE_FILE,
    );
    const languageFileTarget = path.join(vpkSource, Constants.GameSettings.CSGO_LANGUAGE_FILE);
    await FileManager.touch(languageFileTarget);
    await fs.promises.copyFile(languageFileSource, languageFileTarget);

    // generate the vpk
    const vpk = new VPK.Parser(vpkSource);
    await vpk.create();

    // copy the vpk over to the game dir
    const vpkTarget = path.join(path.dirname(botProfilePath), Constants.GameSettings.CS2_VPK_FILE);

    try {
      await FileManager.touch(vpkTarget);
      await fs.promises.copyFile(vpkSource + '.vpk', vpkTarget);
    } catch (error) {
      this.log.error(error);
    }

    // clean up
    return Promise.all([
      fs.promises.rm(vpkSource, { recursive: true }),
      fs.promises.rm(vpkSource + '.vpk', { recursive: true }),
    ]);
  }

  /**
   * Patches the `gameinfo.gi` file so that it
   * can load our various game customizations
   *
   * @function
   */
  private async generateVPKGameInfo() {
    const original = path.join(
      this.settings.general.gamePath,
      this.baseDir,
      this.gameDir,
      Constants.GameSettings.CS2_GAMEINFO_FILE,
    );

    // create a backup of this file which will be restored later on
    await fs.promises.copyFile(original, original + '.bak');

    // patch the `gameinfo.gi` file and append our custom vpk
    const template = await fs.promises.readFile(original, 'utf8');
    const content = template.replace(
      /(Game_LowViolence.+)/g,
      '$1\n\t\t\tGame\tcsgo/' + Constants.GameSettings.CS2_VPK_FILE,
    );
    return fs.promises.writeFile(original, content, 'utf8');
  }

  /**
   * Gets the local ip address.
   *
   * @function
   */
  private getLocalIP() {
    const allAddresses: Array<string> = [];
    const interfaces = os.networkInterfaces();

    Object.keys(interfaces).forEach((name) => {
      interfaces[name].forEach((networkInterface) => {
        if (networkInterface.family !== 'IPv4') {
          return;
        }

        allAddresses.push(networkInterface.address);
      });
    });

    const [localAddress] = uniq(allAddresses.sort()).filter((IP) => IP !== '127.0.0.1');
    return localAddress;
  }

  /**
   * Gets the file path to a team's logo/blazon.
   *
   * @param uri       The uri of the logo/blazon.
   * @param useBase64 Return as a base64-encoded string.
   * @function
   */
  private async getTeamLogo(uri: string, useBase64 = true) {
    const { protocol, filePath } = /^(?<protocol>.+):\/\/(?<filePath>.+)/g.exec(uri).groups;

    if (!protocol || !filePath) {
      return '';
    }

    // custom logos are not supported in cli mode
    if (process.env['NODE_ENV'] === 'cli' && protocol === 'custom') {
      return '';
    }

    // figure out the path to the file
    let logoPath = '';

    switch (protocol) {
      case 'resources':
        logoPath = path.join(this.resourcesPath, filePath);
        break;
      case 'custom':
        logoPath = path.join(app.getPath('userData'), protocol, filePath);
        break;
    }

    if (useBase64) {
      return fs.promises.readFile(logoPath, {
        encoding: 'base64',
      });
    }

    return logoPath;
  }

  /**
   * This is only needed because cs2 will sometimes
   * not log to file if the logs directory doesn't
   * already exist before launching.
   *
   * @todo hopefully this can be removed... oneday.
   * @function
   */
  private async initLogsDir() {
    const logsPath = path.join(
      this.settings.general.gamePath,
      Constants.GameSettings.CS2_BASEDIR,
      Constants.GameSettings.CS2_GAMEDIR,
      Constants.GameSettings.LOGS_DIR,
    );

    try {
      await fs.promises.mkdir(logsPath, { recursive: true });
    } catch (error) {
      this.log.warn(error);
    }
  }

  /**
   * Launches the CS16 game client.
   *
   * @function
   */
  private async launchClientCS16() {
    // launch the client
    gameClientProcess = spawn(
      Constants.GameSettings.CS16_EXE,
      [
        '-game',
        Constants.GameSettings.CS16_GAMEDIR,
        '-dll',
        Constants.GameSettings.CS16_DLL_METAMOD,
        '-beta',
        '-bots',
        '+localinfo',
        'mm_gamedll',
        Constants.GameSettings.CS16_DLL_BOTS,
        '+ip',
        this.getLocalIP(),
        '+maxplayers',
        '12',
        '+map',
        Util.convertMapPool(this.map, this.settings.general.game),
        ...this.userArgs,
      ],
      { cwd: path.join(this.settings.general.gamePath, Constants.GameSettings.CS16_BASEDIR) },
    );

    gameClientProcess.on('close', this.cleanup.bind(this));
    return Promise.resolve();
  }

  /**
   * Launches the CS2 game client.
   *
   * @function
   */
  private launchClientCS2() {
    // launch the client
    gameClientProcess = spawn(
      Constants.GameSettings.CS2_EXE,
      [
        '+map',
        Util.convertMapPool(this.map, this.settings.general.game),
        '+game_mode',
        '1',
        '-novid',
        '-usercon',
        '-insecure',
        '-novid',
        '-maxplayers_override',
        '12',
        '+exec',
        Constants.GameSettings.CS2_SERVER_CONFIG_FILE,
        ...this.userArgs,
      ],
      { cwd: path.join(this.settings.general.gamePath, Constants.GameSettings.CS2_BASEDIR) },
    );

    gameClientProcess.on('close', this.cleanup.bind(this));
    return Promise.resolve();
  }

  /**
   * Launches the CSGO game client.
   *
   * @function
   */
  private launchClientCSGO() {
    // build default launch args
    const defaultArgs = [
      '+map',
      this.map,
      '+game_mode',
      '1',
      '-novid',
      '-usercon',
      '-maxplayers_override',
      '12',
      '+exec',
      Constants.GameSettings.CSGO_SERVER_CONFIG_FILE,
    ];

    // this is a temporary workaround until cs2 fully supports custom bot names
    // and proper logging output like being able to specify log
    // location and dumping end of match statistics
    const fixedSteamPath = path.join(
      this.settings.general.gamePath,
      Constants.GameSettings.CSGO_BASEDIR,
    );
    defaultArgs.unshift('-insecure');

    if (is.osx()) {
      gameClientProcess = spawn(
        'open',
        [`steam://rungameid/${Constants.GameSettings.CSGO_APPID}//'${defaultArgs.join(' ')}'`],
        { shell: true },
      );
    } else {
      gameClientProcess = spawn(
        Constants.GameSettings.CSGO_EXE,
        [
          '-applaunch',
          Constants.GameSettings.CSGO_APPID.toString(),
          ...defaultArgs,
          ...this.userArgs,
        ],
        { cwd: fixedSteamPath },
      );
    }

    gameClientProcess.on('close', this.cleanup.bind(this));
    return Promise.resolve();
  }

  /**
   * Launches the CSS game client.
   *
   * @function
   */
  private launchClientCSS() {
    const commonFlags = [
      '-usercon',
      '-insecure',
      '-novid',
      '+ip',
      this.getLocalIP(),
      '+map',
      Util.convertMapPool(this.map, this.settings.general.game),
      '+maxplayers',
      '12',
      ...this.userArgs,
    ];

    if (is.osx()) {
      gameClientProcess = spawn(
        'open',
        [`steam://rungameid/${Constants.GameSettings.CSSOURCE_APPID}//'${commonFlags.join(' ')}'`],
        { shell: true },
      );
    } else {
      gameClientProcess = spawn(
        Constants.GameSettings.CSSOURCE_EXE,
        ['-game', Constants.GameSettings.CSSOURCE_GAMEDIR, ...commonFlags],
        {
          cwd: path.join(this.settings.general.gamePath, Constants.GameSettings.CSSOURCE_BASEDIR),
        },
      );
    }

    gameClientProcess.on('close', this.cleanup.bind(this));
    return Promise.resolve();
  }

  /**
   * Launches the CZERO game client.
   *
   * @function
   */
  private async launchClientCZERO() {
    // launch the client
    gameClientProcess = spawn(
      Constants.GameSettings.CZERO_EXE,
      [
        '-game',
        Constants.GameSettings.CZERO_GAMEDIR,
        '-dll',
        Constants.GameSettings.CZERO_DLL_METAMOD,
        '-beta',
        '+localinfo',
        'mm_gamedll',
        Constants.GameSettings.CZERO_DLL_BOTS,
        '+ip',
        this.getLocalIP(),
        '+maxplayers',
        '12',
        '+map',
        Util.convertMapPool(this.map, this.settings.general.game),
        ...this.userArgs,
      ],
      { cwd: path.join(this.settings.general.gamePath, Constants.GameSettings.CZERO_BASEDIR) },
    );

    gameClientProcess.on('close', this.cleanup.bind(this));

    return Promise.resolve();
  }

  /**
   * Sets up and configures the files that are
   * necessary for the game server to run.
   *
   * @function
   */
  private async prepare() {
    // certain games have a different dirname from their game name
    // so we must make sure to alias them correctly below
    const localGameDir = (() => {
      switch (this.settings.general.game) {
        case Constants.Game.CS2:
          return 'cs2';
        case Constants.Game.CSS:
          return 'cssource';
        default:
          return this.gameDir;
      }
    })();
    const from = path.join(PluginManager.getPath(), localGameDir);
    const to = path.join(this.settings.general.gamePath, this.baseDir, this.gameDir);

    // find and extract zip files
    const zipFiles = await glob('**/*.zip', { cwd: from });
    await Promise.all(zipFiles.map((file) => FileManager.extract(path.join(from, file), to)));

    // copy plain files
    await FileManager.copy('**/!(*.zip)', from, to);

    // generate server and bot configs
    await this.generateServerConfig();
    await this.generateBotConfig();

    // configure game files
    switch (this.settings.general.game) {
      case Constants.Game.CS16:
      case Constants.Game.CSS:
      case Constants.Game.CZERO:
        await this.generateMOTDConfig();
        break;
      case Constants.Game.CS2:
        await this.generateVPK();
        await this.generateVPKGameInfo();
        await this.initLogsDir();
        break;
      default:
        await this.generateInventoryConfig();
        await this.generateScoreboardConfig();
        await this.generateBetterBotsConfig();
        break;
    }
  }

  /**
   * Starts the game client.
   *
   * If CS16 is enabled, also starts the game server.
   *
   * @function
   */
  public async start(): Promise<void> {
    // prep files
    await this.prepare();

    // launch clients
    switch (this.settings.general.game) {
      case Constants.Game.CS16:
        await this.launchClientCS16();
        break;
      case Constants.Game.CS2:
        await this.launchClientCS2();
        break;
      case Constants.Game.CSS:
        await this.launchClientCSS();
        break;
      case Constants.Game.CZERO:
        await this.launchClientCZERO();
        break;
      default:
        await this.launchClientCSGO();
        break;
    }

    // connect to rcon
    this.rcon = new RCON.Client(
      this.getLocalIP(),
      Constants.GameSettings.RCON_PORT,
      Constants.GameSettings.RCON_PASSWORD,
      {
        tcp:
          this.settings.general.game !== Constants.Game.CS16 &&
          this.settings.general.game !== Constants.Game.CZERO,
        retryMax: Constants.GameSettings.RCON_MAX_ATTEMPTS,
      },
    );

    try {
      await this.rcon.init();
    } catch (error) {
      this.log.warn(error);
    }

    // start the scorebot
    this.scorebot = new Scorebot.Watcher(
      await getGameLogFile(this.settings.general.game, this.settings.general.gamePath),
    );

    try {
      await this.scorebot.start();
    } catch (error) {
      this.log.error(error);
      throw error;
    }

    // set up game event handlers
    this.scorebot.on(Scorebot.EventIdentifier.PLAYER_ASSISTED, (payload) =>
      this.scorebotEvents.push({ type: Scorebot.EventIdentifier.PLAYER_ASSISTED, payload }),
    );
    this.scorebot.on(Scorebot.EventIdentifier.PLAYER_KILLED, (payload) =>
      this.scorebotEvents.push({ type: Scorebot.EventIdentifier.PLAYER_KILLED, payload }),
    );
    this.scorebot.on(Scorebot.EventIdentifier.ROUND_OVER, (payload) =>
      this.scorebotEvents.push({ type: Scorebot.EventIdentifier.ROUND_OVER, payload }),
    );

    // @todo: remove when a liga source2mod or cssharp mod is implemented
    this.scorebot.on(Scorebot.EventIdentifier.SAY, async (payload) => {
      if (payload === '.ready' && this.settings.general.game === Constants.Game.CS2) {
        this.rcon.send('mp_warmup_end');
      }
    });
    this.scorebot.on(Scorebot.EventIdentifier.PLAYER_ENTERED, async () => {
      if (this.settings.general.game === Constants.Game.CS2) {
        // small delay to avoid running this command too early
        await Util.sleep(Constants.GameSettings.SERVER_CVAR_GAMEOVER_DELAY * 500);
        this.rcon.send('exec liga-bots');
      }
    });

    // scorebot game over handler resolves our promise
    return new Promise((resolve) => {
      this.scorebot.on(Scorebot.EventIdentifier.GAME_OVER, async (payload) => {
        // on cs2 we must sleep for 5s and quit
        //
        // @todo: remove when a liga source2mod or cssharp mod is implemented
        if (this.settings.general.game === Constants.Game.CS2) {
          await Util.sleep(Constants.GameSettings.SERVER_CVAR_GAMEOVER_DELAY * 1000);
          await this.rcon.send('quit');
        }

        // in csgo and cs2, overtimes affect the order of the final
        // scores reported so we must swap them accordingly
        if (
          this.settings.general.game === Constants.Game.CS2 ||
          this.settings.general.game === Constants.Game.CSGO
        ) {
          const totalRoundsPlayed = payload.score.reduce((a, b) => a + b, 0);

          if (totalRoundsPlayed > this.settings.matchRules.maxRounds) {
            const totalRoundsOvertime = totalRoundsPlayed - this.settings.matchRules.maxRounds;
            const overtimeCount = Math.ceil(totalRoundsOvertime / 6);

            // swap score if overtime count is odd
            if (overtimeCount % 2 === 1) {
              payload.score.reverse();
            }
          }
        }

        this.log.info('Final result: %O', payload);
        this.result = payload;
        resolve();
      });
    });
  }
}
