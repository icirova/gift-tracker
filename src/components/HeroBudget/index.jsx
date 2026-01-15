import PropTypes from 'prop-types';
import './style.css';

const HeroBudget = ({
  selectedYear,
  currentBudget,
  budgetEditingYear,
  budgetDraft,
  boughtTotal,
  ideaTotal,
  ideaMissingCount,
  planTotal,
  planDelta,
  isPlanOverBudget,
  boughtPercent,
  ideaPercent,
  overPercent,
  isDirty,
  isEditable,
  onDraftChange,
  onEdit,
  onSave,
  onCancel,
}) => (
  <div className="hero-budget">
    <div className="hero-budget__panel">
      <div className="hero-budget__row">
        <div className="hero-budget__field">
          <span>Plánovaný rozpočet</span>
          {budgetEditingYear === selectedYear && isEditable ? (
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
            <>
              {isEditable ? (
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
                      ? 'Nastavit'
                      : `${currentBudget.toLocaleString('cs-CZ')} Kč`}
                  </span>
                  <span className="hero-budget__pencil" aria-hidden="true">
                    <svg viewBox="0 0 24 24" role="presentation">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm2.92 2.33H5v-.92l8.81-8.81.92.92-8.81 8.81zM20.71 7.04a1 1 0 0 0 0-1.41L18.37 3.3a1 1 0 0 0-1.41 0l-1.69 1.69 3.75 3.75 1.69-1.7z" />
                    </svg>
                  </span>
                </button>
              ) : (
                <div className="hero-budget__value-static">
                  <span
                    className={`hero-budget__amount${
                      currentBudget === null ? ' hero-budget__amount--placeholder' : ''
                    }`}
                  >
                    {currentBudget === null
                      ? 'Nastavit'
                      : `${currentBudget.toLocaleString('cs-CZ')} Kč`}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
        {budgetEditingYear === selectedYear && isEditable ? (
          <button
            type="button"
            className="hero-budget__button"
            onClick={isDirty ? onSave : onCancel}
          >
            {isDirty ? 'Uložit' : 'Zpět'}
          </button>
        ) : (
          <span
            className="hero-budget__button hero-budget__button--placeholder"
            aria-hidden="true"
          />
        )}
      </div>
    </div>
      <div className="hero-budget__summary-grid">
        <div className="hero-budget__summary-item">
          <span className="hero-budget__summary-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" role="presentation">
              <path
                d="M7.5 12.5l3 3 6-7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div className="hero-budget__summary-content">
            <span className="hero-budget__summary-label">Utraceno</span>
            <span className="hero-budget__summary-value hero-budget__summary-value--bought">
              {currentBudget === null ? '—' : `${boughtTotal.toLocaleString('cs-CZ')} Kč`}
            </span>
          </div>
        </div>
        <div className="hero-budget__summary-item">
          <span className="hero-budget__summary-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" role="presentation">
              <path
                d="M12 4.5l2.2 4.5 5 .7-3.6 3.5.8 5-4.4-2.3-4.4 2.3.8-5-3.6-3.5 5-.7L12 4.5z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div className="hero-budget__summary-content">
            <span className="hero-budget__summary-label">Plánováno</span>
            <div className="hero-budget__summary-value-row">
              <span className="hero-budget__summary-value hero-budget__summary-value--idea">
                {currentBudget === null ? '—' : `${ideaTotal.toLocaleString('cs-CZ')} Kč`}
              </span>
              {ideaMissingCount > 0 ? (
                <span className="hero-budget__summary-note">
                  {`+ ${ideaMissingCount} dárek bez ceny`}
                </span>
              ) : null}
            </div>
          </div>
        </div>
        <div className="hero-budget__summary-item">
          <span className="hero-budget__summary-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" role="presentation">
              <text
                x="12"
                y="16"
                textAnchor="middle"
                fontSize="16"
                fontFamily="inherit"
                fill="currentColor"
              >
                Σ
              </text>
            </svg>
          </span>
          <div className="hero-budget__summary-content">
            <span className="hero-budget__summary-label">Celkem</span>
            <span className="hero-budget__summary-value">
              {currentBudget === null ? '—' : `${planTotal.toLocaleString('cs-CZ')} Kč`}
            </span>
          </div>
        </div>
        <div className="hero-budget__summary-item">
          <span className="hero-budget__summary-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" role="presentation">
              <path
                d="M5 12h11M12 8l4 4-4 4M20 6v12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div className="hero-budget__summary-content">
            <span className="hero-budget__summary-label">
              {isPlanOverBudget ? 'Překročeno' : 'Zbývá'}
            </span>
            <span className="hero-budget__summary-value hero-budget__summary-value--delta">
              {currentBudget === null
                ? '—'
                : isPlanOverBudget
                  ? `-${Math.abs(planDelta ?? 0).toLocaleString('cs-CZ')} Kč`
                  : `${Math.max(planDelta ?? 0, 0).toLocaleString('cs-CZ')} Kč`}
            </span>
          </div>
        </div>
      </div>
    <div className="hero-budget__bar-row">
      {budgetEditingYear === selectedYear ? (
        <span className="hero-budget__placeholder" aria-hidden="true" />
      ) : (
        <div className="hero-budget__bar" aria-hidden="true">
          {currentBudget !== null ? (
            <>
              <span
                className="hero-budget__segment hero-budget__segment--bought"
                style={{ width: `${boughtPercent}%` }}
              />
              <span
                className="hero-budget__segment hero-budget__segment--idea"
                style={{ width: `${ideaPercent}%`, left: `${boughtPercent}%` }}
              />
              {overPercent > 0 ? (
                <>
                  <span
                    className="hero-budget__segment hero-budget__segment--over"
                    style={{ width: `${overPercent}%`, left: `${boughtPercent + ideaPercent}%` }}
                  />
                  <span
                    className="hero-budget__over-divider"
                    style={{ left: `${boughtPercent + ideaPercent}%` }}
                    aria-hidden="true"
                  />
                </>
              ) : null}
            </>
          ) : null}
        </div>
      )}
    </div>
  </div>
);

HeroBudget.propTypes = {
  selectedYear: PropTypes.number.isRequired,
  currentBudget: PropTypes.number,
  budgetEditingYear: PropTypes.number,
  budgetDraft: PropTypes.string.isRequired,
  boughtTotal: PropTypes.number.isRequired,
  ideaTotal: PropTypes.number.isRequired,
  ideaMissingCount: PropTypes.number.isRequired,
  planTotal: PropTypes.number.isRequired,
  planDelta: PropTypes.number,
  isPlanOverBudget: PropTypes.bool.isRequired,
  boughtPercent: PropTypes.number.isRequired,
  ideaPercent: PropTypes.number.isRequired,
  overPercent: PropTypes.number.isRequired,
  isDirty: PropTypes.bool.isRequired,
  isEditable: PropTypes.bool,
  onDraftChange: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

HeroBudget.defaultProps = {
  currentBudget: null,
  budgetEditingYear: null,
  planDelta: null,
  isEditable: true,
};

export default HeroBudget;
