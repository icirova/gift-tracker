import PropTypes from 'prop-types';
import './style.css';

const HeroBudgetSummary = ({ currentBudget, totalPercent, overAmount }) => (
  <div className="hero-budget-summary">
    <div className="hero-budget-summary__value-row">
      <span className="hero-budget-summary__value">
        {`Rozpočet: ${
          currentBudget === null ? '—' : `${currentBudget.toLocaleString('cs-CZ')} Kč`
        }`}
      </span>
      {overAmount !== null ? (
        <span className="hero-budget-summary__over">
          {`-${Math.abs(overAmount).toLocaleString('cs-CZ')} Kč`}
        </span>
      ) : null}
    </div>
    <div className="hero-budget-summary__bar" aria-hidden="true">
      <span
        className={`hero-budget-summary__fill${
          overAmount !== null ? ' hero-budget-summary__fill--over' : ''
        }`}
        style={{ width: `${totalPercent}%` }}
      />
    </div>
  </div>
);

HeroBudgetSummary.propTypes = {
  currentBudget: PropTypes.number,
  totalPercent: PropTypes.number.isRequired,
  overAmount: PropTypes.number,
};

HeroBudgetSummary.defaultProps = {
  overAmount: null,
};

HeroBudgetSummary.defaultProps = {
  currentBudget: null,
};

export default HeroBudgetSummary;
