import PropTypes from 'prop-types';
import './style.css'

// Komponenta pro zobrazení jedné položky (buď totalItems nebo totalPrice)
const SummaryItem = ({ label, value }) => {
  return (
    <div className="summary-item">
      {/* Pokud je `label` cesta k ikoně, zobrazíme ji */}
      {label?.includes(".svg") ? (
        <img src={label} alt="Ikona" className="summary-item-icon" />
      ) : (
        <strong>{label}</strong> // Jinak zobraz textový popis
      )}
      {/* Zobrazení hodnoty */}
      <p className='summary-value'>{value}</p>
    </div>
  );
};

SummaryItem.propTypes = {
  label: PropTypes.string.isRequired,  // Popis položky (např. 'Počet dárků' nebo 'Celková cena')
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,  // Hodnota položky (počet dárků nebo cena)
};

export default SummaryItem;
