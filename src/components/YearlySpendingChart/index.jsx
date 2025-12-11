import './style.css';
import { Line } from "react-chartjs-2";
import PropTypes from "prop-types";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

// Registrace potřebných komponent Chart.js
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const YearlySpendingChart = ({ data }) => {
  const chartData = {
    labels: data.map((item) => item.year),
    datasets: [
      {
        label: "Celková suma za dárky (Kč)",
        data: data.map((item) => item.total),
        borderColor: "red",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: 'black',
        pointHoverRadius: 7, // Zvětšení bodu při najetí myší
        // Zajistí, že popisky nad body nebudou zobrazeny
        datalabels: {
          display: false, // Zákaz datových popisků
        },
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true, // Aby graf nebyl příliš vysoký
    plugins: {
        legend: { display: false }, // Skrytí legendy
        tooltip: {
          enabled: true, // Necháme tooltipy aktivní
          position: 'nearest', // Tooltip bude blíže k bodu
          caretSize: 10, // Velikost šipky ukazující na bod (caret)
          caretPadding: 10, // Vzdálenost tooltipu od bodu
          callbacks: {
            label: function(tooltipItem) {
              return `${tooltipItem.raw} Kč`; // Upravený text tooltipu
            },
          },
        },
      },

    // Skrytí datových popisků nad body (pokud je používáte)
    datalabels: {
    display: false, // Zakáže zobrazení hodnot nad body
    },

    scales: {
      x: {
        title: { display: false },
        ticks: {
          display: false,
          color: '#000', // Barva popisků na ose X
        },
        grid: {
          display: false, // Vypnutí mřížky pro osu X
        },
        borderColor: '#000', // Barva osy X na černo
        borderWidth: 3, // Zvětšení tloušťky osy X
      },
      y: {
        title: { display: false },
        beginAtZero: false,
        min: 20000, // Začátek osy Y na hodnotě 20000
        max: 50000, // Maximální hodnota na ose Y
        ticks: {
          display: false, // Zobrazení popisků na ose Y
          stepSize: 1000, // Krok mezi hodnotami na ose Y
          color: '#000', // Barva popisků na ose Y
        },
        grid: {
          display: false, // Vypnutí mřížky pro osu Y
        },
        borderColor: '#000', // Barva osy Y na černo
        borderWidth: 3, // Zvětšení tloušťky osy Y
      },
    },
    layout: {
      padding: 20, // Padding pro lepší zarovnání
    },
    backgroundColor: '#fff', // Bílé pozadí grafu
  };

  return (
    <div className='chart chart--line'>
      <h2 className='subtitle'>Historie celkové ceny </h2>
      <Line data={chartData} options={options} />
    </div>
  );
};

YearlySpendingChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      year: PropTypes.number.isRequired,
      total: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default YearlySpendingChart;
