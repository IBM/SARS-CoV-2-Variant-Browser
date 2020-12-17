import React from 'react';
import App from 'next/app';
import Head from 'next/head';
import 'carbon-components/css/carbon-components.min.css';
import 'leaflet/dist/leaflet.css';

import './global.css';
import {AppContextProvider} from '../hooks/useAppContext';
import AppComponent from '../components/AppComponent';

/**
 *  Custom app class for next.js
 */
export default class MyApp extends App {
  /**
   * render method
   * @return {jsx} jsx
   */
  render() {
    const {Component, pageProps} = this.props;
    return (
      <React.Fragment>
        <Head>
          <title>IBM SARS-CoV-2 Variant Browser</title>
          <meta name="description" content="The SARS-CoV-2 Variant Browser explores and visualizes SARS-CoV-2 variants for researchers or people who have an interest in COVID-19." />
          <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
        </Head>
        <AppContextProvider>
          <AppComponent Component={Component} pageProps={pageProps} />
        </AppContextProvider>
      </React.Fragment>
    );
  }
}
