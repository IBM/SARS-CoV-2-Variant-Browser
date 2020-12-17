import React, {useEffect, useState, useRef} from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';

import {Dropdown} from 'carbon-components-react';
import * as d3 from 'd3';

import styles from './FishPlot.module.css';
import {Countries, CountryColors, Clades, CladeColors, CarbonCategory14} from '../../helper/data-helper';

const offsetList = ['Silhouette', 'Ratio'];
const offsets = {
  Diverging: d3.stackOffsetDiverging,
  Ratio: d3.stackOffsetExpand,
  Stack: d3.stackOffsetNone,
  Silhouette: d3.stackOffsetSilhouette,
  Wiggle: d3.stackOffsetWiggle,
};
const orders = {
  Appearance: d3.stackOrderAppearance,
  Ascending: d3.stackOrderAscending,
  Descending: d3.stackOrderDescending,
  InsideOut: d3.stackOrderInsideOut,
  None: d3.stackOrderNone,
  Reverse: d3.stackOrderReverse,
};

const movingAvg = (data, keys, step) => {
  return data.map((d, i) => {
    const result = {days: d.days, date: d.date};
    const window = data.slice(i - step < 0 ? 0 : i - step, i + step + 1); // window size = 2 * step + 1
    keys.forEach((key) => {
      const keyData = window.map((x) => x[key]);
      const value = d3.sum(keyData) / window.length;
      result[key] = value;
    });
    return result;
  });
};

const FishPlot = ({rawData, dataLabel, filterLabel, enableBlankFilter, size: {width, height}, baseDate = '2019-12-31'}) => {
  if (!rawData.data || rawData.data.length === 0) {
    return (<div></div>);
  }

  const ref = useRef(null);
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState('');
  const [filterList, setFilterList] = useState([]);
  const [offsetType, setOffsetType] = useState('Silhouette');
  const [orderType] = useState('None');

  const labels = dataLabel === 'clade' ? Clades : Countries;
  const palettes = dataLabel === 'clade' ? CladeColors : CountryColors;
  const extPalettes = [...CarbonCategory14, ...d3.schemeCategory10];
  const keys = rawData[dataLabel];
  const colors = keys.map((key, i) => {
    const index = labels.findIndex((l) => l === key);
    if (index >= 0) {
      return palettes[index];
    } else {
      const c = extPalettes.pop();
      return c ? c : '#cccccc';
    }
  });
  const color = d3.scaleOrdinal().domain(keys).range(colors);

  const drawChart = async () => {
    const margin = {top: 0, right: 40, bottom: 20, left: 300};
    if (data.length === 0) {
      return;
    }
    const series = d3.stack().keys(keys).order(orders[orderType]).offset(offsets[offsetType])(data);
    // const x = d3.scaleLinear()
    //     .domain([0, Math.ceil(data.length / 10.0) * 10])
    //     .range([0, width - margin.left - margin.right]);
    const startDate = moment(baseDate, 'YYYY-MM-DD').add(1, 'days').toDate();
    const endDate = moment(baseDate, 'YYYY-MM-DD').add(data.length, 'days').toDate();
    const x = d3.scaleTime()
        .domain([startDate, endDate])
        .range([0, width - margin.left - margin.right]);
    const y = d3.scaleLinear()
        .domain([d3.min(series, (d) => d3.min(d, (d) => d[0])), d3.max(series, (d) => d3.max(d, (d) => d[1]))])
        .range([height - margin.top - margin.bottom, 0]);
    const area = d3.area()
        .curve(d3.curveBasis) // other candidate: curveCatmullRom.alpha(1), curveMonotoneX
        .x((d) => x(d.data.date))
        .y0((d) => y(d[0]))
        .y1((d) => y(d[1]));

    const svg = d3.select(ref.current);
    svg.attr('width', width).attr('height', height);

    // main plot
    const path = svg.select('g.area')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)
        .selectAll('path')
        .data(series)
        .join('path');
    path
        .attr('fill', ({key}) => color(key))
        .append('title')
        .text(({key}) => key);
    path
        .transition()
        .delay(100)
        .duration(1000)
        .attr('d', area);

    // x-axis
    const xAxis = d3.axisBottom().scale(x).ticks(d3.timeMonth.every(1));
    svg.select('g.xAxis')
        .attr('transform', `translate(${margin.left}, ${height - margin.bottom})`)
        .call(xAxis);
    // svg.select('g.xAxis text.title').remove();
    // svg.select('g.xAxis')
    //     .append('text')
    //     .attr('class', 'title')
    //     .attr('x', width - margin.left)
    //     .attr('y', 16)
    //     .attr('fill', '#161616')
    //     .attr('font-size', '10px')
    //     .style('text-anchor', 'end')
    //     .text('Days');

    // y-axis
    const yAxis = d3.axisLeft().scale(y).ticks(0).tickSize(0);
    svg.select('g.yAxis')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)
        .call(yAxis);

    // legend
    const lineHeight = 15;
    const itemWidth = 100;
    const itemsPerColumn = Math.floor((height - 80) / lineHeight);
    const items = keys.slice(0, itemsPerColumn * 3);
    const item = svg.select('g.legend')
        .selectAll('g')
        .data(items)
        .join('g')
        .attr('transform', (d, i) => `translate(${5 + Math.floor(i / itemsPerColumn) * itemWidth}, ${80 + (i % itemsPerColumn) * lineHeight})`);
    item.append('circle')
        .attr('transform', 'translate(5,0)')
        .attr('cx', 0)
        .attr('cy', 7)
        .attr('r', 5)
        .attr('stroke', (d) => color(d))
        .attr('fill', (d) => color(d))
        .attr('fill-opacity', 0.7);
    item.append('text')
        .attr('x', 15)
        .attr('y', 11)
        .attr('font-size', '10px')
        .text((d) => d);
  };

  const getDisplayData = () => {
    const filterData = rawData.data.filter((d) => filter === '(All)' || d[filterLabel] === filter).reduce((arr, d) => {
      const x = arr.find((x) => x.days === d.days);
      if (x) {
        x[d[dataLabel]] = x[d[dataLabel]] ? (x[d[dataLabel]] + d.value) : d.value;
      } else {
        arr.push({days: d.days, date: moment(baseDate, 'YYYY-MM-DD').add(d.days, 'days').toDate(), [d[dataLabel]]: d.value});
      }
      return arr;
    }, []);
    return movingAvg(filterData, keys, 3);
  };

  useEffect(() => {
    const filterList = enableBlankFilter ? ['(All)', ...rawData[filterLabel]] : rawData[filterLabel];
    setFilterList(filterList);
    setFilter(filterList.length > 0 ? filterList[0] : '');
    setData(getDisplayData());
  }, [rawData]);

  useEffect(() => {
    drawChart();
  }, [data, width, height]);

  useEffect(() => {
    setData(getDisplayData());
  }, [filter, offsetType]);

  return (
    <div>
      <div className={styles.selectArea}>
        <div>
          <div className={styles.selectLabel}>{filterLabel}</div>
          <div className={styles.select}>
            <Dropdown
              light
              size="sm"
              items={filterList}
              selectedItem={filter}
              id="clade-chart-filter"
              label="(All)"
              aria-label="clade-chart-filter"
              onChange={(event) => setFilter(event.selectedItem)} />
          </div>
        </div>
        <div style={{height: 8}}></div>
        <div>
          <div className={styles.selectLabel}>chart type</div>
          <div className={styles.select}>
            <Dropdown
              light
              size="sm"
              items={offsetList}
              selectedItem={offsetType}
              id="clade-chart-offset-type"
              label="(All)"
              aria-label="clade-chart-offset-type"
              onChange={(event) => setOffsetType(event.selectedItem)} />
          </div>
        </div>
      </div>
      <svg ref={ref}>
        <g className="area"></g>
        <g className="xAxis"></g>
        <g className="yAxis"></g>
        <g className="legend"></g>
      </svg>
    </div>
  );
};

FishPlot.propTypes = {
  rawData: PropTypes.shape({
    data: PropTypes.arrayOf(PropTypes.shape({
      days: PropTypes.number,
      clade: PropTypes.string,
      region: PropTypes.string,
      value: PropTypes.number,
    })),
    clade: PropTypes.arrayOf(PropTypes.string),
    region: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  dataLabel: PropTypes.string.isRequired,
  filterLabel: PropTypes.string.isRequired,
  enableBlankFilter: PropTypes.bool,
  size: PropTypes.shape({
    width: PropTypes.number,
    height: PropTypes.number,
  }).isRequired,
  baseDate: PropTypes.string,
};

export default FishPlot;
