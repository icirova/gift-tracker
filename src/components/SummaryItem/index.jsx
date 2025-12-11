import PropTypes from 'prop-types';
import './style.css';

const ICONS = {
  year: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M7 2v3M17 2v3M5 8h14M6 5H4a2 2 0 0 0-2 2v11a4 4 0 0 0 4 4h10a4 4 0 0 0 4-4V7a2 2 0 0 0-2-2h-2"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M8 12h3M8 16h8" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  gifts: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 11h16v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9ZM12 11V4m0 0h3a1.5 1.5 0 0 1 0 3H9a1.5 1.5 0 0 1 0-3h3Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M4 11h16" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  budget: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 3v18M8 6h4.5a3.5 3.5 0 0 1 0 7h-1A3.5 3.5 0 0 0 8 16.5 3.5 3.5 0 0 0 11.5 20H16"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

const SummaryItem = ({ label, value, variant }) => {
  const icon = ICONS[variant];

  return (
    <div className="summary-item">
      <div className={`summary-item-icon ${variant ? `summary-item-icon--${variant}` : ''}`}>
        {icon}
      </div>
      <div>
        <strong>{label}</strong>
        <p className='summary-value'>{value}</p>
      </div>
    </div>
  );
};

SummaryItem.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  variant: PropTypes.oneOf(['year', 'gifts', 'budget']),
};

SummaryItem.defaultProps = {
  variant: undefined,
};

export default SummaryItem;
