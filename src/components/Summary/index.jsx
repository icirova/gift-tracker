import PropTypes from 'prop-types';
import SummaryItem from '../SummaryItem';
import { formatCurrency } from '../../utils/formatCurrency';
import './style.css';

const Summary = ({ totalItems, totalPrice, year }) => {
  return (
    <div className='summary'>
      <SummaryItem label="Aktuální rok" value={year} variant="year" />
      <SummaryItem label="Počet dárků" value={totalItems} variant="gifts" />
      <SummaryItem label="Celkem utraceno" value={formatCurrency(totalPrice)} variant="budget" />
    </div>
  );
};

Summary.propTypes = {
  totalItems: PropTypes.number.isRequired,
  totalPrice: PropTypes.number.isRequired,
  year: PropTypes.number.isRequired,
};

export default Summary;

