import React, {useEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';

const TimeSeriesLineChart = ({data, labelProp, timeFormat = '%Y/%m/%d', labels, labelColors, width = 600, height = 320}) => {
  const svgRef = useRef(null);

  const draw = () => {
    const domainStr = Object.keys(data.length === 0 ? {} : data[0]).filter((d) => d.match(/[0-9/]+/g));
    domainStr.sort();
    const parseDate = d3.timeParse(timeFormat);
    const formatDate = d3.timeFormat('%Y/%m');
    const domainDate = domainStr.map((d) => parseDate(d));
    const series = data.map((d) => ({
      legend: d[labelProp],
      values: domainStr.map((key) => Number(d[key])),
    })).map((d) => ({
      ...d,
      total: d.values.reduce((sum, v) => sum + v, 0),
    }));
    series.sort((x, y) => y.total - x.total);
    const left = 20;
    const right = 120;
    const bottom = 300;
    const color = d3.scaleOrdinal()
        .domain(labels)
        .range(labelColors);

    const x = d3.scaleTime()
        .domain([domainDate[0], domainDate[domainDate.length - 1]])
        .range([left, width - right - left]);
    const y = d3.scaleLinear()
        .domain([
          d3.min(series, (d) => d3.min(d.values)),
          d3.max(series, (d) => d3.max(d.values)),
        ])
        .range([bottom, 0]);

    const svg = d3.select(svgRef.current)
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', [0, 0, width, height]);

    const gLegend = svg.select('g.legend')
        .attr('transform', `translate(${width - right},0)`)
        .selectAll('g')
        .data(series)
        .join('g')
        .attr('transform', (d, i) => `translate(0,${5 + i * 15})`);
    gLegend.append('circle')
        .attr('transform', 'translate(5,0)')
        .attr('cx', 0)
        .attr('cy', 7)
        .attr('r', 5)
        .attr('stroke', (d) => color(d.legend))
        .attr('fill', (d) => color(d.legend))
        .attr('fill-opacity', 0.7);
    gLegend.append('text')
        .attr('x', 15)
        .attr('y', 11)
        .text((d) => d.legend);

    const labelStep = 2;
    const xAxis = d3.axisBottom().scale(x).ticks(d3.timeMonth).tickFormat((d, i) => i % labelStep === 0 ? formatDate(d) : '');
    svg.select('g.x-axis')
        .attr('transform', `translate(0, ${bottom})`)
        .call(xAxis);

    const yAxis = d3.axisLeft().scale(y).ticks(8);
    svg.select('g.y-axis')
        .attr('transform', `translate(${left},0)`)
        .call(yAxis);

    const line = d3.line()
        .curve(d3.curveBasis)
        .x((d, i) => x(domainDate[i]))
        .y((d, i) => y(d));

    const path = svg.select('g.chart')
        .attr('transform', `translate(0,0)`)
        .selectAll('path')
        .data(series)
        .join('path')
        .attr('stroke', (d) => color(d.legend))
        .attr('stroke-width', 3)
        .attr('stroke-opacity', 0.7)
        .attr('fill', 'none')
        .attr('d', (d) => line(d.values));

    if (path.node()) {
      const totalLength = path.nodes().map((node) => node.getTotalLength());
      path
          .attr('stroke-dasharray', (d, i) => totalLength[i] + ' ' + totalLength[i])
          .attr('stroke-dashoffset', (d, i) => totalLength[i])
          .transition()
          .duration(1000)
          .ease(d3.easeLinear)
          .attr('stroke-dashoffset', 0);
    }
  };
  useEffect(() => {
    draw();
  }, [data]);

  return (
    <div style={{width: '100%', height: '100%'}}>
      <svg ref={svgRef}>
        <g className="chart"></g>
        <g className="x-axis"></g>
        <g className="y-axis"></g>
        <g className="legend"></g>
      </svg>
    </div>
  );
};

TimeSeriesLineChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  labelProp: PropTypes.string.isRequired,
  timeFormat: PropTypes.string,
  labels: PropTypes.arrayOf(PropTypes.string).isRequired,
  labelColors: PropTypes.arrayOf(PropTypes.string).isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
};

export default TimeSeriesLineChart;
