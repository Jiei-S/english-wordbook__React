/**
 * chart
 */
import React from 'react';
import PropTypes from 'prop-types';

import { Doughnut, Line } from 'react-chartjs-2';


/**
 * LearningRate Legend
 * 
 * @param props
 *   - chartData: ChartData
 * @return Component
 */
const LearningRateLegend = (props) => (
  <div className="learning-rate-legend-wrap">
    {
      props.chartData.labels.map((label, idx) => {
        return (
          <React.Fragment key={idx}>
            <div className="learning-rate-shape-wrap">
              <span style={{ backgroundColor: props.chartData.datasets[0].backgroundColor[idx] }}></span>
              <div>{label}</div>
            </div>
            <div className="learning-rate-number">
              {props.chartData.datasets[0].data[idx]}
              <span className="small-unit-text">語</span>
            </div>
          </React.Fragment>
        );
      })
    }
  </div>
);

LearningRateLegend.propTypes = {
  chartData: PropTypes.object
};


/**
 * LearningRate Chart
 * 
 * @param props
 *   - isCorrectTotal: Correct Total Number
 *   - nonCorrectTotal: Not Correct Total Number
 * @return Component
 */
export const LearningRateChart = (props) => {
  const [isCorrectTotal, nonCorrectTotal] = [...Object.values(props)];
  const chartData = {
    labels: [
      '習得済み',
      '未習得'
    ],
    datasets: [{
      backgroundColor: [
        '#3ea8ff',
        '#66CC00'
      ],
      data: [
        isCorrectTotal,
        nonCorrectTotal
      ]
    }],
  };

  const chartOptions = {
    legend: {
      display: false,
    },
  };

  return (
    <div className="learning-rate-chart-wrap">
      <div className="learning-rate-chart">
        <Doughnut
          data={chartData}
          options={chartOptions}
        />
      </div>
      <LearningRateLegend
        chartData={chartData}
      />
    </div>
  );
};

LearningRateChart.propTypes = {
  isCorrectTotal: PropTypes.number,
  nonCorrectTotal: PropTypes.number
};


/**
 * LearningLog Chart
 * 
 * @param props
 *   - learningLog: LearningLog. Date and Total Number
 * @return Component
 */
export const LearningLogChart = (props) => {
  const [data, labels] = [[], []];
  props.learningLog.forEach(d => {
    data.push(d.count);
    labels.push(d.date);
  });

  const chartData = {
    labels: labels,
    datasets: [{
      fill: false,
      borderColor: '#3ea8ff',
      data: data
    }],
  };
  const chartOptions = {
    legend: {
      display: false,
    },
  };

  return (
    <Line
      data={chartData}
      options={chartOptions}
    />
  );
};

LearningLogChart.propTypes = {
  learningLog: PropTypes.array
};