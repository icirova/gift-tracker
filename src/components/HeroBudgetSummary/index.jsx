import PropTypes from 'prop-types';
import './style.css';

const HeroBudgetSummary = ({ currentBudget = null, totalPercent, deltaAmount = null }) => {
  const isOverBudget = deltaAmount !== null && deltaAmount < 0;
  const showDelta = currentBudget !== null && deltaAmount !== null;
  const formattedDelta = isOverBudget
    ? `-${Math.abs(deltaAmount).toLocaleString('cs-CZ')} Kč`
    : `+${(deltaAmount ?? 0).toLocaleString('cs-CZ')} Kč`;

  return (
  <div className="hero-budget-summary" data-testid="gift-hero-budget-summary">
    <div className="hero-budget-summary__value-row">
      <span className="hero-budget-summary__value">
        {`Rozpočet: ${
          currentBudget === null ? '—' : `${currentBudget.toLocaleString('cs-CZ')} Kč`
        }`}
      </span>
      {showDelta ? (
        <span className="hero-budget-summary__over" data-testid="gift-hero-budget-delta">
          {formattedDelta}
        </span>
      ) : null}
    </div>
    <div className="hero-budget-summary__bar" aria-hidden="true">
      <span
        className={`hero-budget-summary__fill${
          isOverBudget ? ' hero-budget-summary__fill--over' : ''
        }`}
        data-testid="gift-hero-budget-bar"
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

export default HeroBudgetSummary;
