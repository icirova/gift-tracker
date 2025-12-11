import PropTypes from 'prop-types';
import { Pie } from 'react-chartjs-2';
import { ensureChartSetup } from '../../chartConfig';
import { formatCurrency } from '../../utils/formatCurrency';
import './style.css';

ensureChartSetup();

const TotalPriceChart = ({ persons, totalPrice, colors }) => {
  if (!totalPrice || totalPrice.length === 0) {
    return null;
  }

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
        color: '#0f172a',
        font: {
          weight: '600',
          size: 13,
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

TotalPriceChart.propTypes = {
  persons: PropTypes.arrayOf(PropTypes.string).isRequired,
  totalPrice: PropTypes.arrayOf(PropTypes.number).isRequired,
  colors: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default TotalPriceChart;
