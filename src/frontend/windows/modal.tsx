/**
 * Reusable modal browser window.
 *
 * @module
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import Routes from '@liga/frontend/routes';
import { createMemoryRouter, RouterProvider, Outlet, useNavigate } from 'react-router-dom';
import { Constants } from '@liga/shared';
import { AppStateContext, AppStateProvider } from '@liga/frontend/redux';
import { useTheme } from '@liga/frontend/hooks';
import { profileUpdate, localeUpdate } from '@liga/frontend/redux/actions';
import '@liga/frontend/assets/styles.css';

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
        path: '/brackets',
        element: <Routes.Modal.Brackets />,
      },
      {
        path: '/mods',
        element: <Routes.Modal.Mods />,
      },
      {
        path: '/play',
        element: <Routes.Modal.Play />,
      },
      {
        path: '/postgame',
        element: <Routes.Modal.Postgame />,
      },
      {
        path: '/pregame',
        element: <Routes.Modal.Pregame />,
      },
      {
        path: '/settings',
        element: <Routes.Modal.Settings />,
      },
      {
        path: '/transfer',
        element: <Routes.Modal.Transfer />,
      },

      // composite routes
      {
        path: '/issues',
        children: [
          {
            path: 'all',
            element: <Routes.Modal.Issues.All />,
          },
          {
            path: 'comments',
            element: <Routes.Modal.Issues.Comments />,
          },
          {
            path: 'create',
            element: <Routes.Modal.Issues.Create />,
          },
        ],
      },
      {
        path: '/markdown',
        children: [
          {
            path: 'changelog',
            element: <Routes.Modal.Markdown.Changelog />,
          },
          {
            path: 'csgo.exe',
            element: <Routes.Modal.Markdown.CSGO />,
          },
          {
            path: 'whats-new',
            element: <Routes.Modal.Markdown.WhatsNew />,
          },
        ],
      },
    ],
  },
]);

/**
 * The root component.
 *
 * @component
 */
function Root() {
  const { dispatch } = React.useContext(AppStateContext);
  const [loaded, setLoaded] = React.useState(false);
  const navigate = useNavigate();

  // setup the theme
  useTheme();

  React.useEffect(() => {
    // initial data fetch
    api.profiles.current().then((profile) => dispatch(profileUpdate(profile)));

    // handle incoming profile updates
    api.ipc.on(
      Constants.IPCRoute.PROFILES_CURRENT,
      (profile: Parameters<typeof profileUpdate>[0]) => dispatch(profileUpdate(profile)),
    );

    // navigate to the modal route being requested
    api.ipc.on(Constants.IPCRoute.WINDOW_SEND, (data: ModalRequest) => {
      setLoaded(true);
      navigate(data.target, { state: data.payload });
    });

    // load translations
    api.app.locale().then((locale) => dispatch(localeUpdate(locale)));
  }, []);

  if (!loaded) {
    return (
      <main className="h-screen w-screen">
        <section className="center h-full">
          <span className="loading loading-bars" />
        </section>
      </main>
    );
  }

  return (
    <React.StrictMode>
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
  container.setAttribute('id', Constants.WindowIdentifier.Modal);

  if (!container) {
    throw new Error('Failed to find the root element.');
  }

  // render the react application
  ReactDOM.createRoot(container).render(<Index />);
})();
