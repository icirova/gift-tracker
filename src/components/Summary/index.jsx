import PropTypes from 'prop-types';
import SummaryItem from '../SummaryItem';
import { formatCurrency } from '../../utils/formatCurrency';
import './style.css';

const Summary = ({ totalItems, totalPrice, year }) => {
  return (
    <div className='summary'>
      <SummaryItem label="Rok" value={year} />
      <SummaryItem label="/gift.svg" value={totalItems} />
      <SummaryItem label="/cash.svg" value={formatCurrency(totalPrice)} />
    </div>
  );
};

Summary.propTypes = {
  totalItems: PropTypes.number.isRequired,
  totalPrice: PropTypes.number.isRequired,
  year: PropTypes.number.isRequired,
};

export default Summary;

