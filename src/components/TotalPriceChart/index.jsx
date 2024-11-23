import PropTypes from 'prop-types';
import { Pie } from 'react-chartjs-2'; // Pokud používáte `react-chartjs-2` pro koláčový graf
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels'; // Načítání pluginu
import './style.css';

// Registrace potřebných komponent pro Chart.js a pluginu pro datové popisky
ChartJS.register(ArcElement, Tooltip, Legend, Title, ChartDataLabels);

const TotalPriceChart = ({ persons, totalPrice }) => {
  if (!totalPrice || totalPrice.length === 0) {
    console.error('Chyba: totalPrice je prázdné nebo undefined.');
    return null; // Pokud totalPrice je prázdné, nebudeme renderovat graf
  }

  // Vánoční barvy pro segmenty grafu
  const colors = [
    'rgba(128, 0, 128, 0.8)', // Fialová
    'rgba(0, 0, 255, 0.8)',   // Modrá
    'rgba(214, 69, 65, 1)',   // Červená
    'rgba(0, 128, 0, 0.8)',   // Zelená
    'rgba(255, 165, 0, 0.8)', // Oranžová
    'rgba(255, 215, 0, 0.8)', // Zlatá
  ];

  const data = {
    labels: persons,
    datasets: [
      {
        label: 'Celková cena',
        data: totalPrice,
        backgroundColor: colors,
        borderColor: colors.map(color => color.replace('0.8', '1')), // Použití stejné barvy pro okraje
        borderWidth: 1,
      },
    ],
  };

  // Možnosti pro graf
  const options = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return `${tooltipItem.label}: ${tooltipItem.raw} Kč`; // Ukáže cenu v tooltipu
          },
        },
      },
      datalabels: {
        color: 'white', // Barva textu
        font: {
          weight: 'normal', // Normální písmo
          size: 14, // Velikost písma
        },
        formatter: (value, context) => {
          return context.chart.data.labels[context.dataIndex]; // Zobrazí jméno osoby v segmentech
        },
        anchor: 'center', // Umístění textu do středu segmentu
        align: 'center',  // Zarovnání textu na střed
      },
      legend: {
        display: false, // Tímto zakážeme legendu (popisky nad grafem)
      },
    },
    cutout: '40%', // Změní koláčový graf na donut graf s 50% vyříznutým středem
  };

  return (
    <div className='chart chart--pie'>
      <h2 className='subtitle'>Cena dárků</h2>
      <Pie data={data} options={options} />
    </div>
  );
};

// Validace props pomocí PropTypes
TotalPriceChart.propTypes = {
  persons: PropTypes.arrayOf(PropTypes.string).isRequired,
  totalPrice: PropTypes.arrayOf(PropTypes.number).isRequired,
};

export default TotalPriceChart;
