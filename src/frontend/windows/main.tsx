/**
 * The application's main window.
 *
 * @module
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import Routes from '@liga/frontend/routes';
import { Toast, Toaster, toast } from 'react-hot-toast';
import { FaEnvelopeOpen } from 'react-icons/fa';
import { Constants, Eagers, Util } from '@liga/shared';
import { cx } from '@liga/frontend/lib';
import { AppStateContext, AppStateProvider } from '@liga/frontend/redux';
import { useTheme } from '@liga/frontend/hooks';
import { Confetti } from '@liga/frontend/components';
import {
  continentsUpdate,
  emailsUpdate,
  profileUpdate,
  appStatusUpdate,
  localeUpdate,
  play,
} from '@liga/frontend/redux/actions';
import {
  createMemoryRouter,
  RouterProvider,
  Outlet,
  useLocation,
  useNavigate,
  useMatch,
  PathMatch,
} from 'react-router-dom';
import '@liga/frontend/assets/styles.css';

/** @constant */
const SETTINGS_VALIDATE_FREQUENCY = 5000;

/**
 * Configure routes.
 *
 * @constant
 */
const routes = createMemoryRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      // standalone routes
      {
        element: <Routes.Main.Dashboard />,
        index: true,
      },
      {
        path: '/inbox',
        element: <Routes.Main.Inbox />,
      },
      {
        path: '/squad',
        element: <Routes.Main.Squad />,
      },
      {
        path: '/players',
        element: <Routes.Main.Players />,
      },
      {
        path: '/calendar',
        element: <Routes.Main.Calendar />,
      },

      // composite routes
      {
        path: '/competitions',
        element: <Routes.Main.Competitions.Competitions />,
        children: [
          {
            element: <Routes.Main.Competitions.Overview />,
            index: true,
          },
          {
            path: 'standings',
            element: <Routes.Main.Competitions.Standings />,
          },
          {
            path: 'results',
            element: <Routes.Main.Competitions.Results />,
          },
        ],
      },
      {
        path: '/sponsors',
        element: <Routes.Main.Sponsors.Sponsors />,
        children: [
          {
            element: <Routes.Main.Sponsors.Overview />,
            index: true,
          },
          {
            path: 'all',
            element: <Routes.Main.Sponsors.All />,
          },
        ],
      },
      {
        path: '/teams',
        element: <Routes.Main.Teams.Teams />,
        children: [
          {
            element: <Routes.Main.Teams.Overview />,
            index: true,
          },
          {
            path: 'history',
            element: <Routes.Main.Teams.History />,
          },
          {
            path: 'results',
            element: <Routes.Main.Teams.Results />,
          },
        ],
      },
    ],
  },
]);

/**
 * Custom toast for incoming e-mail notifications.
 *
 * @param props       Root props.
 * @param props.email The email payload.
 * @function
 */
function ToastEmail(props: Toast & { email: Parameters<typeof emailsUpdate>[number][number] }) {
  return (
    <dialog>
      <section>
        <figure>
          <FaEnvelopeOpen />
        </figure>
        <article>
          <header>{props.email.from.name}</header>
          <footer>{props.email.subject}</footer>
        </article>
      </section>
      <section>
        <button onClick={() => toast.dismiss(props.id)}>Dismiss</button>
      </section>
    </dialog>
  );
}

/**
 * The root component.
 *
 * @component
 */
function Root() {
  const { dispatch, state } = React.useContext(AppStateContext);
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    // what's new modal check
    api.app.whatsNew();

    // initial data fetch
    api.continents
      .all(Eagers.continent)
      .then((continents) => dispatch(continentsUpdate(continents)));
    api.emails.all().then((emails) => dispatch(emailsUpdate(emails)));
    api.profiles.current().then((profile) => dispatch(profileUpdate(profile)));
    api.app.status().then((resp) => dispatch(appStatusUpdate(resp)));
    api.app.locale().then((locale) => dispatch(localeUpdate(locale)));

    // handle incoming e-mail notifications
    api.ipc.on(Constants.IPCRoute.EMAILS_NEW, (email: (typeof state.emails)[number]) => {
      dispatch(emailsUpdate([email]));

      const [dialogue] = email.dialogues.slice(-1);

      if (!/^(accepted|rejected)/gi.test(dialogue.content)) {
        toast((data) => <ToastEmail {...data} email={email} />);
      }
    });

    // handle incoming profile updates
    api.ipc.on(Constants.IPCRoute.PROFILES_CURRENT, (profile: typeof state.profile) =>
      dispatch(profileUpdate(profile)),
    );

    // handle awards
    api.ipc.on(Constants.IPCRoute.CONFETTI_START, Confetti.start);

    // handle play events
    api.ipc.on(Constants.IPCRoute.WINDOW_SEND, () => dispatch(play()));

    // setup app status heartbeat
    const heartbeat = setInterval(
      () => api.app.status().then((resp) => dispatch(appStatusUpdate(resp))),
      SETTINGS_VALIDATE_FREQUENCY,
    );
    return () => clearInterval(heartbeat);
  }, []);

  // setup the theme
  useTheme();

  return (
    <React.StrictMode>
      <header className="navbar border-base-content/10 bg-base-200 fixed top-0 z-50 h-16 border-b p-0">
        <nav className="stack-x navbar-start h-full w-full gap-0!">
          {[
            ['/', 'Dashboard'],
            ['/inbox', 'Inbox'],
            ['/squad', 'Squad Hub'],
            ['/teams', 'Teams', useMatch('/teams/*')],
            ['/players', 'Players'],
            ['/competitions', 'Competitions', useMatch('/competitions/*')],
            ['/sponsors', 'Sponsors', useMatch('/sponsors/*')],
            ['/calendar', 'Calendar'],
          ].map(([id, name, isMatch]: [string, string, PathMatch | undefined]) => (
            <button
              key={id}
              className={cx(
                'btn relative h-full min-w-32',
                'border-r-base-content/10 rounded-none border-0 border-r border-b-2 border-b-transparent',
                'hover:border-b-primary disabled:bg-transparent!',
                (isMatch || location.pathname === id) &&
                  '!border-b-primary bg-base-300 cursor-default',
              )}
              disabled={state.working}
              onClick={() => navigate(id)}
            >
              {name}
              {id.includes('inbox') && state.emails.some((email) => !email.read) && (
                <span className="badge-xxs badge badge-info absolute top-2 right-2" />
              )}
            </button>
          ))}
          <button
            title="Earnings can be used to buy servers to give your team training boosts!"
            className={cx('btn btn-wide ml-auto border-0', 'hover:bg-transparent')}
          >
            <p>Total Earnings</p>
            <p>
              <code>{Util.formatCurrency(state.profile?.team.earnings || 0)}</code>
            </p>
          </button>
        </nav>
      </header>
      <Outlet />
    </React.StrictMode>
  );
}

/**
 * The index component
 *
 * @component
 */
function Index() {
  return (
    <AppStateProvider>
      <Confetti.Confetti />
      <Toaster
        position="bottom-right"
        toastOptions={{
          className: 'react-hot-toast',
        }}
      />
      <RouterProvider router={routes} />
    </AppStateProvider>
  );
}

/**
 * React bootstrapping logic.
 *
 * @name anonymous
 * @function
 */
(() => {
  // grab the root container
  const container = document.getElementById('root');
  container.setAttribute('id', Constants.WindowIdentifier.Main);

  if (!container) {
    throw new Error('Failed to find the root element.');
  }

  // render the react application
  ReactDOM.createRoot(container).render(<Index />);
})();
