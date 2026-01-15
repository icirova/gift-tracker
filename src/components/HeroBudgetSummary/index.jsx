import PropTypes from 'prop-types';
import './style.css';

const HeroBudgetSummary = ({ currentBudget, totalPercent, deltaAmount }) => {
  const isOverBudget = deltaAmount !== null && deltaAmount < 0;
  const showDelta = currentBudget !== null && deltaAmount !== null;
  const formattedDelta = isOverBudget
    ? `-${Math.abs(deltaAmount).toLocaleString('cs-CZ')} Kč`
    : `+${(deltaAmount ?? 0).toLocaleString('cs-CZ')} Kč`;

  return (
    <div className="hero-budget-summary">
      <div className="hero-budget-summary__value-row">
        <span className="hero-budget-summary__value">
          {`Rozpočet: ${
            currentBudget === null ? '—' : `${currentBudget.toLocaleString('cs-CZ')} Kč`
          }`}
        </span>
        {showDelta ? (
          <span className="hero-budget-summary__over">{formattedDelta}</span>
        ) : null}
      </div>
      <div className="hero-budget-summary__bar" aria-hidden="true">
        <span
          className={`hero-budget-summary__fill${
            isOverBudget ? ' hero-budget-summary__fill--over' : ''
          }`}
          style={{ width: `${totalPercent}%` }}
        />
      </div>
    </div>
  );
};

HeroBudgetSummary.propTypes = {
  currentBudget: PropTypes.number,
  totalPercent: PropTypes.number.isRequired,
  deltaAmount: PropTypes.number,
};

HeroBudgetSummary.defaultProps = {
  deltaAmount: null,
  currentBudget: null,
};

export default HeroBudgetSummary;
