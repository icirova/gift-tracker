import PropTypes from 'prop-types';
import { Bar } from 'react-chartjs-2';
import { ensureChartSetup } from '../../chartConfig';
import './style.css';

ensureChartSetup();

const GiftCountChart = ({ persons, giftCount, colors }) => {
  // Data pro graf Počet dárků
  const giftCountData = {
    labels: persons,
    datasets: [
      {
        label: 'Počet dárků',
        data: giftCount,
        backgroundColor: colors,
        borderColor: 'rgba(15, 23, 42, 0.08)',
        borderWidth: 1,
        borderRadius: 12,
        hoverBorderWidth: 2,
        hoverBorderColor: 'rgba(15, 23, 42, 0.2)',
      },
    ],
  };

  // Možnosti grafu
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        beginAtZero: true,
        display: false,
        barPercentage: 0.9,
        categoryPercentage: 1,
        ticks: {
          display: false, // Skrývá popisky na ose X
        },
        grid: {
          display: false, // Skrývá mřížku na ose X
        },
      },
      y: {
        beginAtZero: true,
        display: false, // Skrývá osu Y
        grid: {
          display: false, // Skrývá mřížku na ose Y
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return `${tooltipItem.label}: ${tooltipItem.raw} ks`;
          },
        },
      },
      datalabels: {
        color: '#0f172a',
        font: {
          weight: '600',
          size: 12,
        },
        formatter: (value, context) => {
          const label = context.chart.data.labels[context.dataIndex];
          return label?.charAt(0) ?? '';
        },
        anchor: 'center',
        align: 'center',
      },
      legend: {
        display: false, // Zneviditelní legendu mimo graf
      },
    },
  };

  return (
    <div className='chart chart--bar'>
      <h2 className='subtitle'>Počet dárků</h2>
      <Bar data={giftCountData} options={options} />
    </div>
  );
};

// Validace props pro ESLint
GiftCountChart.propTypes = {
  persons: PropTypes.arrayOf(PropTypes.string).isRequired, // Seznam jmen osob
  giftCount: PropTypes.arrayOf(PropTypes.number).isRequired, // Počet dárků pro každou osobu
  colors: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default GiftCountChart;
