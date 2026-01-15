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
        d="M12 5v12M8 13l4 4 4-4"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  ),
  budget: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect
        x="6"
        y="6"
        width="12"
        height="12"
        rx="2"
        strokeWidth="1.6"
        fill="none"
      />
    </svg>
  ),
  expensive: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 19V7M8 11l4-4 4 4"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  ),
  trend: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 12h16M7 9l-3 3 3 3M17 9l3 3-3 3"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
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
  variant: PropTypes.oneOf(['year', 'gifts', 'budget', 'expensive', 'trend']),
};

SummaryItem.defaultProps = {
  variant: undefined,
};

export default SummaryItem;
