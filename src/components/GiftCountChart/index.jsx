import PropTypes from 'prop-types';
import { Bar } from 'react-chartjs-2';
import { ensureChartSetup } from '../../chartConfig';
import { buildColorPalette } from '../../utils/colorPalette';
import './style.css';

ensureChartSetup();

const GiftCountChart = ({ persons, giftCount }) => {
  const colors = buildColorPalette(persons.length);

  // Data pro graf Počet dárků
  const giftCountData = {
    labels: persons,
    datasets: [
      {
        label: 'Počet dárků',
        data: giftCount,
        backgroundColor: colors,
        borderColor: 'rgba(0, 0, 0, 0.4)',
        borderWidth: 2,
        borderRadius: 10,
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
            return `${tooltipItem.raw} ks`;
          },
        },
      },
      datalabels: {
        color: '#fff',
        font: {
          weight: 'bold', // Tučné písmo
          size: 14, // Velikost písma
        },
        formatter: (value, context) => {
          const firstLetter = context.chart.data.labels[context.dataIndex].charAt(0); // První písmeno jména
          return firstLetter; // Zobrazení prvního písmena
        },
        anchor: 'center', // Umístění textu do středu sloupce
        align: 'center',  // Zarovnání textu na střed
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
};

export default GiftCountChart;
