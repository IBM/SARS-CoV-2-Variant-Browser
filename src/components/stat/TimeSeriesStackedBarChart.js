import React, {useEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';

const TimeSeriesStackedBarChart = ({data, type, name, labels, labelColors, width = 600, height = 320}) => {
  const svgRef = useRef(null);

  const draw = () => {
    let trends = [];
    if (type === 'Geo_Region') {
      trends = data.filter((d) => d.Geo_Region === name).sort((a, b) => labels.indexOf(a.Detail) - labels.indexOf(b.Detail));
    } else if (type === 'Geo_Country') {
      trends = data.filter((d) => d.Geo_Country === name).sort((a, b) => labels.indexOf(a.Detail) - labels.indexOf(b.Detail));
    }
    const weeks = Object.keys(trends.length === 0 ? {} : trends[0]).filter((d) => d.match(/[0-9/]+/g)).sort();
    const series = weeks.map((week) => {
      const d = {};
      labels.forEach((label) => {
        const trend = trends.find((t) => t.Detail === label);
        d[label] = !!trend ? Number(trend[week]) : 0;
      });
      return {
        name: week.substring(5, week.length),
        ...d,
      };
    });
    const stack = d3.stack().keys(labels)(series).map((d) => (d.forEach((v) => v.key = d.key), d));

    const left = 20;
    const right = 120;
    const bottom = 300;
    const color = d3.scaleOrdinal()
        .domain(labels)
        .range(labelColors);

    const svg = d3.select(svgRef.current)
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', [0, 0, width, height]);

    const x = d3.scaleBand()
        .domain(series.map((d) => d.name))
        .range([left, width - right - left])
        .padding(0.1);
    const y = d3.scaleLinear()
        .domain([0, d3.max(stack, (d) => d3.max(d, (d) => d[1]))])
        .range([bottom - 12, 4]);

    const gLegend = svg.select('g.legend')
        .attr('transform', `translate(${width - right},0)`)
        .selectAll('g')
        .data(labels)
        .join('g')
        .attr('transform', (d, i) => `translate(0,${5 + i * 15})`);
    gLegend.append('circle')
        .attr('transform', 'translate(5,0)')
        .attr('cx', 0)
        .attr('cy', 7)
        .attr('r', 5)
        .attr('stroke', (d) => color(labelColors[labels.indexOf(d)]))
        .attr('fill', (d) => color(labelColors[labels.indexOf(d)]))
        .attr('fill-opacity', 0.7);
    gLegend.append('text')
        .attr('x', 15)
        .attr('y', 11)
        .text((d) => d);

    const xAxis = d3.axisBottom().scale(x);
    svg.select('g.x-axis')
        .attr('transform', `translate(0, ${bottom - 12})`)
        .call(xAxis)
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-0.5em')
        .attr('dy', '0.2em')
        .attr('transform', 'rotate(-45)');

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
        .attr('fill', (d) => color(labelColors[labels.indexOf(d.key)]))
        .selectAll('rect')
        .data((d) => d)
        .join('rect')
        .attr('x', (d, i) => x(d.data.name))
        .attr('width', x.bandwidth())
        .on('mouseover', () => tooltip.style('display', null))
        .on('mouseout', () => tooltip.style('display', 'none'))
        .on('mousemove', (d) => {
          const xPosition = d3.mouse(chart.node())[0] - 100;
          const yPosition = d3.mouse(chart.node())[1] - 25;
          tooltip.attr('transform', `translate(${xPosition}, ${yPosition})`);
          const tooltipText = `${d.key}: ${d[1] - d[0]}`;
          tooltip.select('text').text(tooltipText);
        })
        .attr('y', (d) => bottom)
        .attr('height', 0)
        .transition().duration(1000)
        .delay((d, i) => i * 30)
        .ease(d3.easeExp)
        .attr('y', (d) => y(d[1]))
        .attr('height', (d) => y(d[0]) - y(d[1]));
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
        <g className="tooltip"></g>
      </svg>
    </div>
  );
};

TimeSeriesStackedBarChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  labels: PropTypes.arrayOf(PropTypes.string).isRequired,
  labelColors: PropTypes.arrayOf(PropTypes.string).isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
  // Country Name or Continent Name
  name: PropTypes.string.isRequired,
  // Geo_Country or Geo_Region
  type: PropTypes.string.isRequired,
};

export default TimeSeriesStackedBarChart;
