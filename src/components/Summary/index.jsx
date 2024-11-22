import PropTypes from 'prop-types';
import SummaryItem from '../SummaryItem';
import './style.css'

const Summary = ({ totalItems, totalPrice }) => {
  return <div className='summary'>
      {/* Komponenta pro zobrazení počtu dárků */}
      <SummaryItem label="Počet dárků" value={totalItems} />
      {/* Komponenta pro zobrazení celkové ceny */}
      <SummaryItem label="Celková cena" value={`${totalPrice} Kč`} />
    </div>;
};

// Validace props pomocí PropTypes
Summary.propTypes = {
  totalItems: PropTypes.number.isRequired,  // totalItems musí být číslo
  totalPrice: PropTypes.number.isRequired,  // totalPrice musí být číslo
};

export default Summary;

