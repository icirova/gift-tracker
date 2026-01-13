import PropTypes from 'prop-types';
import './style.css';

const HeroBudgetSummary = ({ currentBudget, totalPercent }) => (
  <div className="hero-budget-summary">
    <div className="hero-budget-summary__value">
      {`Rozpočet: ${
        currentBudget === null ? '—' : `${currentBudget.toLocaleString('cs-CZ')} Kč`
      }`}
    </div>
    <div className="hero-budget-summary__bar" aria-hidden="true">
      <span
        className="hero-budget-summary__fill"
        style={{ width: `${totalPercent}%` }}
      />
    </div>
  </div>
);

HeroBudgetSummary.propTypes = {
  currentBudget: PropTypes.number,
  totalPercent: PropTypes.number.isRequired,
};

HeroBudgetSummary.defaultProps = {
  currentBudget: null,
};

export default HeroBudgetSummary;
