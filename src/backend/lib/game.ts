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
import * as VDF from '@node-steam/vdf';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import util from 'node:util';
import is from 'electron-is';
import log from 'electron-log';
import dedent from 'dedent';
import { spawn, ChildProcessWithoutNullStreams, exec as execSync } from 'node:child_process';
import { app } from 'electron';
import { glob } from 'glob';
import { Prisma, Profile } from '@prisma/client';
import { flatten, random, startCase, uniq } from 'lodash';
import { Constants, Bot, Chance, Util, Eagers } from '@liga/shared';

/**
 * Promisified version of `exec`.
 *
 * @constant
 */
const exec = util.promisify(execSync);

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
export function getGameLogFile(game: string, rootPath: string | null) {
  switch (game) {
    case Constants.Game.CS16:
      return path.join(
        rootPath || '',
        Constants.GameSettings.CS16_BASEDIR,
        Constants.GameSettings.CS16_LOGFILE,
      );
    case Constants.Game.CSS:
      return path.join(
        rootPath || '',
        Constants.GameSettings.CSSOURCE_BASEDIR,
        Constants.GameSettings.CSSOURCE_GAMEDIR,
        Constants.GameSettings.CSSOURCE_LOGFILE,
      );
    default:
      return path.join(
        rootPath || '',
        Constants.GameSettings.CSGO_BASEDIR,
        Constants.GameSettings.CSGO_GAMEDIR,
        Constants.GameSettings.CSGO_LOGFILE,
      );
  }
}

/**
 * The game server.
 *
 * @class
 */
export class Server {
  private allowDraw: boolean;
  private baseDir: string;
  private botCommandFile: string;
  private botConfigFile: string;
  private gameDir: string;
  private gameClientProcess: ChildProcessWithoutNullStreams;
  private logFile: string;
  private match: Prisma.MatchGetPayload<typeof Eagers.match>;
  private motdTxtFile: string;
  private motdHTMLFile: string;
  private profile: Profile;
  private rcon: RCON.Client;
  private scorebot: Scorebot.Watcher;
  private serverConfigFile: string;
  private settings: typeof Constants.Settings;
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

  constructor(profile: Server['profile'], match: Server['match'], gameOverride?: Constants.Game) {
    // set up plain properties
    this.allowDraw = false;
    this.log = log.scope('gameserver');
    this.match = match;
    this.profile = profile;
    this.settings = Util.loadSettings(profile.settings);
    this.scorebotEvents = [];

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
        this.logFile = Constants.GameSettings.CS16_LOGFILE;
        this.motdTxtFile = Constants.GameSettings.CS16_MOTD_TXT_FILE;
        this.motdHTMLFile = Constants.GameSettings.CS16_MOTD_HTML_FILE;
        this.serverConfigFile = Constants.GameSettings.CS16_SERVER_CONFIG_FILE;
        break;
      case Constants.Game.CSS:
        this.baseDir = Constants.GameSettings.CSSOURCE_BASEDIR;
        this.botCommandFile = Constants.GameSettings.CSGO_BOT_COMMAND_FILE;
        this.botConfigFile = Constants.GameSettings.CSSOURCE_BOT_CONFIG;
        this.gameDir = Constants.GameSettings.CSSOURCE_GAMEDIR;
        this.logFile = Constants.GameSettings.CSSOURCE_LOGFILE;
        this.motdTxtFile = Constants.GameSettings.CSSOURCE_MOTD_TXT_FILE;
        this.motdHTMLFile = Constants.GameSettings.CSSOURCE_MOTD_HTML_FILE;
        this.serverConfigFile = Constants.GameSettings.CSSOURCE_SERVER_CONFIG_FILE;
        break;
      case Constants.Game.CZERO:
        this.baseDir = Constants.GameSettings.CZERO_BASEDIR;
        this.botCommandFile = Constants.GameSettings.CZERO_BOT_COMMAND_FILE;
        this.botConfigFile = Constants.GameSettings.CZERO_BOT_CONFIG;
        this.gameDir = Constants.GameSettings.CZERO_GAMEDIR;
        this.logFile = Constants.GameSettings.CZERO_LOGFILE;
        this.motdTxtFile = Constants.GameSettings.CZERO_MOTD_TXT_FILE;
        this.motdHTMLFile = Constants.GameSettings.CZERO_MOTD_HTML_FILE;
        this.serverConfigFile = Constants.GameSettings.CZERO_SERVER_CONFIG_FILE;
        break;
      default:
        this.baseDir = Constants.GameSettings.CSGO_BASEDIR;
        this.botCommandFile = Constants.GameSettings.CSSOURCE_BOT_COMMAND_FILE;
        this.botConfigFile = Constants.GameSettings.CSGO_BOT_CONFIG;
        this.gameDir = Constants.GameSettings.CSGO_GAMEDIR;
        this.logFile = Constants.GameSettings.CSGO_LOGFILE;
        this.serverConfigFile = Constants.GameSettings.CSGO_SERVER_CONFIG_FILE;
        break;
    }

    // trim and remove user from team squad
    this.competitors = match.competitors.map((competitor) => ({
      ...competitor,
      team: {
        ...competitor.team,
        players: Util.getSquad(competitor.team, this.profile),
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
    const [game1] = this.match.games;
    return this.settings.matchRules.mapOverride || game1.map;
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
   * Cleans up processes and other things after
   * closing the game server or client.
   *
   * @function
   */
  private async cleanup() {
    this.log.info('Cleaning up...');

    // clean up connections to processes and/or files
    await this.scorebot.quit();

    // restore files
    return FileManager.restore(
      path.join(this.settings.general.gamePath, this.baseDir, this.gameDir),
    );
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
      return dedent`
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
    const base = dedent`
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
          // only check for difficulty modifier for cpu's team
          if (this.settings.general.botDifficulty && competitor.teamId !== this.profile.teamId) {
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
          logfile: this.logFile,
          maxrounds: this.settings.matchRules.maxRounds,
          ot: +this.allowDraw,
          rcon_password: Constants.GameSettings.RCON_PASSWORD,
          teamname_t: home.team.name,
          teamname_ct: away.team.name,
          gameover_delay: Constants.GameSettings.SERVER_CVAR_GAMEOVER_DELAY,
          bot_chatter: this.settings.general.botChatter,

          // csgo only
          match_stat: this.match.competition.tier.name,
          teamflag_t: home.team.country.code,
          teamflag_ct: away.team.country.code,
          shortname_t: home.team.slug,
          shortname_ct: away.team.slug,
          stat_t: homeStats.position,
          stat_ct: awayStats.position,
        }),
      ),
    ]);
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
   * @param uri The uri of the logo/blazon.
   * @function
   */
  private async getTeamLogo(uri: string) {
    const { protocol, filePath } = /^(?<protocol>.+):\/\/(?<filePath>.+)/g.exec(uri).groups;

    if (!protocol || !filePath) {
      return '';
    }

    // custom logos are not supported in cli mode
    if (process.env['NODE_ENV'] === 'cli' && protocol === 'custom') {
      return '';
    }

    switch (protocol) {
      case 'resources':
        return fs.promises.readFile(path.join(this.resourcesPath, filePath), {
          encoding: 'base64',
        });
      case 'custom':
        return fs.promises.readFile(path.join(app.getPath('userData'), protocol, filePath), {
          encoding: 'base64',
        });
    }
  }

  /**
   * Launches the CS16 game client.
   *
   * @function
   */
  private async launchClientCS16() {
    // launch the client
    this.gameClientProcess = spawn(
      Constants.GameSettings.CS16_EXE,
      [
        '-game',
        Constants.GameSettings.CS16_GAMEDIR,
        '-dll',
        Constants.GameSettings.CS16_DLL_METAMOD,
        '-beta',
        '-bots',
        '-condebug',
        '+localinfo',
        'mm_gamedll',
        Constants.GameSettings.CS16_DLL_BOTS,
        '+ip',
        this.getLocalIP(),
        '+maxplayers',
        '12',
        '+map',
        Util.convertMapPool(this.map, this.settings.general.game),
      ],
      { cwd: path.join(this.settings.general.gamePath, Constants.GameSettings.CS16_BASEDIR) },
    );

    this.gameClientProcess.on('close', this.cleanup.bind(this));
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

    // user-defined launch args
    let userArgs: Array<string> = [];
    if (this.settings.general.gameLaunchOptions) {
      userArgs = this.settings.general.gameLaunchOptions.split(' ');
    }

    // this is a temporary workaround until cs2 fully supports custom bot names
    // and proper logging output like being able to specify log
    // location and dumping end of match statistics
    const fixedSteamPath = path.join(
      this.settings.general.gamePath,
      Constants.GameSettings.CSGO_BASEDIR,
    );
    defaultArgs.unshift('-insecure');

    if (is.osx()) {
      this.gameClientProcess = spawn(
        'open',
        [`steam://rungameid/${Constants.GameSettings.CSGO_APPID}//'${defaultArgs.join(' ')}'`],
        { shell: true },
      );
    } else {
      this.gameClientProcess = spawn(
        Constants.GameSettings.CSGO_EXE,
        ['-applaunch', Constants.GameSettings.CSGO_APPID.toString(), ...defaultArgs, ...userArgs],
        { cwd: fixedSteamPath },
      );
    }

    this.gameClientProcess.on('close', this.cleanup.bind(this));
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
    ];

    if (is.osx()) {
      this.gameClientProcess = spawn(
        'open',
        [`steam://rungameid/${Constants.GameSettings.CSSOURCE_APPID}//'${commonFlags.join(' ')}'`],
        { shell: true },
      );
    } else {
      this.gameClientProcess = spawn(
        Constants.GameSettings.CSSOURCE_EXE,
        ['-game', Constants.GameSettings.CSSOURCE_GAMEDIR, ...commonFlags],
        {
          cwd: path.join(this.settings.general.gamePath, Constants.GameSettings.CSSOURCE_BASEDIR),
        },
      );
    }

    this.gameClientProcess.on('close', this.cleanup.bind(this));
    return Promise.resolve();
  }

  /**
   * Launches the CZERO game client.
   *
   * @function
   */
  private async launchClientCZERO() {
    // launch the client
    this.gameClientProcess = spawn(
      Constants.GameSettings.CZERO_EXE,
      [
        '-game',
        Constants.GameSettings.CZERO_GAMEDIR,
        '-dll',
        Constants.GameSettings.CZERO_DLL_METAMOD,
        '-beta',
        '-condebug',
        '+localinfo',
        'mm_gamedll',
        Constants.GameSettings.CZERO_DLL_BOTS,
        '+ip',
        this.getLocalIP(),
        '+maxplayers',
        '12',
        '+map',
        Util.convertMapPool(this.map, this.settings.general.game),
      ],
      { cwd: path.join(this.settings.general.gamePath, Constants.GameSettings.CZERO_BASEDIR) },
    );

    this.gameClientProcess.on('close', this.cleanup.bind(this));

    return Promise.resolve();
  }

  /**
   * Sets up and configures the files that are
   * necessary for the game server to run.
   *
   * @function
   */
  private async prepare() {
    // cs16 and css have the same `gamedir` value of `cstrike`
    // so alias `css` to `cssource` only when copying the
    // files from the resources dir to the steam dir
    const localGameDir = (() => {
      switch (this.settings.general.game) {
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

    // configure game files
    switch (this.settings.general.game) {
      case Constants.Game.CS16:
      case Constants.Game.CSS:
      case Constants.Game.CZERO:
        await this.generateMOTDConfig();
        break;
      default:
        await this.generateInventoryConfig();
        await this.generateScoreboardConfig();
        break;
    }

    // generate server and bot configs
    await this.generateServerConfig();
    await this.generateBotConfig();
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
        tcp: this.settings.general.game !== Constants.Game.CS16,
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
      path.join(
        this.settings.general.gamePath,
        this.baseDir,
        this.settings.general.game === Constants.Game.CS16 ||
          this.settings.general.game === Constants.Game.CZERO
          ? ''
          : this.gameDir,
        this.logFile,
      ),
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

    // scorebot game over handler resolves our promise
    return new Promise((resolve) => {
      this.scorebot.on(Scorebot.EventIdentifier.GAME_OVER, (payload) => {
        this.log.info('Final result: %O', payload);
        this.result = payload;
        resolve();
      });
    });
  }
}
