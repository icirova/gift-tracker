import PropTypes from 'prop-types';
import './style.css';

const HeroBudget = ({
  selectedYear,
  currentBudget,
  budgetEditingYear,
  budgetDraft,
  budgetUsage,
  isOverBudget,
  budgetDelta,
  isDirty,
  onDraftChange,
  onEdit,
  onSave,
  onCancel,
}) => (
  <div className="hero-budget">
    <div className="hero-budget__row">
      <div className="hero-budget__field">
        <span>Plánovaný rozpočet</span>
        {budgetEditingYear === selectedYear ? (
          <input
            type="text"
            inputMode="numeric"
            value={budgetDraft}
            onChange={onDraftChange}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                if (isDirty) {
                  onSave();
                } else {
                  onCancel();
                }
              }
            }}
            placeholder="Např. 15000"
          />
        ) : (
          <button
            type="button"
            className="hero-budget__value-button"
            onClick={onEdit}
            aria-label={currentBudget === null ? 'Nastavit rozpočet' : 'Upravit rozpočet'}
            title={currentBudget === null ? 'Nastavit' : 'Upravit'}
          >
            <span
              className={`hero-budget__amount${
                currentBudget === null ? ' hero-budget__amount--placeholder' : ''
              }`}
            >
              {currentBudget === null
                ? 'Nastavit rozpočet'
                : `${currentBudget.toLocaleString('cs-CZ')} Kč`}
            </span>
            <span className="hero-budget__pencil" aria-hidden="true">
              <svg viewBox="0 0 24 24" role="presentation">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm2.92 2.33H5v-.92l8.81-8.81.92.92-8.81 8.81zM20.71 7.04a1 1 0 0 0 0-1.41L18.37 3.3a1 1 0 0 0-1.41 0l-1.69 1.69 3.75 3.75 1.69-1.7z" />
              </svg>
            </span>
          </button>
        )}
      </div>
      {budgetEditingYear === selectedYear ? (
        <button
          type="button"
          className="hero-budget__button"
          onClick={isDirty ? onSave : onCancel}
        >
          {isDirty ? 'Uložit' : 'Zpět'}
        </button>
      ) : null}
    </div>
    <div className="hero-budget__row hero-budget__row--meta">
      {budgetEditingYear === selectedYear ? (
        <span className="hero-budget__placeholder" aria-hidden="true" />
      ) : currentBudget !== null ? (
        isOverBudget ? (
          <div className="hero-budget__over">
            {`Rozpočet byl překročen o ${Math.abs(budgetDelta ?? 0).toLocaleString('cs-CZ')} Kč.`}
          </div>
        ) : (
          <div className="hero-budget__bar" aria-hidden="true">
            <span className="hero-budget__fill" style={{ width: `${budgetUsage}%` }} />
          </div>
        )
      ) : (
        <span className="hero-budget__placeholder" aria-hidden="true" />
      )}
    </div>
  </div>
);

HeroBudget.propTypes = {
  selectedYear: PropTypes.number.isRequired,
  currentBudget: PropTypes.number,
  budgetEditingYear: PropTypes.number,
  budgetDraft: PropTypes.string.isRequired,
  budgetUsage: PropTypes.number.isRequired,
  isOverBudget: PropTypes.bool.isRequired,
  budgetDelta: PropTypes.number,
  isDirty: PropTypes.bool.isRequired,
  onDraftChange: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

HeroBudget.defaultProps = {
  currentBudget: null,
  budgetEditingYear: null,
  budgetDelta: null,
};

export default HeroBudget;
