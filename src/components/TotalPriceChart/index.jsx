import PropTypes from 'prop-types';
import { Pie } from 'react-chartjs-2';
import { ensureChartSetup } from '../../chartConfig';
import { buildColorPalette } from '../../utils/colorPalette';
import { formatCurrency } from '../../utils/formatCurrency';
import './style.css';

ensureChartSetup();

const TotalPriceChart = ({ persons, totalPrice }) => {
  if (!totalPrice || totalPrice.length === 0) {
    return null;
  }

  const colors = buildColorPalette(totalPrice.length, 0.85);

  const data = {
    labels: persons,
    datasets: [
      {
        label: 'Celková cena',
        data: totalPrice,
        backgroundColor: colors,
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  };

  // Možnosti pro graf
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return `${tooltipItem.label}: ${formatCurrency(tooltipItem.raw)}`;
          },
        },
      },
      datalabels: {
        color: '#fff',
        font: {
          weight: '600',
          size: 14,
        },
        formatter: (value, context) => {
          const label = context.chart.data.labels[context.dataIndex];
          return label?.charAt(0) ?? '';
        },
        anchor: 'center',
        align: 'center',
      },
      legend: {
        display: false,
      },
    },
    cutout: '50%',
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
