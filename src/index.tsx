// TODO: IMPORT_TO_LESS_DOESNT_WORK
import '@ergolabs/ui-kit/dist/styles/fonts/fonts.less';
import './assets/styles/styles.less';

import React from 'react';
import { isIOS, isMobile, osVersion } from 'react-device-detect';
import ReactDOM from 'react-dom';

import { ApplicationInitializer } from './App';
import { IOSNotSupportedScreen } from './components/IOSNotSupportedScreen/IOSNotSupportedScreen';
import { reportWebVitals } from './reportWebVitals';

const init = () => {
  if (
    isIOS &&
    osVersion <= '14' &&
    isMobile &&
    navigator.platform.indexOf('Mac') === -1
  ) {
    ReactDOM.render(<IOSNotSupportedScreen />, document.getElementById('root'));

    return;
  }

  // TODO: fix toggle-group behavior after switch to react v18 root api.
  ReactDOM.render(
    <React.StrictMode>
      <ApplicationInitializer />
    </React.StrictMode>,
    document.getElementById('root'),
  );
};

init();
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
