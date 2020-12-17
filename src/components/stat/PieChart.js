import React, {useEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';

const PieChart = ({data, labelProp, valueProp, labels, labelColors, width = 500, height = 320}) => {
  const svgRef = useRef(null);

  const draw = () => {
    const targetData = [...data];
    targetData.sort((x, y) => y[valueProp] - x[valueProp]);

    const radius = Math.min(width, height) / 2;
    const color = d3.scaleOrdinal()
        .domain(labels)
        .range(labelColors);
    const pie = d3.pie()
        .sort(null)
        .value((d) => d[valueProp]);
    const arcLabel = d3.arc()
        .innerRadius(radius * 0.5)
        .outerRadius(radius);
    const arc = d3.arc()
        .innerRadius(radius * 0.5)
        .outerRadius(radius);
    const arcs = pie(targetData);
    const tween = (b) => {
      const interpolate = d3.interpolate({startAngle: 0, endAngle: 0}, b);
      return (t) => arc(interpolate(t));
    };

    const svg = d3.select(svgRef.current)
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', [0, 0, width, height]);

    svg.select('g.chart')
        .attr('transform', `translate(${radius}, ${radius})`)
        .attr('stroke', '#ffffff')
        .selectAll('path')
        .data(arcs)
        .join('path')
        .attr('fill', (d) => color(d.data[labelProp]))
        .attr('fill-opacity', 0.8)
        .transition()
        .ease(d3.easeSin)
        .duration(1000)
        .attrTween('d', tween);

    svg.select('g.label')
        .attr('transform', `translate(${radius}, ${radius})`)
        .attr('text-anchor', 'middle')
        .selectAll('text')
        .data(arcs)
        .join('text')
        .attr('transform', (d) => `translate(${arcLabel.centroid(d)})`)
        .call((text) => text.filter((d) => (d.endAngle - d.startAngle) > 0.15).append('tspan')
            .attr('y', '-0.4em')
            .attr('font-weight', 'bold')
            .text((d) => d.data[labelProp]))
        .call((text) => text.filter((d) => (d.endAngle - d.startAngle) > 0.15).append('tspan')
            .attr('x', 0)
            .attr('y', '0.7em')
            .text((d) => Number(d.data[valueProp]).toLocaleString()))
        .attr('opacity', 0)
        .transition()
        .ease(d3.easeSin)
        .delay(500)
        .duration(500)
        .attr('opacity', 1);

    const gLegend = svg.select('g.legend')
        .attr('transform', `translate(${radius * 2 + 10},0)`)
        .selectAll('g')
        .data(arcs)
        .join('g')
        .attr('transform', (d, i) => `translate(0,${5 + i * 15})`);
    gLegend.append('circle')
        .attr('transform', 'translate(5,0)')
        .attr('cx', 0)
        .attr('cy', 7)
        .attr('r', 5)
        .attr('stroke', (d) => color(d.data[labelProp]))
        .attr('fill', (d) => color(d.data[labelProp]))
        .attr('fill-opacity', 0.7);
    gLegend.append('text')
        .attr('x', 15)
        .attr('y', 11)
        .text((d) => d.data[labelProp] + ': ' + Number(d.data[valueProp]).toLocaleString());
  };
  useEffect(() => {
    draw();
  }, [data]);

  return (
    <div style={{width: '100%', height: '100%'}}>
      <svg ref={svgRef}>
        <g className="chart"></g>
        <g className="label"></g>
        <g className="legend"></g>
      </svg>
    </div>
  );
};

PieChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  labelProp: PropTypes.string.isRequired,
  valueProp: PropTypes.string.isRequired,
  labels: PropTypes.arrayOf(PropTypes.string).isRequired,
  labelColors: PropTypes.arrayOf(PropTypes.string).isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
};

export default PieChart;
