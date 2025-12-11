import './style.css';
import { Line } from 'react-chartjs-2';
import PropTypes from 'prop-types';
import { ensureChartSetup } from '../../chartConfig';
import { formatCurrency } from '../../utils/formatCurrency';

ensureChartSetup();

const YearlySpendingChart = ({ data }) => {
  if (!data.length) {
    return (
      <div className='chart chart--line chart--empty'>
        <h2 className='subtitle'>Historie celkové ceny</h2>
        <p className='chart-message'>Zatím nemáme žádné historické údaje.</p>
      </div>
    );
  }

  const totals = data.map((item) => item.total);
  const labels = data.map((item) => item.year);
  const minTotal = Math.min(...totals);
  const maxTotal = Math.max(...totals);
  const padding = Math.max(500, (maxTotal - minTotal) * 0.15);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Celková suma za dárky (Kč)',
        data: totals,
        borderColor: '#d64541',
        backgroundColor: 'rgba(214, 69, 65, 0.15)',
        tension: 0.35,
        pointRadius: 6,
        pointBackgroundColor: '#000',
        pointHoverRadius: 8,
        fill: true,
        datalabels: {
          display: false,
        },
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.label}: ${formatCurrency(context.raw)}`;
          },
        },
      },
      datalabels: {
        display: false,
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#333',
          font: { weight: 600 },
        },
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: false,
        min: Math.max(0, Math.floor((minTotal - padding) / 100) * 100),
        max: Math.ceil((maxTotal + padding) / 100) * 100,
        ticks: {
          color: '#333',
          callback: (value) => `${value.toLocaleString('cs-CZ')} Kč`,
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
    },
    layout: {
      padding: 10,
    },
  };

  return (
    <div className='chart chart--line'>
      <h2 className='subtitle'>Historie celkové ceny</h2>
      <Line data={chartData} options={options} />
    </div>
  );
};

YearlySpendingChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      year: PropTypes.number.isRequired,
      total: PropTypes.number.isRequired,
    }),
  ).isRequired,
};

export default YearlySpendingChart;
