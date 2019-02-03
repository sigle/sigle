import React, { Suspense } from 'react';
import { Router, Switch, Route } from 'react-router';
import { ToastContainer } from 'react-toastify';
import { LoggedIn, Protected } from './modules/layout';
import { history } from './utils';
import { PublicStory } from './modules/publicStory';
import { PublicHome } from './modules/publicHome';

import 'react-toastify/dist/ReactToastify.css';

// @ts-ignore
const Home = React.lazy(() => import('./modules/home/Home'));
// @ts-ignore
const Editor = React.lazy(() => import('./modules/editor/Editor'));

// TODO nice 404 page
const NoMatch = () => <div>404 page not found</div>;

const App = () => {
  return (
    <React.Fragment>
      <ToastContainer autoClose={3000} />
      <Router history={history}>
        <Switch>
          <Route
            path="/"
            exact
            render={() => (
              <Protected>
                <LoggedIn>
                  <Suspense fallback={<p>Loading ...</p>}>
                    <Home />
                  </Suspense>
                </LoggedIn>
              </Protected>
            )}
          />
          <Route
            path="/stories/:storyId"
            exact
            render={props => (
              <Protected>
                <LoggedIn>
                  <Suspense fallback={<p>Loading ...</p>}>
                    <Editor {...props} />
                  </Suspense>
                </LoggedIn>
              </Protected>
            )}
          />

          {/* Public routes */}
          <Route path="/:username" exact component={PublicHome} />
          <Route path="/:username/:storyId" exact component={PublicStory} />

          <Route component={NoMatch} />
        </Switch>
      </Router>
    </React.Fragment>
  );
};

export default App;
