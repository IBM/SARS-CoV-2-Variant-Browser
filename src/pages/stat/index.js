import React, {useEffect, useState} from 'react';
import {Column, Grid, Row} from 'carbon-components-react';
import fetch from 'unfetch';
import useSWR from 'swr';

import styles from './index.module.css';
import PieChart from '../../components/stat/PieChart';
import TimeSeriesLineChart from '../../components/stat/TimeSeriesLineChart';
// import TimeSeriesStackedBarChart from '../../components/stat/TimeSeriesStackedBarChart';
import ComparableTimeSeriesStackedBarChart from '../../components/stat/ComparableTimeSeriesStackedBarChart';
import {Continents, ContinentColors, Countries, CountryColors, Clades, CladeColors} from '../../helper/data-helper';
import {startLoading, finishLoadingWith} from '../../helper/loading-helper';

const fetcher = (url) => fetch(url).then((r) => r.json());

const Page = () => {
  const [stat, setStat] = useState({
    continentSamples: [],
    countrySamples: [],
    continentSamplesCollectionMonth: [],
    countrySamplesCollectionMonth: [],
    continentVariantsMonth: [],
    countryVariantsMonth: [],
    continentCladeMonth: [],
    countryCladeMonth: [],
    continentSamplesCollectionWeek: [],
    countrySamplesCollectionWeek: [],
    continentVariantsWeek: [],
    countryVariantsWeek: [],
    continentCladeWeek: [],
    countryCladeWeek: [],
  });

  const {data} = useSWR('/api/stat', fetcher, {revalidateOnFocus: false});
  useEffect(() => startLoading(), []);
  useEffect(() => {
    if (data) {
      finishLoadingWith(() => {
        if (stat.continentSamples.length === 0) {
          setStat(data);
        }
      });
    }
  }, [data]);

  // eslint-disable-next-line
  const [analysisDate, lastCollectionDate, totalSamples, totalVariants] = data ? data.basicInformation.map((d) => d[1]) : ['', '', '0', '0'];
  const defaultRegions = ['Asia', 'North America'];
  const defaultContries = ['China', 'USA'];
  return (
    <React.Fragment>
      <Grid condensed fullWidth style={{paddingBottom: '0.625rem', marginBottom: 10}}>
        <Row condensed className={styles.row}>
          <Column sm={6} md={8} lg={12} xlg={12} max={12}>
            <div className={styles.card}>
              <div className={styles.summary}>
                <div className={styles.summaryItem}>
                  <div>Total Samples</div>
                  <div>{Number(totalSamples).toLocaleString()}</div>
                </div>
                <div className={styles.summaryItem}>
                  <div>Total Variants</div>
                  <div>{Number(totalVariants).toLocaleString()}</div>
                </div>
                <div className={styles.summaryItem}>
                  <div>Last Collection Date</div>
                  <div>{lastCollectionDate}</div>
                </div>
              </div>
            </div>
          </Column>
        </Row>
        <Row condensed className={styles.row}>
          <Column sm={4} md={4} lg={6} xlg={6} max={6}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>Samples by continent</div>
              <div className={styles.cardBody}>
                <div className={styles.chartLarge}>
                  <PieChart data={stat.continentSamples} labelProp="Geo_Region" valueProp="count" labels={Continents} labelColors={ContinentColors} />
                </div>
              </div>
            </div>
          </Column>
          <Column sm={4} md={4} lg={6} xlg={6} max={6}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>Weekly trends in continent samples</div>
              <div className={styles.cardBody}>
                <div className={styles.chartLarge}>
                  <TimeSeriesLineChart data={stat.continentSamplesCollectionWeek} labelProp="Geo_Region" timeFormat="%Y/%m/%d" labels={Continents} labelColors={ContinentColors} />
                </div>
              </div>
            </div>
          </Column>
        </Row>
        <Row condensed className={styles.row}>
          <Column sm={4} md={4} lg={6} xlg={6} max={6}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>Samples by country</div>
              <div className={styles.cardBody}>
                <div className={styles.chartLarge}>
                  <PieChart data={stat.countrySamples} labelProp="Geo_Country" valueProp="count" labels={Countries} labelColors={CountryColors} />
                </div>
              </div>
            </div>
          </Column>
          <Column sm={4} md={4} lg={6} xlg={6} max={6}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>Weekly trends in country samples</div>
              <div className={styles.cardBody}>
                <div className={styles.chartLarge}>
                  <TimeSeriesLineChart data={stat.countrySamplesCollectionWeek} labelProp="Geo_Country" timeFormat="%Y/%m/%d" labels={Countries} labelColors={CountryColors} />
                </div>
              </div>
            </div>
          </Column>
        </Row>
        {/* <Row condensed className={styles.row}>
          <Column sm={4} md={4} lg={6} xlg={6} max={6}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>Weekly trends of clades in Africa</div>
              <div className={styles.cardBody}>
                <div className={styles.chartLarge}>
                  <TimeSeriesStackedBarChart data={stat.continentCladeWeek} type="Geo_Region" name="Africa" labels={Clades} labelColors={CladeColors} />
                </div>
              </div>
            </div>
          </Column>
          <Column sm={4} md={4} lg={6} xlg={6} max={6}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>Weekly trends of clades in Asia</div>
              <div className={styles.cardBody}>
                <div className={styles.chartLarge}>
                  <TimeSeriesStackedBarChart data={stat.continentCladeWeek} type="Geo_Region" name="Asia" labels={Clades} labelColors={CladeColors} />
                </div>
              </div>
            </div>
          </Column>
        </Row>
        <Row condensed className={styles.row}>
          <Column sm={4} md={4} lg={6} xlg={6} max={6}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>Weekly trends of clades in Europe</div>
              <div className={styles.cardBody}>
                <div className={styles.chartLarge}>
                  <TimeSeriesStackedBarChart data={stat.continentCladeWeek} type="Geo_Region" name="Europe" labels={Clades} labelColors={CladeColors} />
                </div>
              </div>
            </div>
          </Column>
          <Column sm={4} md={4} lg={6} xlg={6} max={6}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>Weekly trends of clades in North America</div>
              <div className={styles.cardBody}>
                <div className={styles.chartLarge}>
                  <TimeSeriesStackedBarChart data={stat.continentCladeWeek} type="Geo_Region" name="North America" labels={Clades} labelColors={CladeColors} />
                </div>
              </div>
            </div>
          </Column>
        </Row>
        <Row condensed className={styles.row}>
          <Column sm={4} md={4} lg={6} xlg={6} max={6}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>Weekly trends of clades in Oceania</div>
              <div className={styles.cardBody}>
                <div className={styles.chartLarge}>
                  <TimeSeriesStackedBarChart data={stat.continentCladeWeek} type="Geo_Region" name="Oceania" labels={Clades} labelColors={CladeColors} />
                </div>
              </div>
            </div>
          </Column>
          <Column sm={4} md={4} lg={6} xlg={6} max={6}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>Weekly trends of clades in South America</div>
              <div className={styles.cardBody}>
                <div className={styles.chartLarge}>
                  <TimeSeriesStackedBarChart data={stat.continentCladeWeek} type="Geo_Region" name="South America" labels={Clades} labelColors={CladeColors} />
                </div>
              </div>
            </div>
          </Column>
        </Row>
        <Row condensed className={styles.row}>
          <Column sm={4} md={4} lg={6} xlg={6} max={6}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>Weekly trends of clades in USA 🇺🇸</div>
              <div className={styles.cardBody}>
                <div className={styles.chartLarge}>
                  <TimeSeriesStackedBarChart data={stat.countryCladeWeek} type="Geo_Country" name="USA" labels={Clades} labelColors={CladeColors} />
                </div>
              </div>
            </div>
          </Column>
          <Column sm={4} md={4} lg={6} xlg={6} max={6}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>Weekly trends of clades in China 🇨🇳</div>
              <div className={styles.cardBody}>
                <div className={styles.chartLarge}>
                  <TimeSeriesStackedBarChart data={stat.countryCladeWeek} type="Geo_Country" name="China" labels={Clades} labelColors={CladeColors} />
                </div>
              </div>
            </div>
          </Column>
        </Row>
        <Row condensed className={styles.row}>
          <Column sm={4} md={4} lg={6} xlg={6} max={6}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>Weekly trends of clades in United Kingdom 🇬🇧</div>
              <div className={styles.cardBody}>
                <div className={styles.chartLarge}>
                  <TimeSeriesStackedBarChart data={stat.countryCladeWeek} type="Geo_Country" name="United Kingdom" labels={Clades} labelColors={CladeColors} />
                </div>
              </div>
            </div>
          </Column>
          <Column sm={4} md={4} lg={6} xlg={6} max={6}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>Weekly trends of clades in Japan 🇯🇵</div>
              <div className={styles.cardBody}>
                <div className={styles.chartLarge}>
                  <TimeSeriesStackedBarChart data={stat.countryCladeWeek} type="Geo_Country" name="Japan" labels={Clades} labelColors={CladeColors} />
                </div>
              </div>
            </div>
          </Column>
        </Row> */}
        <Row>
          <Column>
            <div className={styles.card}>
              <div className={styles.cardHeader}>Weekly trends of clade - Continents</div>
              <div className={styles.cardBody}>
                <div className={styles.chartHuge}>
                  <ComparableTimeSeriesStackedBarChart data={stat.continentCladeWeek} type="Geo_Region" name1={defaultRegions[0]} name2={defaultRegions[1]} labels={Clades} labelColors={CladeColors} />
                </div>
              </div>
            </div>
          </Column>
        </Row>
        <Row>
          <Column>
            <div className={styles.card}>
              <div className={styles.cardHeader}>Weekly trends of clade - Country</div>
              <div className={styles.cardBody}>
                <div className={styles.chartHuge}>
                  <ComparableTimeSeriesStackedBarChart data={stat.countryCladeWeek} type="Geo_Country" name1={defaultContries[0]} name2={defaultContries[1]} labels={Clades} labelColors={CladeColors} />
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
