import React, {useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {Link, Checkbox, ContentSwitcher, Switch, Slider, OverflowMenu, OverflowMenuItem} from 'carbon-components-react';
import {ZoomIn20, ZoomOut20} from '@carbon/icons-react';
import * as d3 from 'd3';
import moment from 'moment-timezone';

import Tooltip from '../Tooltip';
import styles from './MutationsChart.module.css';
import {Types, GenesWithPosition, ORF1abCDS, TypeColors, Clades, CladeColors, Continents, ContinentColors, Countries, CountryColors, mutationToValue} from '../../helper/data-helper';
import {startAndFinishLoadingWith} from '../../helper/loading-helper';

const typeColor = d3.scaleOrdinal().domain(Types).range(TypeColors);
const cladeColor = d3.scaleOrdinal().domain(Clades).range(CladeColors);
const continentColor = d3.scaleOrdinal().domain(Continents).range(ContinentColors);
const countryColor = d3.scaleOrdinal().domain(Countries).range(CountryColors);

const MutationsChart = ({dataSet, size, onSelect, defaultType = 'rect', defaultBg = 'Clade', defaultZoom = 0, sampleSampling = 2000, detailLimit = 1000, recurrenceThreshold = 50}) => {
  if (size.width === 0 || size.height === 0) {
    return (<div></div>);
  }

  // General Drawing Setup
  const svgWidth = size.width - 20;
  const defaultOpacity = 0.7;
  const [showArea, setShowArea] = useState([0, 30000]);
  const top = 0;
  const left = 120;
  const lineHeight = 15;
  const x = d3.scaleLinear().domain(showArea).range([left, svgWidth]);
  const xAll = d3.scaleLinear().domain([0, 30000]).range([left, svgWidth]);

  // Tooltip
  const [tooltipOpen, setTooltipOpen] = useState(0);
  const [tooltipTargetEl, setTooltipTargetEl] = useState(null);
  const [tooltipData, setTooltipData] = useState({mutations: []});
  const openTooltip = (el) => {
    const key = el.getAttribute('aria-describedby');
    const [targetSample, targetMutation] = key.split('|');
    const value = mutationToValue(targetMutation);
    const sample = dataSet.samples.find((sample) => sample.sample === targetSample);
    const mutations = sample.mutations.filter((mutation) => Math.abs(mutationToValue(mutation.mutation) - value) < 200);
    setTooltipTargetEl(el);
    setTooltipData({...sample, mutations});
    setTooltipOpen((open) => open + 1);
  };
  const handleSelect = (label, index, data) => (event) => {
    event.preventDefault();
    if (onSelect) {
      onSelect(label, index, data);
      setTooltipOpen((open) => open - 1);
    }
  };

  // Draw Legends
  const [showLegend, setShowLegend] = useState(true);
  const [legendType, setLegendType] = useState('MutationType');
  const rotateLegend = () => {
    const rotate = ['MutationType', 'Clade', 'Continent', 'Country'];
    const index = rotate.indexOf(legendType);
    const next = rotate[(index + 1) % rotate.length];
    setLegendType(next);
  };
  const legendRef = useRef(null);
  const drawLegend = () => {
    const margin = {top: 15, right: 0, bottom: 15, left: 15};
    const height = 14;
    if (showLegend && svgWidth > 0) {
      const legendDataMap = {
        MutationType: {title: 'Mutation type', width: 170, height: 175, rows: 12, rowWidth: 170, data: Types, colorFunc: typeColor},
        Clade: {title: 'Clade', width: 240, height: 206, rows: 14, rowWidth: 240, data: Clades, colorFunc: cladeColor},
        Continent: {title: 'Continent', width: 120, height: 94, rows: 6, rowWidth: 120, data: Continents, colorFunc: continentColor},
        Country: {title: 'Country', width: 240, height: 150, rows: 10, rowWidth: 120, data: Countries.slice(0, 20), colorFunc: countryColor},
      };
      const legendData = legendDataMap[legendType];
      const svg = d3.select(legendRef.current);
      svg.attr('width', legendData.width + margin.left + margin.right).attr('height', legendData.height + margin.top + margin.bottom);

      svg.select('g.legends').remove();
      const g = svg.append('g')
          .attr('class', 'legends');
      g.append('rect')
          .attr('x', margin.left)
          .attr('y', 0)
          .attr('width', legendData.width)
          .attr('height', margin.top + legendData.height)
          .attr('stroke', 'gray')
          .attr('fill', 'rgba(210, 210, 210, 0.9');
      g.append('text')
          .attr('x', margin.left + 3)
          .attr('y', 13)
          .attr('font-size', height - 1)
          .attr('font-weight', 'bold')
          .text(legendData.title);
      const legend = svg.select('.legends')
          .selectAll('g')
          .data(legendData.data)
          .join('g')
          .attr('transform', (d, i) => `translate(${margin.left + 10 + Math.floor(i / legendData.rows) * legendData.rowWidth}, ${margin.top + 5 + (i % legendData.rows) * height})`);
      legend.append('circle')
          .attr('transform', 'translate(5,0)')
          .attr('cx', 0)
          .attr('cy', 7)
          .attr('r', 5)
          .attr('stroke', (d) => legendData.colorFunc(d))
          .attr('fill', (d) => legendData.colorFunc(d))
          .attr('fill-opacity', legendType === 'Clade' ? 1 : defaultOpacity);
      legend.append('text')
          .attr('x', 15)
          .attr('y', 11)
          .attr('font-size', height - 1)
          .text((d, i) => d);

      svg.select('g.switch').remove();
      const s = svg.append('g')
          .attr('class', 'switch')
          .attr('transform', `translate(3, ${margin.top + legendData.height - 8}) scale(0.6)`);
      s.append('rect')
          .attr('x', -2)
          .attr('y', -2)
          .attr('width', 36)
          .attr('height', 36)
          .attr('rx', 4)
          .attr('ry', 4)
          .attr('stroke', 'gray')
          .attr('fill', '#eeeeee')
          .style('cursor', 'pointer')
          .on('click', () => rotateLegend());
      s.append('path')
          .attr('d', 'M12 10H6.78A11 11 0 0127 16h2A13 13 0 006 7.68V4H4v8h8zM20 22h5.22A11 11 0 015 16H3a13 13 0 0023 8.32V28h2V20H20z')
          .attr('pointer-events', 'none');
    }
  };
  useEffect(() => drawLegend(), [size, showLegend, legendType]);

  // Draw X-AXIS
  const onSelectGeneMap = (name) => {
    if (name) {
      const area = GenesWithPosition.find((d) => d.name === name);
      setShowArea([area.start, area.end]);
    } else {
      setShowArea([0, 30000]);
    }
  };
  const onDrag = (name) => () => {
    const svg = d3.select(xAxisRef.current);
    let pos = Math.round(xAll.invert(d3.event.x));
    if (name === 'left') {
      pos = pos < 0 ? 0 : pos;
      pos = pos > showArea[1] - 100 ? showArea[1] - 100 : pos;
      svg.select('.m-left').attr('width', xAll(pos) - xAll(0));
      svg.select('.m-left-tick').attr('x', xAll(pos) - 3);
      svg.select('.m-left-line').attr('x1', xAll(pos));
      svg.select('.m-left-text').attr('x', xAll(pos) - 8).text(Math.ceil(pos).toLocaleString());
    } else {
      pos = pos < showArea[0] + 100 ? showArea[0] + 100 : pos;
      pos = pos > 30000 ? 30000 : pos;
      svg.select('.m-right').attr('x', xAll(pos)).attr('width', xAll(30000) - xAll(pos));
      svg.select('.m-right-tick').attr('x', xAll(pos));
      svg.select('.m-right-line').attr('x1', xAll(pos));
      svg.select('.m-right-text').attr('x', xAll(pos) + 5).text(Math.ceil(pos).toLocaleString());
    }
  };
  const onDrop = (name) => () => {
    let pos = Math.round(xAll.invert(d3.event.x));
    if (name === 'left') {
      pos = pos < 0 ? 0 : pos;
      pos = pos > showArea[1] - 100 ? showArea[1] - 100 : pos;
      setShowArea([pos, showArea[1]]);
    } else {
      pos = pos < showArea[0] + 100 ? showArea[0] + 100 : pos;
      pos = pos > 30000 ? 30000 : pos;
      setShowArea([showArea[0], pos]);
    }
  };

  const xAxisRef = useRef(null);
  const drawXAxis = () => {
    const svg = d3.select(xAxisRef.current);
    svg.attr('width', svgWidth).attr('height', 38 + 15);
    // X-AXIS
    const xAxis = d3.axisTop().scale(x).tickSize(3).ticks(5);
    const axis = svg.select('g.x-axis')
        .attr('transform', 'translate(0, 70)')
        .call(xAxis);
    axis.selectAll('text')
        .style('fill', '#161616');
    axis.select('path').remove();
    svg.select('g.x-axis > line').remove();
    axis
        .append('line')
        .attr('x1', xAll(0))
        .attr('x2', xAll(30000));
    svg.selectAll('line').attr('stroke', 'silver');

    // continent, country label
    const label = svg.select('g.x-label')
        .attr('transform', 'translate(0, 18)');
    label.selectAll('text').remove();
    label.append('text')
        .attr('x', 50)
        .attr('y', 40)
        .style('font-size', '11px')
        .style('font-color', 'silver')
        .text('Continent');
    label.append('text')
        .attr('x', 70)
        .attr('y', 52)
        .style('font-size', '11px')
        .style('font-color', 'silver')
        .text('Country');

    // showing area
    svg.selectAll('.mask').remove();
    svg.append('rect')
        .attr('class', 'mask m-left')
        .attr('x', xAll(0))
        .attr('y', 16)
        .attr('width', xAll(showArea[0]) - xAll(0))
        .attr('height', 25)
        .attr('fill', 'gray')
        .attr('opacity', 0.7)
        .attr('pointer-events', 'none');
    svg.append('rect')
        .attr('class', 'mask m-right')
        .attr('x', xAll(showArea[1]))
        .attr('y', 16)
        .attr('width', xAll(30000) - xAll(showArea[1]))
        .attr('height', 25)
        .attr('fill', 'gray')
        .attr('opacity', 0.7)
        .attr('pointer-events', 'none');
    svg.append('rect')
        .attr('class', 'mask m-left-tick')
        .attr('x', xAll(showArea[0]) - 3)
        .attr('y', 15)
        .attr('width', 3)
        .attr('height', 27)
        .attr('fill', 'black')
        .attr('cursor', 'ew-resize')
        .call(d3.drag().on('drag', onDrag('left')).on('end', onDrop('left')));
    svg.append('rect')
        .attr('class', 'mask m-right-tick')
        .attr('x', xAll(showArea[1]))
        .attr('y', 15)
        .attr('width', 3)
        .attr('height', 27)
        .attr('fill', 'black')
        .attr('cursor', 'ew-resize')
        .call(d3.drag().on('drag', onDrag('right')).on('end', onDrop('right')));
    svg.append('line')
        .attr('class', 'mask m-left-line')
        .attr('x1', xAll(showArea[0]))
        .attr('y1', 42)
        .attr('x2', xAll(0))
        .attr('y2', 70)
        .attr('stroke', 'silver')
        .attr('opacity', 0.5);
    svg.append('line')
        .attr('class', 'mask m-right-line')
        .attr('x1', xAll(showArea[1]))
        .attr('y1', 42)
        .attr('x2', xAll(30000))
        .attr('y2', 70)
        .attr('stroke', 'silver')
        .attr('opacity', 0.5);
    svg.append('text')
        .attr('class', 'mask m-left-text')
        .attr('text-anchor', 'end')
        .attr('x', xAll(showArea[0]) - 8)
        .attr('y', 33)
        .text('');
    svg.append('text')
        .attr('class', 'mask m-right-text')
        .attr('x', xAll(showArea[1]) + 5)
        .attr('y', 33)
        .text('');
    if (showArea[0] !== 0 || showArea[1] !== 30000) {
      svg.append('text')
          .attr('class', 'mask reset')
          .attr('x', left - 5)
          .attr('y', 33)
          .attr('fill', '#0f62fe')
          .attr('text-anchor', 'end')
          .attr('font-size', '12px')
          .attr('font-weight', 'bold')
          .attr('cursor', 'pointer')
          .text('Reset area')
          .on('click', () => onSelectGeneMap());
    }

    // Gene
    const oh = 20;
    const ih = 16;
    const line = d3.line().x((d) => xAll(d.x)).y((d) => d.y);
    const createPath = (data, h) => {
      const d = (data.end - data.start) < 200 ? (data.end - data.start) / 2 : 200;
      const c = [];
      c.push({x: data.start, y: (oh - h) / 2});
      c.push({x: data.start, y: (oh + h) / 2});
      c.push({x: data.end - d, y: (oh + h) / 2});
      c.push({x: data.end, y: h / 2});
      c.push({x: data.end - d, y: (oh - h) / 2});
      return c;
    };
    const gene = svg.select('g.x-gene')
        .attr('transform', 'translate(0, 18)');
    gene.selectAll('path.outer')
        .data(GenesWithPosition)
        .join('path')
        .attr('class', 'outer')
        .attr('d', (d) => line(createPath(d, oh)))
        .attr('fill', (d) => d.color)
        .attr('fill-opacity', 0.8)
        .attr('aria-describedby', (d) => d.name);
    const outerText = gene.selectAll('text.outer')
        .data(GenesWithPosition)
        .join('text')
        .attr('class', 'outer ' + styles.linkText)
        .attr('x', (d) => xAll(d.start + d.x))
        .attr('y', (d) => oh - 6 + d.y)
        .attr('font-size', '12px')
        .attr('fill', '#0f62fe')
        .attr('font-weight', 'bold')
        .text((d) => d.label)
    // .on('click', (d) => onSelect && onSelect('gene', 0, {mutations: [{gene: d.label}]}));
        .on('click', (d) => onSelectGeneMap(d.name));
    gene.selectAll('line.outer')
        .data(GenesWithPosition)
        .join('line')
        .attr('class', 'outer')
        .attr('x1', (d, i) => xAll(d.start + d.x) + outerText._groups[0][i].getBBox().width / 2)
        .attr('y1', (d, i) => oh + (d.y > 0 ? d.y - 15 : d.y - 3))
        .attr('x2', (d, i) => (xAll(d.start) + xAll(d.end)) / 2)
        .attr('y2', (d, i) => 10)
        .attr('stroke', (d) => d.y === 0 || d.name === 'ORF1ab' ? 'transparent' : 'black')
        .attr('stroke-opacity', 0.5)
        .attr('stroke-dasharray', '1,2');
    // draw inside ORF1ab
    gene.selectAll('path.inner')
        .data(ORF1abCDS)
        .join('path')
        .attr('class', 'inner')
        .attr('d', (d) => line(createPath(d, ih)))
        .attr('fill', (d) => d.color)
        .attr('fill-opacity', 0.8)
        .attr('aria-describedby', (d) => d.name);
    const innerText = gene.selectAll('text.inner')
        .data(ORF1abCDS)
        .join('text')
        .attr('class', 'inner')
        .attr('x', (d, i) => xAll(d.start + d.x))
        .attr('y', (d, i) => oh - 6 + d.y)
        .attr('fill', '#000000')
        .attr('font-size', '11px')
        .text((d) => d.label);
    gene.selectAll('line.inner')
        .data(ORF1abCDS)
        .join('line')
        .attr('class', 'inner')
        .attr('x1', (d, i) => xAll(d.start + d.x) + innerText._groups[0][i].getBBox().width / 2)
        .attr('y1', (d, i) => oh + (d.y > 0 ? d.y - 15 : d.y - 3))
        .attr('x2', (d, i) => (xAll(d.start) + xAll(d.end)) / 2)
        .attr('y2', (d, i) => 10)
        .attr('stroke', (d) => d.y === 0 ? 'transparent' : 'black')
        .attr('stroke-opacity', 0.5)
        .attr('stroke-dasharray', '1,2');
  };
  useEffect(() => drawXAxis(), [size, onSelect, showArea]);

  // Draw Main
  const [plotType, setPlotType] = useState(defaultType);
  const getInitialTargetData = () => {
    let data = [];
    if (plotType === 'circle') {
      data = dataSet.filteredSamples.slice(0, detailLimit);
    } else {
      const thinRatio = Math.round(dataSet.filteredSamples.length / sampleSampling);
      data = thinRatio <= 1 ? dataSet.filteredSamples : dataSet.filteredSamples.filter((item, i) => i % thinRatio === 0);
    }
    return data;
  };
  const [showTarget, setShowTarget] = useState({filtered: true, data: getInitialTargetData()});
  const updateShowTarget = (checked) => {
    if (checked) {
      setShowTarget({filtered: true, data: getInitialTargetData()});
    } else {
      setShowTarget({filtered: false, data: dataSet.samples});
    }
  };
  const extendShowTarget = () => {
    const data = dataSet.filteredSamples.slice(0, showTarget.data.length + detailLimit);
    setShowTarget({filtered: showTarget.filtered, data: data});
  };
  useEffect(() => {
    updateShowTarget(showTarget.filtered);
  }, [dataSet, plotType]);

  const svgRef = useRef(null);
  // Draw sample background
  const [bgHighlight] = useState(defaultBg);
  // const [bgHighlight, setBgHighlight] = useState(defaultBg);
  // const updateBgHighlight = (bgType) => {
  //   setBgHighlight(bgType);
  //   drawBackground(bgType);
  // };
  const drawBackground = (bgType) => {
    const updateRect = (select, lineHeight, highlight) => {
      const rect = select
          .attr('width', x(30000) - left)
          .attr('height', lineHeight);
      if (highlight === 'Clade') {
        rect.attr('fill', (d) => cladeColor(d.cladeDetail)).attr('fill-opacity', 0.7);
      } else {
        rect.attr('fill', (d) => d.match ? '#FFE082' : 'transparent').attr('fill-opacity', 0.2);
      }
    };
    const createRect = (select, lineHeight, highlight) => select
        .append('rect')
        .attr('class', styles.sample)
        .attr('aria-describedby', (d) => d.sample)
        .attr('x', left)
        .attr('y', 0)
        .attr('stroke-width', 0)
        .attr('shape-rendering', 'optimizeSpeed')
        .call(updateRect, lineHeight, highlight);

    d3.select(svgRef.current)
        .select('g.area')
        .selectAll('g')
        .data(showTarget.data, (d, i) => d.sample)
        .join(
            (entry) => entry
                .append('g')
                .attr('transform', (d, i) => `translate(0, ${i * lineHeight})`)
                .call(createRect, lineHeight, bgType),
            (update) =>
              update
                  .attr('transform', (d, i) => `translate(0, ${i * lineHeight})`)
                  .select(`rect.${styles.sample}`)
                  .call(updateRect, lineHeight, bgType),
        );
  };
  // useEffect(() => drawBackground(), [bgHighlight]);

  // Draw variant
  const drawVariant = () => {
    const maxHeight = showTarget.data.length * lineHeight;
    const enableZoom = plotType === 'rect' && maxHeight > (size.height - 110);
    const minRatio = enableZoom ? (size.height - 110) / maxHeight : 1.0;
    const ratio = enableZoom && minRatio * (zoom + 1) < 1.0 ? minRatio * (zoom + 1) : 1.0;
    const svgHeight = top + Math.ceil(maxHeight * ratio);

    const svg = d3.select(svgRef.current)
        .attr('width', svgWidth)
        .attr('height', svgHeight)
        .select('g.container')
        .attr('transform-origin', 'top left')
        .attr('transform', `scale(1, ${ratio})`);

    // Main Area
    // clip-path
    svg.select('clipPath').remove();
    svg.append('clipPath')
        .attr('id', 'clip-main')
        .append('rect')
        .attr('x', left)
        .attr('y', 0)
        .attr('width', svgWidth - left)
        .attr('height', maxHeight);

    const entry = svg.select('g.area')
        .attr('clip-path', 'url(#clip-main)')
        .selectAll('g')
        .data(showTarget.data, (d) => d.sample)
        .join('g')
        .attr('transform', (d, i) => `translate(0, ${i * lineHeight})`);

    // mutation background
    // disable background at mutation level for performance
    // const createMutationBG = (s, lineHeight) => s.attr('class', 'mutationbg')
    //     .attr('x', (d) => x(mutationToValue(d.mutation)) - lineHeight / 2)
    //     .attr('y', 0)
    //     .attr('width', lineHeight)
    //     .attr('height', lineHeight)
    //     .attr('stroke-width', 0)
    //     .attr('fill', (d) => d.match ? '#FFE082' : 'transparent')
    //     .attr('fill-opacity', 0.9)
    //     .attr('shape-rendering', 'optimizeSpeed');
    // const updateMutationBG = (s, lineHeight) => s.attr('width', lineHeight)
    //     .attr('x', (d) => x(mutationToValue(d.mutation)) - lineHeight / 2)
    //     .attr('height', lineHeight)
    //     .attr('fill', (d) => d.match ? '#FFE082' : 'transparent');
    // entry.selectAll(`rect.mutationbg`)
    //     .data((d) => d.mutations, (d) => d.mutation)
    //     .join(
    //         (enter) => enter.append('rect').call(createMutationBG, lineHeight),
    //         (update) => update.call(updateMutationBG, lineHeight),
    //     );

    // mutation as rect
    const createVariantAsRect = (s) => s.attr('class', styles.mutation)
        .attr('aria-describedby', (d) => `${d.sample}|${d.mutation}`)
        // .attr('x', (d) => x(mutationToValue(d.mutation)) - 2)
        .attr('x', (d) => x(mutationToValue(d.mutation)) - 1.5)
        .attr('y', 0)
        // .attr('width', 4)
        .attr('width', 3)
        .attr('height', lineHeight)
        .attr('stroke-width', 0)
        .attr('fill', (d) => typeColor(d.type))
        .attr('fill-opacity', defaultOpacity)
        .attr('shape-rendering', 'optimizeSpeed')
        .on('mouseenter', () => openTooltip(d3.event.target))
        .on('mouseleave', () => setTimeout(() => setTooltipOpen((open) => open - 1), 400));
    // const updateVariantAsRect = (s) => s.attr('x', (d) => x(mutationToValue(d.mutation)) - 2);
    const updateVariantAsRect = (s) => s.attr('x', (d) => x(mutationToValue(d.mutation)) - 1.5);
    // mutation as circle
    const createVariantAsCircle = (s) => s.attr('class', styles.mutation)
        .attr('aria-describedby', (d) => `${d.sample}|${d.mutation}`)
        .attr('cx', (d) => x(mutationToValue(d.mutation)))
        .attr('cy', lineHeight / 2)
        // .attr('r', 5)
        .attr('r', 4)
        .attr('stroke', (d) => typeColor(d.type))
        .attr('fill', (d) => typeColor(d.type))
        .attr('fill-opacity', defaultOpacity)
        .on('mouseenter', () => openTooltip(d3.event.target))
        .on('mouseleave', () => setTimeout(() => setTooltipOpen((open) => open - 1), 450));
    const updateVariantAsCircle = (s) => s.attr('cx', (d) => x(mutationToValue(d.mutation)));

    // mutation
    svg.select('g.bottomRect').remove();
    if (plotType === 'rect') {
      entry.selectAll(`circle.${styles.mutation}`).remove();
      entry.selectAll(`rect.${styles.mutation}`)
          .data((d) => d.mutations.filter((i) => i.c >= recurrenceThreshold), (d) => d.mutation)
          .join(
              (enter) => enter.append('rect').call(createVariantAsRect),
              (update) => update.call(updateVariantAsRect),
          );
    } else {
      entry.selectAll(`rect.${styles.mutation}`).remove();
      entry.selectAll(`circle.${styles.mutation}`)
          .data((d) => d.mutations)
          .join(
              (entry) => entry.append('circle').call(createVariantAsCircle),
              (update) => update.call(updateVariantAsCircle),
          );
      // show button to load more if all data is not displayed
      if (dataSet.filteredSamples.length != showTarget.data.length) {
        const g = svg
            .append('g')
            .attr('class', 'bottomRect')
            .attr('transform', `translate(0, ${(showTarget.data.length - 2) * lineHeight})`);
        g.append('rect')
            .attr('x', x(showArea[0]))
            .attr('width', x(showArea[1]) - x(showArea[0]))
            .attr('height', lineHeight * 2)
            .attr('stroke-width', 0)
            .attr('fill', '#0353e9')
            .attr('shape-rendering', 'optimizeSpeed')
            .style('cursor', 'pointer')
            .on('click', () => extendShowTarget());
        g.append('text')
            .attr('x', (x(showArea[1]) + x(showArea[0])) / 2)
            .attr('y', lineHeight)
            .attr('dominant-baseline', 'middle')
            .attr('text-anchor', 'middle')
            .attr('fill', '#ffffff')
            .attr('pointer-events', 'none')
            .text(`Click to load more (${Number(dataSet.filteredSamples.length - showTarget.data.length).toLocaleString()} more samples)`);
      }
    }
  };

  // Draw Y-Axis
  const drawYAxis = () => {
    const miniTooltip = d3.select(`.${styles.miniTooltip}`);
    const createContinent = (s, lineHeight) => s.append('rect')
        .attr('x', 60)
        .attr('y', 0)
        .attr('width', 20)
        .attr('height', lineHeight)
        .attr('stroke-width', 0)
        .attr('fill', (d) => continentColor(d.continent))
        .attr('opacity', defaultOpacity)
        .attr('shape-rendering', 'optimizeSpeed')
        .on('mouseover', (d) => miniTooltip.style('visibility', 'visible').html(d.continent))
        .on('mousemove', (d) => miniTooltip.style('top', `${d3.event.pageY}px`).style('left', `${d3.event.pageX + 10}px`))
        .on('mouseout', (d) => miniTooltip.style('visibility', 'hidden'));
    const createCountry = (s, lineHeight) => s.append('rect')
        .attr('x', 80)
        .attr('y', 0)
        .attr('width', 20)
        .attr('height', lineHeight)
        .attr('stroke-width', 0)
        .attr('fill', (d) => countryColor(d.country))
        .attr('opacity', defaultOpacity)
        .attr('shape-rendering', 'optimizeSpeed')
        .on('mouseover', (d) => miniTooltip.style('visibility', 'visible').html(d.country))
        .on('mousemove', (d) => miniTooltip.style('top', `${d3.event.pageY}px`).style('left', `${d3.event.pageX + 10}px`))
        .on('mouseout', (d) => miniTooltip.style('visibility', 'hidden'));
    const createText = (s, lineHeight, opacity) => s.append('text')
        .attr('y', 10 + (lineHeight - 10) / 2)
        .attr('opacity', opacity)
        .attr('pointer-events', 'none')
        .text((d) => d.sample);
    const updateText = (s, opacity) => s
        .select('text')
        .attr('opacity', opacity);

    d3.select(svgRef.current)
        .select('g.y-axis')
        .attr('font-size', `11px`)
        .selectAll('g')
        .data(showTarget.data, (d) => d.sample)
        .join(
            (enter) => enter.append('g')
                .attr('transform', (d, i) => `translate(0, ${i * lineHeight})`)
                .call(createContinent, lineHeight)
                .call(createCountry, lineHeight)
                .call(createText, lineHeight, plotType === 'circle' ? 1 : 0),
            (update) => update.attr('transform', (d, i) => `translate(0, ${i * lineHeight})`)
                .call(updateText, plotType === 'circle' ? 1 : 0),
        );
  };

  useEffect(() => startAndFinishLoadingWith(() => {
    drawBackground(bgHighlight);
    drawYAxis();
    drawVariant();
  }), [size, showTarget, showArea]);

  // Zoom handling
  const [zoom, setZoom] = useState(defaultZoom);
  useEffect(() => {
    const maxHeight = showTarget.data.length * lineHeight;
    const enableZoom = plotType === 'rect' && maxHeight > (size.height - 100);
    if (enableZoom) {
      const minRatio = (size.height - 100) / maxHeight;
      const ratio = (minRatio * (zoom + 1)) < 1.0 ? minRatio * (zoom + 1) : 1.0;
      const svgHeight = top + Math.ceil(maxHeight * ratio);
      d3.select(svgRef.current)
          .attr('height', svgHeight)
          .select('g.container')
          .attr('transform-origin', 'top left')
          .attr('transform', `scale(1, ${ratio})`);
    }
  }, [zoom]);

  const maxHeight = showTarget.data.length * lineHeight;
  const enableZoom = plotType === 'rect' && maxHeight > (size.height - 100);
  const zoomOut = (<span><ZoomOut20 style={{display: 'inline-block', marginTop: 4}} /></span>);
  const zoomIn = (<span><ZoomIn20 style={{display: 'inline-block', marginTop: 4}} /></span>);

  // export image
  const generageSvg = () => {
    const svg = document.createElement('svg');
    let offsetX = 0;
    const offsetY = 75;
    if (showLegend) {
      const legend = legendRef.current.cloneNode(true);
      const d3legend = d3.select(legend);
      d3legend.attr('x', 0).attr('y', offsetY).select('.switch').remove();
      offsetX = Number(d3legend.attr('width')) + (plotType === 'circle' ? 10 : -30);
      svg.appendChild(legend);
    }
    const axis = xAxisRef.current.cloneNode(true);
    const d3axis = d3.select(axis);
    d3axis.attr('x', offsetX).attr('y', 0);
    d3axis.select('.reset').remove();
    svg.appendChild(axis);
    const main = svgRef.current.cloneNode(true);
    const d3main = d3.select(main);
    d3main.attr('x', offsetX).attr('y', offsetY);
    if (plotType === 'circle') {
      d3main.select('.bottomRect rect').style('cursor', 'auto');
      const text = d3main.select('.bottomRect text').text();
      d3main.select('.bottomRect text').text(text.replace('Click to load more ', ''));
    }
    svg.appendChild(main);
    d3.select(svg)
        .attr('xmlns', 'http://www.w3.org/2000/svg')
        .attr('transform-origin', 'top left')
        .attr('transform', 'scale(1.0)')
        .attr('width', offsetX + Number(d3main.attr('width')) + 30)
        .attr('height', offsetY + Number(d3main.attr('height')) + 10)
        .style('font-family', '"IBM Plex Sans", "Helvetica Neue", Arial, sans-serif');
    return svg;
  };

  const saveAsSvgFile = () => {
    const svg = generageSvg();
    const svgFile = new Blob(['\ufeff', svg.outerHTML], {type: 'image/svg+xml'});
    const svgUrl = URL.createObjectURL(svgFile);
    const downLoadLink = document.createElement('a');
    downLoadLink.download = 'variant_browser_' + moment().format('YYYYMMDDHHmmss') + '.svg';
    downLoadLink.href = svgUrl;
    downLoadLink.dataset.downloadurl = ['image/svg+xml', downLoadLink.download, downLoadLink.href].join(':');
    downLoadLink.click();
  };

  const saveAsPngFile = () => {
    const svg = generageSvg();
    const svgFile = new Blob(['\ufeff', svg.outerHTML], {type: 'image/svg+xml'});
    const svgUrl = URL.createObjectURL(svgFile);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      const scaleFactor = 192 / 96;
      canvas.width = Math.ceil(Number(svg.getAttribute('width')) * scaleFactor);
      canvas.height = Math.ceil(Number(svg.getAttribute('height')) * scaleFactor);
      ctx.scale(scaleFactor, scaleFactor);
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(svgUrl);
      const downLoadLink = document.createElement('a');
      downLoadLink.download = 'variant_browser_' + moment().format('YYYYMMDDHHmmss') + '.png';
      downLoadLink.href = canvas.toDataURL('image/png');
      downLoadLink.dataset.downloadurl = ['image/png', downLoadLink.download, downLoadLink.href].join(':');
      downLoadLink.click();
    };
    img.src = svgUrl;
  };

  // export id list
  const saveSamples = () => {
    const tsv = [];
    const tsvHeader = 'Accession ID\n';
    tsv.push(tsvHeader);
    dataSet.filteredSamples.forEach((item) => {
      const tsvBody = item.sample + '\n';
      tsv.push(tsvBody);
    });
    const downLoadLink = document.createElement('a');
    downLoadLink.download = 'sars_cov2_variant_browser_samples_' + moment().format('YYYYMMDDHHmmss') + '.tsv';
    const file = new Blob(tsv, {type: 'text/tab-separated-values'});
    downLoadLink.href = URL.createObjectURL(file);
    downLoadLink.dataset.downloadurl = ['text/tab-separated-values', downLoadLink.download, downLoadLink.href].join(':');
    downLoadLink.click();
  };

  return (
    <div>
      <div className={styles.header}>
        <div className={styles.headerMenu}>
          <div className={styles.switch}>
            <ContentSwitcher onChange={(event) => setPlotType(event.name)} selectedIndex={['rect', 'circle'].findIndex((s) => s === plotType)}>
              <Switch name="rect" text="Overlook" />
              <Switch name="circle" text="Detail" />
            </ContentSwitcher>
          </div>
          <div className={styles.slider} style={{display: plotType === 'rect' ? 'block' : 'none'}}>
            <Slider disabled={!enableZoom} id="zoomRatio" formatLabel={(val, label) => val < 8 ? zoomOut : zoomIn} max={20} min={0} step={1} value={zoom} hideTextInput onChange={(event) => setZoom(event.value)} />
          </div>
          <div style={{flexGrow: 1}}></div>
          {/* <div>
            <Checkbox id="showFiltered" defaultChecked={showTarget.filtered} labelText="Show filtered data" onChange={(checked) => updateShowTarget(checked)}></Checkbox>
          </div> */}
          <div>
            <Checkbox id="legend" defaultChecked={showLegend} labelText="Show legend" onChange={(checked) => setShowLegend(checked)}></Checkbox>
          </div>
          <div>
            <OverflowMenu iconClass={styles.menuIcon}>
              <li className={styles.menuHeader}>Export</li>
              <OverflowMenuItem itemText="image as SVG" onClick={saveAsSvgFile} />
              <OverflowMenuItem itemText="image as PNG" onClick={saveAsPngFile} />
              <OverflowMenuItem itemText="sample IDs as text" onClick={saveSamples} />
              {/* <li className={styles.menuHeader}>Highlighting Mode</li>
              <OverflowMenuItem itemText="Clade" wrapperClassName={bgHighlight === 'Clade' ? styles.menuChecked : ''} onClick={() => updateBgHighlight('Clade')} />
              <OverflowMenuItem itemText="Filtering" wrapperClassName={bgHighlight === 'Filtering' ? styles.menuChecked : ''} onClick={() => updateBgHighlight('Filtering')} /> */}
              <li className={styles.menuHeader}>Showing Legend</li>
              <OverflowMenuItem itemText="Clade" wrapperClassName={`${styles.menuItem} ${legendType === 'Clade' ? styles.menuChecked : ''}`} onClick={() => setLegendType('Clade')} />
              <OverflowMenuItem itemText="Continent" wrapperClassName={`${styles.menuItem} ${legendType === 'Continent' ? styles.menuChecked : ''}`} onClick={() => setLegendType('Continent')} />
              <OverflowMenuItem itemText="Country" wrapperClassName={`${styles.menuItem} ${legendType === 'Country' ? styles.menuChecked : ''}`} onClick={() => setLegendType('Country')} />
              <OverflowMenuItem itemText="Mutation Type" wrapperClassName={`${styles.menuItem} ${legendType === 'MutationType' ? styles.menuChecked : ''}`} onClick={() => setLegendType('MutationType')} />
            </OverflowMenu>
          </div>
        </div>
        <div>
          <svg ref={xAxisRef} style={{overflow: 'visible'}}>
            <g className="x-axis"></g>
            <g className="x-label"></g>
            <g className="x-gene"></g>
          </svg>
        </div>
      </div>
      <div style={{marginTop: 100}}>
        <svg ref={svgRef}>
          <g className="container">
            <g className="area"></g>
            <g className="y-axis"></g>
          </g>
        </svg>
      </div>
      <div style={{position: 'absolute', left: '16px', bottom: '16px', display: showLegend ? 'block' : 'none'}}>
        <svg ref={legendRef}></svg>
      </div>
      <Tooltip open={tooltipOpen > 0} anchorEl={tooltipTargetEl}>
        <div data-testid="tooltip-area" onMouseEnter={() => setTooltipOpen((open) => open + 1)} onMouseLeave={() => setTooltipOpen((open) => open - 1)}>
          <div className={styles.tooltipLabel}>Sample</div>
          <div className={styles.tooltipValue}>
            <Link data-testid="sample" href="#" onClick={handleSelect('sample', -1, tooltipData)}>{tooltipData.sample}</Link>
          </div>
          <div className={styles.tooltipLabel} style={{display: 'none'}}>Isolate</div>
          <div className={styles.tooltipValue} style={{display: 'none'}}>
            <Link disabled href="#" onClick={handleSelect('isolate', -1, tooltipData)}>{tooltipData.isolate}</Link>
          </div>
          <div className={styles.tooltipLabel}>Clade</div>
          <div className={styles.tooltipValue}>
            <Link disabled href="#" onClick={handleSelect('cladeDetail', -1, tooltipData)}>{tooltipData.cladeDetail}</Link>
          </div>
          <div className={styles.tooltipLabel}>Location</div>
          <div className={styles.tooltipValue}>
            <Link data-testid="country" href="#" onClick={handleSelect('country', -1, tooltipData)}>{tooltipData.country}</Link>,&nbsp;
            <Link data-testid="continent" href="#" onClick={handleSelect('continent', -1, tooltipData)}>{tooltipData.continent}</Link>
          </div>
          <div className={styles.tooltipLabel}>Collection Date</div>
          <div className={styles.tooltipValue}>
            <Link disabled href="#" onClick={handleSelect('collectionDate', -1, tooltipData)}>{tooltipData.collectionDate}</Link>
          </div>
          <div className={styles.tooltipLabel}>Type</div>
          <div className={styles.tooltipValue}>
            {tooltipData.mutations.map((mutation, idx) => (
              <React.Fragment key={mutation.mutation}>
                {idx > 0 && ', '}
                <Link disabled href="#" onClick={handleSelect('type', idx, tooltipData)}>{mutation.type}</Link>
              </React.Fragment>
            ))}
          </div>
          <div className={styles.tooltipLabel}>Mutation</div>
          <div className={styles.tooltipValue}>
            {tooltipData.mutations.map((mutation, idx) => (
              <React.Fragment key={mutation.mutation}>
                {idx > 0 && ', '}
                <Link href="#" onClick={handleSelect('mutation', idx, tooltipData)}>{mutation.mutation}</Link>
              </React.Fragment>
            ))}
          </div>
          <div className={styles.tooltipLabel}>Gene</div>
          <div className={styles.tooltipValue}>
            {tooltipData.mutations.map((mutation, idx) => (
              <React.Fragment key={mutation.mutation}>
                {idx > 0 && ', '}
                <Link data-testid="gene" href="#" onClick={handleSelect('gene', idx, tooltipData)}>{mutation.gene === '' ? 'n/a' : mutation.gene}</Link>
              </React.Fragment>
            ))}
          </div>
          <div className={styles.tooltipLabel}>AA change</div>
          <div className={styles.tooltipValue}>
            {tooltipData.mutations.map((mutation, idx) => (
              <React.Fragment key={mutation.mutation}>
                {idx > 0 && ', '}
                <Link data-testid="AA_change" href="#" onClick={handleSelect('AA_change', idx, tooltipData)}>{mutation.AA_change === '' ? 'n/a' : mutation.AA_change}</Link>
              </React.Fragment>
            ))}
          </div>
        </div>
      </Tooltip>
      <div className={styles.miniTooltip}></div>
    </div>
  );
};

MutationsChart.propTypes = {
  dataSet: PropTypes.object.isRequired,
  size: PropTypes.object.isRequired,
  onSelect: PropTypes.func,
  defaultType: PropTypes.string,
  defaultBg: PropTypes.string,
  defaultZoom: PropTypes.number,
  sampleSampling: PropTypes.number,
  detailLimit: PropTypes.number,
  recurrenceThreshold: PropTypes.number,
};

export default MutationsChart;
