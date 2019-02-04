import React, { Suspense } from 'react';
import { Router, Switch, Route } from 'react-router';
import { ToastContainer } from 'react-toastify';
import { createGlobalStyle } from 'styled-components/macro';
import { LoggedIn, Protected } from './modules/layout';
import { history } from './utils';
import { PublicStory } from './modules/publicStory';
import { PublicHome } from './modules/publicHome';

import 'react-toastify/dist/ReactToastify.css';
import { NotFound } from './modules/layout/components/NotFound';

// @ts-ignore
const Home = React.lazy(() => import('./modules/home/Home'));
// @ts-ignore
const Editor = React.lazy(() => import('./modules/editor/Editor'));

const GlobalStyle = createGlobalStyle`
  .reactToastify.Toastify__toast--success {
    background-color: #4db6a1;
  }
`;

const App = () => {
  return (
    <React.Fragment>
      <GlobalStyle />
      <ToastContainer autoClose={3000} toastClassName="reactToastify" />
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

          <Route render={() => <NotFound error="Page not found" />} />
        </Switch>
      </Router>
    </React.Fragment>
  );
};

export default App;
