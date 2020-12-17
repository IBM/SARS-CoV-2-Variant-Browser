import React, {
  useState,
  useEffect,
} from 'react';
import {
  Map,
  TileLayer,
  CircleMarker,
  Tooltip,
  ZoomControl,
} from 'react-leaflet-universal';
import * as d3 from 'd3';
import PropTypes from 'prop-types';
import styles from './WorldMapChart.module.css';
import {Types, TypeColors, Clades, CladeColors} from '../../helper/data-helper';

const RING_CHART_WIDTH = 100;
const RING_CHART_HEIGHT = 100;
const RING_MIN_RADIUS = 25;

const WorldMapChart = ({data, locations, size, onSelect}) => {
  if (size[0] === 0 || size[1] === 0) {
    return <div></div>;
  }

  const ringColorScale = d3.scaleOrdinal(d3.schemeSet1);
  const typeColorScale = d3.scaleOrdinal().domain(Types).range(TypeColors);
  const cladeColorScale = d3.scaleOrdinal().domain(Clades).range(CladeColors);

  const initialView = {
    lat: 34.0,
    lng: -0.38,
    zoom: 1,
  };

  const [bubble, setBubble] = useState([]);
  const [bubbleExtent, setBubbleExtent] = useState([0, 1000]);

  const width = size[0];
  const height = size[1];

  const resolveRadius = (bubbleItem) => {
    const bubbleScale = d3.scaleLinear()
        .domain(bubbleExtent)
        .range([10, 40]);
    return bubbleScale(bubbleItem.count);
  };

  const updateModel = () => {
    const unknownItem = {
      country: 'Unknown',
      lat: -13.773298,
      lng: 81.022476,
      count: 0,
      mutationCount: {},
      cladeCount: {},
    };
    let result = [unknownItem];
    data.forEach((dataItem) => {
      let bubbleItem = result.find((item) => {
        return item.country === dataItem.country;
      });
      if (!bubbleItem) {
        // find in location
        const foundLocation = locations.find((item) => {
          return item.country === dataItem.country;
        });
        if (foundLocation) {
          bubbleItem = {
            ...foundLocation,
            count: 0,
            mutationCount: {},
            cladeCount: {},
          };
          result.push(bubbleItem);
        }
      }

      // Unknown location
      if (!bubbleItem) {
        // console.warn(dataItem);
        bubbleItem = unknownItem;
      }

      bubbleItem.count++;
      const mutationFlags = {};
      dataItem.mutations.forEach((mutationItem) => {
        mutationFlags[`${mutationItem.mutation},${mutationItem.gene},${mutationItem.type}`] = 1;
      });

      Object.keys(mutationFlags).forEach((key) => {
        if (key in bubbleItem.mutationCount) {
          bubbleItem.mutationCount[key]++;
        } else {
          bubbleItem.mutationCount[key] = 1;
        }
      });

      if (dataItem.cladeDetail in bubbleItem.cladeCount) {
        bubbleItem.cladeCount[dataItem.cladeDetail]++;
      } else {
        bubbleItem.cladeCount[dataItem.cladeDetail] = 1;
      }
    });

    result = result.filter((item) => {
      return item.count > 0 && item.country != 'Unknown';
    });

    setBubbleExtent(d3.extent(result, (d) => {
      return d.count;
    }));

    setBubble(result);
  };


  useEffect(() => {
    if (data && locations) {
      updateModel();
    }
  }, [data, locations]);

  const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  // const TILE_URL = "http://tile.openstreetmap.jp/{z}/{x}/{y}.png";

  const drawCladeChart = (chartId, bubbleItem) => {
    let clades = Object.entries(bubbleItem.cladeCount).map((item) => {
      return {
        clade: item[0],
        count: item[1],
      };
    });
    clades.sort((a, b) => {
      return b.count - a.count;
    });
    if (clades.length > 5) {
      clades = clades.slice(0, 5);
    }

    const svg = d3.select(`#${chartId}`);
    svg.selectAll('#rootG')
        .remove();
    const rootG = svg.append('g')
        .attr('id', 'rootG');

    const radius = Math.min(RING_CHART_WIDTH, RING_CHART_WIDTH) / 2;

    const pie = d3.pie()
        .value((d) => d.count)
        .sort(null);

    const arc = d3.arc()
        .innerRadius(radius * 0.5)
        .outerRadius(radius);
    const arcs = pie(clades);
    const tween = (b) => {
      const interpolate = d3.interpolate({startAngle: 0, endAngle: 0}, b);
      return (t) => arc(interpolate(t));
    };

    rootG.append('g')
        .attr('id', 'pieG')
        .attr('transform', `translate(${RING_CHART_WIDTH/2}, ${RING_CHART_HEIGHT/2})`)
        .selectAll('path')
        .data(arcs)
        .join('path')
        .attr('fill', (d) => cladeColorScale(d.data.clade))
        .attr('fill-opacity', 1.0)
        .transition()
        .ease(d3.easeSin)
        .duration(1000)
        .attrTween('d', tween);

    // Label (Count)
    rootG.append('text')
        .attr('x', RING_CHART_WIDTH/2)
        .attr('y', RING_CHART_HEIGHT/2 - 5)
        .attr('font-size', '9pt')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-weight', 'bold')
        .text((d) => bubbleItem.count);
    rootG.append('text')
        .attr('x', RING_CHART_WIDTH/2)
        .attr('y', RING_CHART_HEIGHT/2 + 5)
        .attr('font-size', '8pt')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .text('samples');

    // Legend
    const legends = rootG.append('g')
        .attr('id', 'legendsG')
        .attr('transform', `translate(${RING_CHART_WIDTH + 5}, 10)`);
    legends
        .selectAll('circle')
        .data(clades)
        .enter()
        .append('circle')
        .attr('cx', 5)
        .attr('cy', (d, i) => {
          return (i + 1) * 12 - 3;
        })
        .attr('r', 5)
        .attr('fill', (d, i) => {
          return cladeColorScale(d.clade);
        })
        .attr('opacity', 1.0);
    legends
        .selectAll('text')
        .data(clades)
        .enter()
        .append('text')
        .attr('x', 12)
        .attr('y', (d, i) => {
          return (i + 1) * 12;
        })
        .attr('font-size', '8pt')
        .attr('fill', '#000')
        .attr('font-weight', 'bold')
        .text((d) => `${d.clade}`);
  };

  const drawMutationChart = (chartId, bubbleItem) => {
    let mutations = Object.keys(bubbleItem.mutationCount).map((key) => {
      const elms = key.split(',');
      return {
        mutation: elms[0],
        gene: elms[1],
        type: elms[2],
        count: bubbleItem.mutationCount[key],
      };
    });
    mutations.sort((a, b) => {
      return b.count - a.count;
    });
    if (mutations.length > 5) {
      mutations = mutations.slice(0, 5);
    }

    const scale = d3.scaleLinear()
        .domain([0, bubbleItem.count])
        .range([0, 2 * Math.PI]);

    const svg = d3.select(`#${chartId}`);
    svg.selectAll('#rootG')
        .remove();
    const rootG = svg.append('g')
        .attr('id', 'rootG');

    const chartRadius = Math.min(RING_CHART_WIDTH, RING_CHART_WIDTH) / 2;
    const arcPadding = 0;
    const numArcs = mutations.length;
    const arcWidth = (chartRadius - RING_MIN_RADIUS - numArcs * arcPadding) / numArcs;

    const arcTween = (d, i) => {
      const interpolate = d3.interpolate(0, d.count);
      return (t) => arc(interpolate(t), i);
    };

    const getInnerRadius = (index) => {
      return RING_MIN_RADIUS + (numArcs - (index + 1)) * (arcWidth + arcPadding);
    };

    const getOuterRadius = (index) => {
      return getInnerRadius(index) + arcWidth;
    };

    const arc = d3.arc()
        .innerRadius((d, i) => getInnerRadius(i))
        .outerRadius((d, i) => getOuterRadius(i))
        .startAngle(0)
        .endAngle((d, i) => scale(d));

    const arcs = rootG.append('g')
        .attr('id', 'arcsG')
        .attr('transform', `translate(${RING_CHART_WIDTH/2}, ${RING_CHART_HEIGHT/2})`)
        .selectAll('path')
        .data(mutations)
        .enter().append('path')
        .attr('class', 'arc')
        .style('fill', (d, i) => ringColorScale(i));

    arcs.transition()
        .delay((d, i) => i * 100)
        .duration(300)
        .attrTween('d', arcTween);

    // Label (Count)
    rootG.append('text')
        .attr('x', RING_CHART_WIDTH/2)
        .attr('y', RING_CHART_HEIGHT/2 - 5)
        .attr('font-size', '9pt')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-weight', 'bold')
        .text((d) => bubbleItem.count);
    rootG.append('text')
        .attr('x', RING_CHART_WIDTH/2)
        .attr('y', RING_CHART_HEIGHT/2 + 5)
        .attr('font-size', '8pt')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .text('samples');

    // Legend
    const legends = rootG.append('g')
        .attr('id', 'legendsG')
        .attr('transform', `translate(${RING_CHART_WIDTH + 5}, 10)`);
    legends
        .selectAll('circle')
        .data(mutations)
        .enter()
        .append('circle')
        .attr('cx', 5)
        .attr('cy', (d, i) => {
          return (i + 1) * 12 - 3;
        })
        .attr('r', 5)
        .attr('fill', (d, i) => {
          return typeColorScale(d.type);
        })
        .attr('opacity', 0.7);
    legends
        .selectAll('text')
        .data(mutations)
        .enter()
        .append('text')
        .attr('x', 12)
        .attr('y', (d, i) => {
          return (i + 1) * 12;
        })
        .attr('font-size', '8pt')
        .attr('fill', (d, i) => {
          return ringColorScale(i);
        })
        .attr('font-weight', 'bold')
        .text((d) => `${d.mutation},${d.gene} (${d.count})`);
  };

  const removeChart = (chartId) => {
    const svg = d3.select(`#${chartId}`);
    svg.selectAll('#rootG')
        .remove();
  };

  return (
    <Map
      center={[initialView.lat, initialView.lng]}
      zoom={initialView.zoom}
      style={{width, height}}
      zoomControl={false}
    >
      <TileLayer
        url={TILE_URL}
        attribution='© <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />
      { bubble.map((bubbleItem, index) => {
        const chartId = `country-${index}`;
        return (
          <CircleMarker
            key={index}
            center={[bubbleItem.lat, bubbleItem.lng]}
            fillColor="red"
            color="red"
            weight="1"
            onMouseOver={(e) => {
              e.target.setStyle({color: 'orange', fillColor: 'orange'});
              setTimeout(() => {
                if (process.env.MAP_TOOLTIP === 'mutation') {
                  drawMutationChart(chartId, bubbleItem);
                } else {
                  drawCladeChart(chartId, bubbleItem);
                }
              }, 0);
            }}
            onMouseOut={(e) => {
              e.target.setStyle({color: 'red', fillColor: 'red'});
              removeChart(chartId);
            }}
            onClick={(e) => {
              if (onSelect) {
                onSelect('country', -1, {country: bubbleItem.country});
              }
            }}
            label="label"
            radius={resolveRadius(bubbleItem)}>
            <Tooltip>
              <div className={styles.tooltipTitle}>
                { bubbleItem.country }
              </div>
              <div style={{width: 250, height: 100}}>
                <svg id={chartId} width="250" height="100"/>
              </div>
            </Tooltip>
          </CircleMarker>
        );
      })}
      <ZoomControl position="topright"/>
    </Map>
  );
};

WorldMapChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  locations: PropTypes.arrayOf(PropTypes.object),
  size: PropTypes.arrayOf(PropTypes.number),
  onSelect: PropTypes.func,
};

export default WorldMapChart;
