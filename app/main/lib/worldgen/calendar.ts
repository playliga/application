import * as Sqrl from 'squirrelly';
import * as IPCRouting from 'shared/ipc-routing';
import * as Models from 'main/database/models';
import * as WGCompetition from './competition';
import { flatten } from 'lodash';
import { ActionQueueTypes, CompTypes } from 'shared/enums';
import { League } from 'main/lib/league';
import moment from 'moment';
import ItemLoop from 'main/lib/item-loop';
import ScreenManager from 'main/lib/screen-manager';
import Application from 'main/constants/application';
import EmailDialogue from 'main/constants/emaildialogue';
import Score from './score';


/**
 * Helper functions
 */

async function bumpDate() {
  const profile = await Models.Profile.getActiveProfile();
  const today = moment( profile.currentDate );
  profile.currentDate = today.add( 1, 'day' ).toDate();
  return profile.save();
}


// ---------------------------
// ITEM LOOP MODULE MIDDLEWARE
// ---------------------------

const itemloop = new ItemLoop.ItemLoop();


/**
 * Runs at the beginning and end of every tick.
 */

// gets the items we'll be iterating thru
itemloop.register( ItemLoop.MiddlewareType.INIT, async () => {
  const profile = await Models.Profile.getActiveProfile();
  const queue = await Models.ActionQueue.findAll({
    where: { actionDate: profile.currentDate, completed: false }
  });

  return Promise.resolve( queue );
});


// bumps the current date
itemloop.register( ItemLoop.MiddlewareType.END, () => {
  return bumpDate();
});


/**
 * runs after all items in the tick are executed.
 * this can be declared several times.
 */

// marks the items as completed and lets the
// front-end know this iteration is done
itemloop.register( null, async ( items: Models.ActionQueue[] ) => {
  // update the completed items
  await Promise.all( items.map( i => i.update({ completed: true }) ) );

  // fetch a fresh profile in case of transfer moves
  const profile = await Models.Profile.getActiveProfile();

  // send the updated profile to the renderer
  ScreenManager
    .getScreenById( IPCRouting.Main._ID )
    .handle
    .webContents
    .send(
      IPCRouting.Database.PROFILE_GET,
      JSON.stringify( profile )
    )
  ;

  return Promise.resolve();
});


/**
 * the types of jobs that can run on every tick
 */

itemloop.register( ActionQueueTypes.PRESEASON_AUTOADD_COMP, async () => {
  // check if this dude has joined any competitions
  const profile = await Models.Profile.getActiveProfile();
  const today = moment( profile.currentDate );
  const tomorrow = today.add( 1, 'day' );
  const joined = profile.Team.Competitions.length > 0;

  if( joined ) {
    return Promise.resolve();
  }

  // grab competition within same region as the user
  const region = profile.Team.Country.Continent;
  const compobj = await Models.Competition.findOne({
    include: [
      { model: Models.Team },
      {
        model: Models.Continent,
        where: { id: region.id }
      },
      {
        model: Models.Comptype,
        where: { name: CompTypes.LEAGUE }
      }
    ]
  });

  // add user to competition
  const leagueobj = League.restore( compobj.data );
  const divid = leagueobj.divisions.length - 1;

  // if the division length is already maxxed out then
  // remove the last team to make room for the user
  if( leagueobj.divisions[ divid ].size === leagueobj.divisions[ divid ].competitors.length ) {
    const lastteam = leagueobj.divisions[ divid ].competitors[ leagueobj.divisions[ divid ].competitors.length - 1 ];
    leagueobj.divisions[ divid ].removeCompetitor( lastteam.id );
    await compobj.removeTeam( compobj.Teams.find( t => t.id === lastteam.id ));
  }

  // save changes to db
  leagueobj.divisions[ divid ].addCompetitor( profile.Team.id, profile.Team.name );
  compobj.data = leagueobj.save();

  await compobj.save();
  await compobj.addTeam( profile.Team );

  // let the user know we've added to a competition
  const persona = await Models.Persona.getManagerByTeamId( profile.Team.id, 'Assistant Manager' );

  return Models.ActionQueue.create({
    type: ActionQueueTypes.SEND_EMAIL,
    actionDate: tomorrow,
    payload: {
      from: persona.id,
      to: profile.Player.id,
      subject: 'We joined a league',
      content: Sqrl.render( EmailDialogue.PRESEASON_AUTOADD_COMP, {
        player: profile.Player,
        compname: leagueobj.name,
        compregion: region.name
      }),
      sentAt: tomorrow,
    }
  });
});


itemloop.register( ActionQueueTypes.PRESEASON_AUTOADD_SQUAD, async () => {
  // check if this dude finally has a squad
  const profile = await Models.Profile.getActiveProfile();
  const today = moment( profile.currentDate );
  const tomorrow = today.add( 1, 'day' );
  const hassquad = profile.Team.Players.length >= Application.SQUAD_MIN_LENGTH;

  if( hassquad ) {
    return Promise.resolve();
  }

  // grab players from the same region as user's team
  const region = profile.Team.Country.Continent;
  const players = await Models.Player.findAll({
    limit: Application.SQUAD_MIN_LENGTH,
    where: { tier: profile.Team.tier },
    include: [{
      model: Models.Country,
      where: { continentId: region.id }
    }]
  });

  // add the players to the user's squad
  const res = players.map( p => [
    p.update({ transferListed: false, tier: profile.Team.tier }),
    p.setTeam( profile.Team )
  ]);

  await Promise.all( flatten( res ) as Promise<any>[] );

  // let the user know we've added some squad members
  const persona = await Models.Persona.getManagerByTeamId( profile.Team.id, 'Assistant Manager' );

  return Models.ActionQueue.create({
    type: ActionQueueTypes.SEND_EMAIL,
    actionDate: tomorrow,
    payload: {
      from: persona.id,
      to: profile.Player.id,
      subject: 'New squad members',
      content: Sqrl.render( EmailDialogue.PRESEASON_AUTOADD_SQUAD, {
        player: profile.Player,
        players: players,
      }),
      sentAt: tomorrow,
    }
  });
});


itemloop.register( ActionQueueTypes.PRESEASON_CHECK_COMP, async () => {
  // check if this dude has joined any competitions
  const profile = await Models.Profile.getActiveProfile();
  const today = moment( profile.currentDate );
  const tomorrow = today.add( 1, 'day' );
  const joined = profile.Team.Competitions.length > 0;
  const hassquad = profile.Team.Players.length >= Application.SQUAD_MIN_LENGTH;

  if( joined || !hassquad ) {
    return Promise.resolve();
  }

  // bruh, get your shit together
  const persona = await Models.Persona.getManagerByTeamId( profile.Team.id, 'Assistant Manager' );

  return Models.ActionQueue.create({
    type: ActionQueueTypes.SEND_EMAIL,
    actionDate: tomorrow,
    payload: {
      from: persona.id,
      to: profile.Player.id,
      subject: 'Let\'s join a competition',
      content: Sqrl.render( EmailDialogue.PRESEASON_COMP_DEADLINE, { player: profile.Player }),
      sentAt: tomorrow,
    }
  });
});

itemloop.register( ActionQueueTypes.PRESEASON_CHECK_SQUAD, async () => {
  // time to check if this dude has his squad in order
  const profile = await Models.Profile.getActiveProfile();
  const today = moment( profile.currentDate );
  const tomorrow = today.add( 1, 'day' );
  const hassquad = profile.Team.Players.length >= Application.SQUAD_MIN_LENGTH;

  if( hassquad ) {
    return Promise.resolve();
  }

  // bruh, get your shit together
  const persona = await Models.Persona.getManagerByTeamId( profile.Team.id, 'Assistant Manager' );

  return Models.ActionQueue.create({
    type: ActionQueueTypes.SEND_EMAIL,
    actionDate: tomorrow,
    payload: {
      from: persona.id,
      to: profile.Player.id,
      subject: 'Concerned about our squad',
      content: Sqrl.render( EmailDialogue.PRESEASON_SQUAD_DEADLINE, { player: profile.Player }),
      sentAt: tomorrow,
    }
  });
});


itemloop.register( ActionQueueTypes.SEND_EMAIL, async item => {
  const email = await Models.Email.send( item.payload );

  ScreenManager
    .getScreenById( IPCRouting.Main._ID )
    .handle
    .webContents
    .send(
      IPCRouting.Worldgen.EMAIL_NEW,
      JSON.stringify( email )
    )
  ;

  return Promise.resolve( false );
});


itemloop.register( ActionQueueTypes.TRANSFER_OFFER_RESPONSE, async item => {
  return Models.TransferOffer.update(
    { status: item.payload.status, msg: item.payload.msg },
    { where: { id: item.payload.id } }
  );
});


itemloop.register( ActionQueueTypes.TRANSFER_MOVE, async item => {
  return Models.Player
    .findByPk( item.payload.targetid )
    .then( player => Promise.all([
      player?.update({
        monthlyWages: item.payload.wages,
        transferValue: item.payload.fee,
        transferListed: false,
        tier: item.payload.tier,
        eligibleDate: item.payload.eligible,
      }),
      player?.setTeam( item.payload.teamid )
    ]))
  ;
});


itemloop.register( ActionQueueTypes.START_COMP, async item => {
  return Models.Competition
    .findByPk( item.payload, { include: [ 'Comptype' ] })
    .then( WGCompetition.start )
    .then( WGCompetition.genMatchdays )
  ;
});


itemloop.register( ActionQueueTypes.MATCHDAY, () => {
  return Promise.resolve( false );
});


itemloop.register( ActionQueueTypes.MATCHDAY_NPC, async item => {
  const compobj = await Models.Competition.findByPk( item.payload.compId );
  const leagueobj = League.restore( compobj.data );
  const divobj = leagueobj.divisions.find( d => d.name === item.payload.divId );
  const conf = divobj.conferences.find( c => c.id === item.payload.confId );
  const match = conf.groupObj.findMatch( item.payload.matchId );
  const team1 = await Models.Team.findByPk( divobj.getCompetitorBySeed( conf, match.p[ 0 ] ).id );
  const team2 = await Models.Team.findByPk( divobj.getCompetitorBySeed( conf, match.p[ 1 ] ).id );
  conf.groupObj.score( item.payload.matchId, Score( team1, team2 ) );
  compobj.data = leagueobj.save();
  return compobj.save();
});


/**
 * Main function
 *
 * Queries actionqueue items for today's date
 * and executes those action items.
 */

export function loop( max = Application.CALENDAR_LOOP_MAX_ITERATIONS ) {
  return itemloop.start( max );
}
