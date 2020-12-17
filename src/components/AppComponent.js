import React, {useEffect} from 'react';
import PropTypes from 'prop-types';

import AppBar from './AppBar';
import AppFooter from './AppFooter';
import LoadingDialog from './LoadingDialog';
import {getMeta} from '../helper/http-helper';
import useAppContext from '../hooks/useAppContext';

const AppComponent = ({Component, pageProps}) => {
  const app = useAppContext();
  useEffect(() => {
    const func = async () => {
      const meta = await getMeta();
      app.init(meta);
    };
    func();
  }, []);

  const content = (<Component {...pageProps}></Component>);
  return (
    <div>
      <div id="loading" style={{display: 'none'}}>
        <LoadingDialog open={true} />
      </div>
      <AppBar />
      <div style={{height: 47}} />
      {content}
      <AppFooter />
    </div>
  );
};

AppComponent.propTypes = {
  Component: PropTypes.func,
  pageProps: PropTypes.object,
};

export default AppComponent;
