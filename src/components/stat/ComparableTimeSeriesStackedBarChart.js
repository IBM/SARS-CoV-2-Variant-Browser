import React, {useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {Dropdown} from 'carbon-components-react';
import * as d3 from 'd3';

import styles from './ComparableTimeSeriesStackedBarChart.module.css';

const ComparableTimeSeriesStackedBarChart = ({data, type, name1, name2, height=320, labels, labelColors}) => {
  const svgLegendRef = useRef(null);
  const svgRef1 = useRef(null);
  const svgRef2 = useRef(null);

  const [filterList, setFilterList] = useState([]);
  const [filter1, setFilter1] = useState(name1);
  const [filter2, setFilter2] = useState(name2);
  const color = d3.scaleOrdinal()
      .domain(labels)
      .range(labelColors);

  const drawLegend = (ref) => {
    const svgLegend = d3.select(ref.current)
        .attr('width', '200px')
        .attr('height', '200px')
        .attr('viewBox', [0, 0, 250, 200]);
    const gLegend = svgLegend.select('g.legend')
        .attr('transform', `translate(10,0)`)
        .selectAll('g')
        .data(labels)
        .join('g')
        .attr('transform', (d, i) => `translate(0,${5 + i * 15})`);
    gLegend.append('circle')
        .attr('transform', 'translate(5,0)')
        .attr('cx', 0)
        .attr('cy', 7)
        .attr('r', 5)
        .attr('stroke', (d) => color(d))
        .attr('fill', (d) => color(d))
        .attr('fill-opacity', 0.7);
    gLegend.append('text')
        .attr('x', 15)
        .attr('y', 11)
        .text((d) => d);
  };

  const draw = (ref, targetName) => {
    const trends = data.filter((d) => d[type] === targetName);
    const weeks = Object.keys(trends.length === 0 ? {} : trends[0]).filter((d) => d.match(/[0-9/]+/g)).sort();
    const series = trends.reduce(
        (arr, v) => arr.map((d) => ({...d, [v.Detail]: Number(v[d.label])})),
        weeks.map((week) => ({label: week, name: week.substring(5), ...labels.reduce((obj, label) => ({...obj, [label]: 0}))})));
    const stack = d3.stack().keys(labels).order(d3.stackOrderReverse)(series).map((d) => (d.forEach((v) => v.key = d.key), d));

    const left = 30;
    const right = 10;
    const bottom = height - 48;

    const width = 500;
    const svg = d3.select(ref.current)
        .attr('width', '100%')
        .attr('height', `${height - 32}px`)
        .attr('viewBox', [0, 0, width, height - 32]);

    const x = d3.scaleBand()
        .domain(series.map((d) => d.name))
        .range([left, width - right - left])
        .padding(0.1);
    const y = d3.scaleLinear()
        .domain([0, d3.max(stack, (d) => d3.max(d, (d) => d[1]))])
        .range([bottom - 12, 4]);


    const labelStep = Math.ceil(weeks.length / 10);
    const xAxis = d3.axisBottom().scale(x).tickFormat((v, i) => i % labelStep === 0 ? v : '');
    svg.select('g.x-axis')
        .attr('transform', `translate(0, ${bottom - 12})`)
        .call(xAxis);

    const yAxis = d3.axisLeft().scale(y).ticks(8);
    svg.select('g.y-axis')
        .attr('transform', `translate(${left},0)`)
        .call(yAxis);

    const tooltip = svg.select('g.tooltip')
        .style('display', 'none');
    tooltip.append('text')
        .attr('x', 100)
        .attr('dy', '1.2em')
        .style('text-anchor', 'middle')
        .style('font-weight', 'bold')
        .attr('font-size', '12px');

    const chart = svg.select('g.chart')
        .selectAll('g')
        .data(stack)
        .join('g')
        .attr('fill', (d) => color(d.key))
        .selectAll('rect')
        .data((d) => d)
        .join('rect')
        .attr('x', (d, i) => x(d.data.name))
        .attr('width', x.bandwidth())
        .on('mouseover', () => tooltip.style('display', null))
        .on('mouseout', () => tooltip.style('display', 'none'))
        .on('mousemove', (d) => {
          const xPosition = d3.mouse(chart.node())[0] - 100;
          const yPosition = d3.mouse(chart.node())[1] + 10;
          tooltip.attr('transform', `translate(${xPosition}, ${yPosition})`);
          const tooltipText = `${d.key}: ${d[1] - d[0]}`;
          tooltip.select('text').text(tooltipText);
        })
        .attr('y', (d) => bottom)
        .attr('height', 0)
        .transition().duration(750)
        .delay((d, i) => i * 20)
        .ease(d3.easeExp)
        .attr('y', (d) => y(d[1]))
        .attr('height', (d) => y(d[0]) - y(d[1]));
  };
  useEffect(() => {
    const names = [...new Set(data.map((d) => d[type]))];
    setFilterList(names);
    drawLegend(svgLegendRef);
    draw(svgRef1, filter1);
    draw(svgRef2, filter2);
  }, [data]);
  useEffect(() => {
    draw(svgRef1, filter1);
  }, [filter1]);
  useEffect(() => {
    draw(svgRef2, filter2);
  }, [filter2]);

  return (
    <div>
      <div style={{width: '100%', height: 40, display: 'flex'}}>
        <div style={{width: 200, height: '100%'}}></div>
        <div style={{width: 'calc((100% - 200px) / 2)', height: '100%'}}>
          <div className={styles.selectLabel}>#1</div>
          <div className={styles.select}>
            <Dropdown
              light
              size="sm"
              items={filterList}
              selectedItem={filter1}
              id="clade-chart-filter"
              label="(All)"
              aria-label="clade-chart-filter"
              onChange={(event) => setFilter1(event.selectedItem)} />
          </div>
        </div>
        <div style={{width: 'calc((100% - 200px) / 2)', height: '100%'}}>
          <div className={styles.selectLabel}>#2</div>
          <div className={styles.select}>
            <Dropdown
              light
              size="sm"
              items={filterList}
              selectedItem={filter2}
              id="clade-chart-filter"
              label="(All)"
              aria-label="clade-chart-filter"
              onChange={(event) => setFilter2(event.selectedItem)} />
          </div>
        </div>
      </div>
      <div style={{width: '100%', height: '100%', display: 'flex'}}>
        <div style={{width: 200, height: '100%'}}>
          <svg ref={svgLegendRef}>
            <g className="legend"></g>
          </svg>
        </div>
        <div style={{width: 'calc((100% - 200px) / 2)', height: '100%'}}>
          <svg ref={svgRef1}>
            <g className="chart"></g>
            <g className="x-axis"></g>
            <g className="y-axis"></g>
            <g className="tooltip"></g>
          </svg>
        </div>
        <div style={{width: 'calc((100% - 200px) / 2)', height: '100%'}}>
          <svg ref={svgRef2}>
            <g className="chart"></g>
            <g className="x-axis"></g>
            <g className="y-axis"></g>
            <g className="tooltip"></g>
          </svg>
        </div>
      </div>
    </div>

  );
};

ComparableTimeSeriesStackedBarChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  labels: PropTypes.arrayOf(PropTypes.string).isRequired,
  labelColors: PropTypes.arrayOf(PropTypes.string).isRequired,
  height: PropTypes.number,
  name1: PropTypes.string.isRequired,
  name2: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
};

export default ComparableTimeSeriesStackedBarChart;
