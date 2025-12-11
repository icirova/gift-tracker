import PropTypes from 'prop-types';
import './style.css';

const SummaryItem = ({ label, value }) => {
  const isIcon = label?.includes('.svg');

  return (
    <div className="summary-item">
      {isIcon ? (
        <img src={label} alt="Ikona metriky" className="summary-item-icon" />
      ) : (
        <strong>{label}</strong>
      )}
      <p className='summary-value'>{value}</p>
    </div>
  );
};

SummaryItem.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default SummaryItem;
