import PropTypes from 'prop-types';
import SummaryItem from '../SummaryItem';
import { formatCurrency } from '../../utils/formatCurrency';
import './style.css';

const formatSignedCurrency = (value) => {
  if (value === null) {
    return '—';
  }
  if (value === 0) {
    return formatCurrency(0);
  }
  const sign = value > 0 ? '+' : '-';
  return `${sign}${formatCurrency(Math.abs(value))}`;
};

const Summary = ({ mostExpensiveGift, cheapestGift, yearChange, averageBoughtPrice }) => {
  return (
    <div className='summary'>
      <SummaryItem
        label="Nejlevnější dárek"
        value={cheapestGift === null ? '—' : formatCurrency(cheapestGift)}
        variant="gifts"
        testId="gift-summary-cheapest"
      />
      <SummaryItem
        label="Nejdražší dárek"
        value={mostExpensiveGift === null ? '—' : formatCurrency(mostExpensiveGift)}
        variant="expensive"
        testId="gift-summary-expensive"
      />
      <SummaryItem
        label="Průměrná cena dárku"
        value={averageBoughtPrice === null ? '—' : formatCurrency(averageBoughtPrice)}
        variant="budget"
        testId="gift-summary-average"
      />
      <SummaryItem
        label="Meziroční změna"
        value={formatSignedCurrency(yearChange)}
        variant="trend"
        testId="gift-summary-trend"
      />
    </div>
  );
};

Summary.propTypes = {
  mostExpensiveGift: PropTypes.number,
  cheapestGift: PropTypes.number,
  yearChange: PropTypes.number,
  averageBoughtPrice: PropTypes.number,
};

Summary.defaultProps = {
  mostExpensiveGift: null,
  cheapestGift: null,
  yearChange: null,
  averageBoughtPrice: null,
};

export default Summary;

