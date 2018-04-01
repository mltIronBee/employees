import React, { Component, PropTypes } from 'react';
import { max } from 'd3-array';
import { scaleTime, scaleLinear, scaleOrdinal } from 'd3-scale';
import { line as drawLine } from 'd3-shape';
import { select } from 'd3-selection';
import { timeParse } from 'd3-time-format';
import { axisBottom, axisLeft } from 'd3-axis';
import { schemeCategory10 } from 'd3-scale-chromatic';

class LineChart extends Component {
    renderChart = ({margin, data, xLabel, yLabel, highlighted}) => {
        const width = this.chart.offsetWidth - margin.left - margin.right;
        const height = this.chart.offsetHeight - margin.top - margin.bottom;
        const svg = select(this.chart).select('svg');
        //Clear all previously rendered lines, so we can draw new on same axis
        svg.selectAll('g').remove();
        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);
        const parseTime = timeParse('%Y-%m-%d');
        const x = scaleTime().range([0, width]);
        const y = scaleLinear().range([height, 0]);
        const colors = scaleOrdinal(schemeCategory10);
        const xAxis = axisBottom(x)
            .ticks(5)
            .tickSizeInner(-height)
            .tickSizeOuter(0)
            .tickPadding(20);
        const yAxis = axisLeft(y)
            .tickSizeInner(-width)
            .tickSizeOuter(0)
            .tickPadding(10);
        const line = drawLine()
            .x( d => x(parseTime(d.xVal)) )
            .y( d => y(d.yVal) );
        x.domain([parseTime(data[0].values[0].xVal),
            parseTime(data[0].values[data[0].values.length-1].xVal)]);
        y.domain([ 0,
            max( data, d => max( d.values, val => val.yVal ) )
        ]);
        colors.domain( data.map( d => d.id ) );
        //Draw x axis
        g.append('g')
            .attr('class', 'axis axis-x')
            .attr('transform', `translate(0, ${height})`)
            .call(xAxis)
                .append('text')
                .attr('y', -6)
                .attr('x', width)
                .attr('dx', '-0.71em')
                .attr('fill', '#000')
                .text(xLabel);

        //Draw y axis
        g.append('g')
            .attr('class', 'axis axis-y')
            .call(yAxis)
                .append('text')
                .attr('transform', 'rotate(-90)')
                .attr('y', 6)
                .attr('dy', '0.71em')
                .attr('fill', '#000')
                .text(yLabel);

        const chartLine = g.selectAll('.chart-line')
            .data(data)
            .enter().append('g')
                .attr('class', d => (highlighted && d.id === highlighted) || !highlighted ? 'chart-line' : 'chart-line insignificant' );

        chartLine.append('path')
            .attr('class', 'line')
            .attr('d', d => line(d.values))
            .style('stroke', d => colors(d.id));
    }

    componentDidMount() {
        this.renderChart(this.props);
    }

    componentDidUpdate(prevProps) {
        this.renderChart(this.props);
    }

    render() {
        return (
            <div className='chart-container' ref={ node => this.chart = node } ><svg></svg></div>
        );
    }
}

LineChart.propTypes = {
    margin: PropTypes.shape({
        top:    PropTypes.number.isRequired,
        left:   PropTypes.number.isRequired,
        bottom: PropTypes.number.isRequired,
        right:  PropTypes.number.isRequired
    }).isRequired,
    data: PropTypes.arrayOf(PropTypes.shape({
        id:     PropTypes.string,
        values: PropTypes.arrayOf(PropTypes.shape({
            xVal: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.number
            ]).isRequired,
            yVal: PropTypes.number.isRequired
        }))
    })).isRequired,
    xLabel: PropTypes.string,
    yLabel: PropTypes.string,
    highlighted: PropTypes.string
}

export default LineChart;
