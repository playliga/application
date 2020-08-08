import React from 'react';
import moment from 'moment';

import { ipcRenderer } from 'electron';
import { RouteComponentProps } from 'react-router-dom';
import { Button, Typography, Spin } from 'antd';
import { NextMatchResponse, StandingsResponse } from 'renderer/screens/main/types';

import * as IPCRouting from 'shared/ipc-routing';
import * as EmailTypes from 'renderer/screens/main/redux/emails/types';
import * as ProfileTypes from 'renderer/screens/main/redux/profile/types';

import IpcService from 'renderer/lib/ipc-service';
import Connector from 'renderer/screens/main/components/connector';
import InboxPreview from 'renderer/screens/main/components/inbox-preview';
import MatchPreview from 'renderer/screens/main/components/match-preview';
import Standings from 'renderer/screens/main/components/standings';


interface Props extends RouteComponentProps {
  dispatch: Function;
  emails: EmailTypes.EmailState;
  profile: ProfileTypes.ProfileState;
}


/**
 * Helper functions
 */

function formatDate( str: string | undefined ) {
  if( !str ) {
    return null;
  }

  return moment( str ).format( 'MMM DD, YYYY' );
}


async function handleOnNext() {
  await IpcService.send(
    IPCRouting.Worldgen.CALENDAR_LOOP,
    {}
  );
}


/**
 * Main component
 */

const INBOX_PREVIEW_NUM = 3;


function Home( props: Props ) {
  const { profile } = props;
  const [ next, setNext ] = React.useState<NextMatchResponse>();
  const [ standings, setStandings ] = React.useState<StandingsResponse[]>([]);
  const formatteddate = formatDate( profile.data?.currentDate );

  // find our team's seed number
  let seednum;

  if( standings.length > 0 ) {
    seednum = standings[ 0 ]
      .standings
      .find( s => s.competitorInfo.id === profile.data.Team.id )
      .seed
    ;
  }

  // get upcoming match
  React.useEffect( () => {
    IpcService
      .send( IPCRouting.Competition.MATCHES_NEXT )
      .then( res => setNext( res ) )
    ;
  }, []);

  // get standings
  React.useEffect( () => {
    if( !next ) {
      return;
    }

    IpcService
      .send( IPCRouting.Competition.STANDINGS, {
        params: {
          compId: next.competitionId,
          confId: next.confId,
          divName: next.division
        }
      })
      .then( res => setStandings( res[ 0 ] ) )
    ;
  }, [ next ]);

  return (
    <div id="home" className="content">
      <section>
        <Typography.Title>
          {formatteddate?.toString() || 'Loading...'}
        </Typography.Title>

        <Button
          block
          type="primary"
          size="large"
          onClick={handleOnNext}
          style={{ marginBottom: 20 }}
        >
          {'Next'}
        </Button>

        <MatchPreview
          data={next}
          onPlay={id => ipcRenderer.send(
            IPCRouting.Competition.PLAY, {
              responsechannel: IPCRouting.Competition.PLAY,
              params: { id }
            }
          )}
        />
      </section>
      <section>
        <InboxPreview
          data={props.emails.data.slice( 0, INBOX_PREVIEW_NUM )}
          onClick={id => props.history.push( `/inbox/${id}` )}
        />

        {!standings && (
          <Spin size="small" />
        )}

        {standings && standings.length > 0 && ([
          <Typography.Title style={{ textAlign: 'center' }} level={3} key="standings-title">
            {standings[ 0 ].competition}: {standings[ 0 ].region}
          </Typography.Title>,
          <Standings
            disablePagination
            key="standings"
            highlightSeed={seednum}
            title={standings[ 0 ].division}
            dataSource={standings[ 0 ]
              .standings
              .map( ( s: any ) => ({
                id: s.competitorInfo.id,
                name: s.competitorInfo.name,
                ...s,
              }))
            }
          />
        ])}
      </section>
    </div>
  );
}


export default Connector.connect( Home );
