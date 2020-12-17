import React, {useState, createContext, useContext} from 'react';
import PropTypes from 'prop-types';

import {FilterPreset} from '../helper/data-helper';

const useAppState = () => {
  // filter
  const [filter, setFilter] = useState(FilterPreset.latest);
  // filter for tree
  const [filterForTree, setFilterForTree] = useState(FilterPreset.latest);
  // filter for reference
  const [filterForReference, setFilterForReference] = useState({
    variant: [],
    location: [],
    gene: [],
    condition: [],
    disease: [],
    publishDateFrom: null, // '2020-09-01T12:34:56.000Z'
    publishDateTo: null,
    keyword: [],
    pmid: [],
    firstAuthor: [],
    otherAuthors: [],
    publicationName: [],
  });
  // filter for trend
  const [filterForTrend, setFilterForTrend] = useState({
    select1: '',
    select2: '',
    selectList: [],
    query1: {},
    query2: {},
  });

  // meta
  const [meta, setMeta] = useState({total: 0, splitDate: [], initialCollectionDateFrom: null});

  const init = (metadata) => {
    if (meta.total === 0) {
      if (metadata.initialCollectionDateFrom) {
        setFilter({...filter, collectionDateFrom: metadata.initialCollectionDateFrom});
      }
      setMeta(metadata);
    }
  };

  // variant browser cache
  const [samples, setSamples] = useState({samples: [], filteredSamples: [], tableSamples: [], loadState: []});

  return {
    filter, setFilter, filterForTree, setFilterForTree, filterForReference, setFilterForReference, filterForTrend, setFilterForTrend, meta, setMeta, init, samples, setSamples,
  };
};

const AppContext = createContext();
const AppContextProvider = ({children}) => {
  const value = useAppState();
  return (<AppContext.Provider value={value}>{children}</AppContext.Provider>);
};
AppContextProvider.propTypes = {
  children: PropTypes.any,
};
const useAppContext = () => useContext(AppContext);

export {useAppState, AppContextProvider};
export default useAppContext;
