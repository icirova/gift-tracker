import PropTypes from 'prop-types';
import { Bar } from 'react-chartjs-2';
import './style.css';


const GiftCountChart = ({ persons, giftCount }) => {

  // Vánoční barvy pro segmenty grafu
  const colors = [
    'rgba(128, 0, 128, 0.8)', // Fialová
    'rgba(0, 0, 255, 0.8)',   // Modrá
    'rgba(255, 0, 0, 0.8)',   // Červená
    'rgba(0, 128, 0, 0.8)',   // Zelená
    'rgba(255, 165, 0, 0.8)', // Oranžová
    'rgba(255, 215, 0, 0.8)', // Zlatá
  ];

  // Data pro graf Počet dárků
  const giftCountData = {
    labels: persons,
    datasets: [
      {
        label: 'Počet dárků',
        data: giftCount,
        backgroundColor: colors,
        borderColor: colors.map(color => color.replace('0.8', '1')), // Použití stejné barvy pro okraje
        borderWidth: 1,
      },
    ],
  };

  // Možnosti grafu
  const options = {
    responsive: true,
    scales: {
      x: {
        beginAtZero: true,
        display: false,
        barPercentage: 1, // Sloupce zabírají celé místo
        categoryPercentage: 1, // Zajistí, že mezi kategoriemi nebude mezera
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
            return `${tooltipItem.label}: ${tooltipItem.raw} dárků`; // Formátování tooltipu
          },
        },
      },
      datalabels: {
        color: 'white', // Barva textu (bílá)
        font: {
          weight: 'bold', // Tučné písmo
          size: 14, // Velikost písma
        },
        formatter: (value, context) => {
          return `${context.chart.data.labels[context.dataIndex]}: ${value}`; // Zobrazení jména osoby a počtu dárků
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
