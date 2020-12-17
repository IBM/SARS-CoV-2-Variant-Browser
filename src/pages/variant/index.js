import React, {useEffect, useState, useRef} from 'react';
import {Column, Grid, Row} from 'carbon-components-react';
import fetch from 'unfetch';
import useSWR from 'swr';
import moment from 'moment';

import Filter from '../../components/variant/Filter';
import MutationsChart from '../../components/variant/MutationsChart';
import MutationsTable from '../../components/variant/MutationsTable';
import WorldMapChart from '../../components/variant/WorldMapChart';
import styles from './index.module.css';
import {filterData, getCategoryItem, getItem, getSameCategoryItems} from '../../helper/data-helper';
import {startLoading, finishLoadingWith} from '../../helper/loading-helper';
import useAppContext from '../../hooks/useAppContext';

const fetcher = (url) => fetch(url).then((r) => r.json());

const getSplitData = async (date) => {
  const res = await fetch(`/api/samples?date=${date}`);
  return res.json();
};

const Page = () => {
  const app = useAppContext();
  const [supplements, setSupplements] = useState({});
  const [locations, setLocations] = useState([]);
  const [downloading, setDownloading] = useState(false);

  const {data: supplmentsData} = useSWR('/api/supplements', fetcher, {revalidateOnFocus: false});
  const {data: locationsData} = useSWR('/api/locations', fetcher, {revalidateOnFocus: false});

  useEffect(() => {
    startLoading();
  }, []);
  useEffect(() => {
    if (app.meta.splitDate && app.meta.splitDate.length > 0) {
      if (app.samples.samples.length === 0) {
        const loadInitialData = async () => {
          const sampleData = await getSplitData(0);
          finishLoadingWith(() => {
            const result = filterData(sampleData, app.filter);
            const loadState = app.meta.splitDate.map((d, i) => i === 0 ? true : false);
            app.setSamples({...result, loadState});
            onResize();
          });
        };
        loadInitialData();
      } else {
        finishLoadingWith(() => {
          onResize();
        });
      }
    }
  }, [app.meta]);

  useEffect(() => {
    if (supplmentsData) {
      setSupplements(supplmentsData);
    }
  }, [supplmentsData]);

  useEffect(() => {
    if (locationsData) {
      setLocations(locationsData.locations);
    }
  }, [locationsData]);

  const applyFilter = async (newFilter) => {
    const dateStr = newFilter.collectionDateFrom ? moment(newFilter.collectionDateFrom).format('YYYY-MM-DD') : app.meta.splitDate[app.meta.splitDate.length - 1];
    const loadingTargetIndex = app.meta.splitDate.findIndex((d) => d.localeCompare(dateStr) <= 0);
    startLoading();
    app.setFilter(newFilter);
    let sampleData = app.samples.samples;
    let loadState = app.samples.loadState;
    if (loadState.slice(0, loadingTargetIndex + 1).includes(false)) {
      setDownloading(true);
      sampleData = [...app.samples.samples];
      loadState = [...app.samples.loadState];
      for (let i = 0; i <= loadingTargetIndex; i++) {
        if (!loadState[i]) {
          // console.log('loading additional data: ' + app.meta.splitDate[i]);
          const splitData = await getSplitData(i);
          sampleData.push(...splitData);
          loadState[i] = true;
        }
      }
      sampleData.sort((x, y) => x.i - y.i);
    }
    finishLoadingWith(() => {
      const result = filterData(sampleData, newFilter);
      app.setSamples({...result, loadState});
      setDownloading(false);
    });
  };

  const buildNewCondition = (list, condition, category, value) => {
    const categoryItem = getCategoryItem(list, category);
    const items = getSameCategoryItems(list, category);
    const itemsToAdd = [];
    if (!value) {
      // new condition is category based, add category
      itemsToAdd.push({...categoryItem, selected: 'true'});
      // itemsToAdd.push(...items.map((i) => ({...i, selected: 'true'})));
    } else {
      // new condition is item based, merge current items and newly added item
      const currentItems = getSameCategoryItems(condition, category);
      const targetItem = getItem(items, {category, value});
      const exist = !!getItem(currentItems, targetItem);
      const newLength = exist ? currentItems.length : currentItems.length + 1;
      if (items.length === newLength) {
        itemsToAdd.push({...categoryItem, selected: 'true'});
      } else {
        itemsToAdd.push({...categoryItem, selected: 'mixed'});
        itemsToAdd.push(...currentItems);
        if (!exist) {
          itemsToAdd.push({...targetItem, selected: 'true'});
        }
      }
    }
    // remove current condition in same category and replace with new one
    const newCondition = condition.filter((i) => i.category !== category);
    newCondition.push(...itemsToAdd);
    return newCondition;
  };

  const onSelectMutation = (label, index, item) => {
    const {filter} = app;
    if (label === 'continent' || label === 'country') {
      const list = supplements.locations;
      const condition = filter.location;
      const category = label === 'continent' ? item.continent : list.find((i) => i.value === item.country).category;
      const value = label === 'continent' ? '' : item.country;
      const newCondition = buildNewCondition(list, condition, category, value);
      applyFilter({...filter, location: newCondition});
    } else if (label === 'gene' || label === 'AA_change') {
      const list = supplements.genesAAChanges;
      const condition = filter.geneAA_change;
      const category = label === 'gene' ? item.mutations[index].gene : list.find((i) => i.value === item.mutations[index].AA_change).category;
      const value = label === 'gene' ? '' : item.mutations[index].AA_change;
      const newCondition = buildNewCondition(list, condition, category, value);
      applyFilter({...filter, geneAA_change: newCondition});
    } else {
      const value = index === -1 ? item[label] : item.mutations[index][label];
      if (!filter[label].includes(value)) {
        const newFilter = {...filter, [label]: [...filter[label], value]};
        applyFilter(newFilter);
      }
    }
  };

  const mutationsRef = useRef(null);
  const mapRef = useRef(null);
  const tableRef = useRef(null);
  const [mutationsSize, setMutationsSize] = useState({width: 0, height: 0});
  const [mapSize, setMapSize] = useState([0, 0]);
  const [tableHeight, setTableHeight] = useState(0);
  const onResize = () => {
    setMutationsSize({width: mutationsRef.current.offsetWidth, height: mutationsRef.current.offsetHeight});
    setMapSize([mapRef.current.offsetWidth, mapRef.current.offsetHeight]);
    setTableHeight(tableRef.current.offsetHeight);
  };
  useEffect(() => {
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <React.Fragment>
      {downloading &&
        <div style={{position: 'fixed', top: '35vh', width: '100vw', zIndex: 9999}}>
          <div style={{textAlign: 'center', padding: '10px 0', margin: '0 20vw', color: '#ffffff', background: '#0f62fe'}}>
            Downloading additional data to apply filter...
          </div>
        </div>
      }
      <div className={styles.filter}>
        <Filter dataSet={app.samples} meta={app.meta} supplements={supplements} filter={app.filter} onApplyFilter={applyFilter} mode="variant" />
      </div>
      <div style={{marginTop: 32}}></div>
      <Grid condensed fullWidth>
        <Row condensed>
          <Column sm={4} md={8} lg={7} xlg={8}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                Variant
              </div>
              <div className={styles.cardBody}>
                <div ref={mutationsRef} className={styles.mutations}>
                  <MutationsChart dataSet={app.samples} size={mutationsSize} onSelect={onSelectMutation} />
                </div>
              </div>
            </div>
          </Column>
          <Column sm={4} md={8} lg={5} xlg={4}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                Sample distribution map
              </div>
              <div className={styles.cardBody}>
                <div ref={mapRef} className={styles.map}>
                  <WorldMapChart
                    data={app.samples.filteredSamples}
                    locations={locations}
                    size={mapSize}
                    onSelect={onSelectMutation}
                  />
                </div>
              </div>
            </div>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                Top 30 variant recurrence
              </div>
              <div className={styles.cardBody}>
                <div ref={tableRef} className={styles.table}>
                  <MutationsTable data={app.samples.tableSamples} height={tableHeight} />
                </div>
              </div>
            </div>
          </Column>
        </Row>
      </Grid>
    </React.Fragment>
  );
};

export default Page;
