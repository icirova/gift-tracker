import PropTypes from 'prop-types';

// Komponenta pro zobrazení jedné položky (buď totalItems nebo totalPrice)
const SummaryItem = ({ label, value }) => {
  return (
    <p>
      <strong>{label}:</strong> {value}
    </p>
  );
};

SummaryItem.propTypes = {
  label: PropTypes.string.isRequired,  // Popis položky (např. 'Počet dárků' nebo 'Celková cena')
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,  // Hodnota položky (počet dárků nebo cena)
};

export default SummaryItem;
