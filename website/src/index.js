import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import AppState from './AppState';
import App from './App';

const appState = new AppState();

fetch('/links.json').then( response => {

  return response.json();

}).then( links => {

  appState.initLinks(links);

  render(
      <App appState={appState} />,
    document.getElementById('root')
  );

  if (module.hot) {
    module.hot.accept('./App', () => {
      const NextApp = require('./App').default;

      render(
        <AppContainer>
          <NextApp appState={appState} />
        </AppContainer>,
        document.getElementById('root')
      );
    });
  }

});
