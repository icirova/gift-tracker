import PropTypes from 'prop-types';
import SummaryItem from '../SummaryItem';
import { formatCurrency } from '../../utils/formatCurrency';
import './style.css';

const formatDelta = (value) => {
  if (value === null) {
    return '—';
  }
  if (value === 0) {
    return formatCurrency(0);
  }
  const sign = value > 0 ? '+' : '-';
  return `${sign}${formatCurrency(Math.abs(value))}`;
};

const Summary = ({ mostExpensiveGift, yearChange, budgetDelta }) => {
  return (
    <div className='summary'>
      <SummaryItem label="Rozpočet" value={formatDelta(budgetDelta)} variant="budget" />
      <SummaryItem
        label="Nejdražší dárek"
        value={mostExpensiveGift === null ? '—' : formatCurrency(mostExpensiveGift)}
        variant="budget"
      />
      <SummaryItem label="Meziroční změna" value={formatDelta(yearChange)} variant="budget" />
    </div>
  );
};

Summary.propTypes = {
  mostExpensiveGift: PropTypes.number,
  yearChange: PropTypes.number,
  budgetDelta: PropTypes.number,
};

Summary.defaultProps = {
  mostExpensiveGift: null,
  yearChange: null,
  budgetDelta: null,
};

export default Summary;

