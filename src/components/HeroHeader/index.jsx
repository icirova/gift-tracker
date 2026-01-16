import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Confirm from '../Confirm';
import HeroBudgetSummary from '../HeroBudgetSummary';

const HeroHeader = ({
  heroRibbonText,
  onScrollToGiftForm,
  canAddNextYear,
  nextYear,
  onAddYear,
  availableYears,
  selectedYear,
  onSelectYear,
  totalItems,
  giftCountSuffix,
  spentTotal,
  currentBudget,
  budgetPercentTotal,
  budgetDelta,
  currentYear,
  isPreviousYear,
  isYearEditable,
  canAddGift,
  onUnlockPastYear,
  onLockPastYear,
}) => {
  const [showAllYears, setShowAllYears] = useState(false);
  const [addYearConfirmOpen, setAddYearConfirmOpen] = useState(false);
  const [unlockConfirmOpen, setUnlockConfirmOpen] = useState(false);
  const yearsMenuRef = useRef(null);
  const yearsToggleRef = useRef(null);

  useEffect(() => {
    if (availableYears.length <= 3 && showAllYears) {
      setShowAllYears(false);
    }
  }, [availableYears.length, showAllYears]);

  useEffect(() => {
    setUnlockConfirmOpen(false);
  }, [selectedYear]);

  useEffect(() => {
    setAddYearConfirmOpen(false);
  }, [selectedYear]);

  useEffect(() => {
    if (!canAddNextYear) {
      setAddYearConfirmOpen(false);
    }
  }, [canAddNextYear]);

  useEffect(() => {
    if (!showAllYears) {
      return;
    }

    const handleOutsideClick = (event) => {
      const menuNode = yearsMenuRef.current;
      const toggleNode = yearsToggleRef.current;
      if (menuNode && menuNode.contains(event.target)) {
        return;
      }
      if (toggleNode && toggleNode.contains(event.target)) {
        return;
      }
      setShowAllYears(false);
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setShowAllYears(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showAllYears]);

  useEffect(() => {
    if (!unlockConfirmOpen && !addYearConfirmOpen) {
      return;
    }

    const handleEscape = (event) => {
      if (event.key !== 'Escape') {
        return;
      }
      setUnlockConfirmOpen(false);
      setAddYearConfirmOpen(false);
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [unlockConfirmOpen, addYearConfirmOpen]);

  const handleYearsToggle = () => {
    setShowAllYears((prev) => !prev);
  };

  const handleAddYear = () => {
    if (!canAddNextYear) {
      setAddYearConfirmOpen(false);
      return;
    }
    onAddYear();
    setAddYearConfirmOpen(false);
  };

  return (
    <div className="hero">
      <div className="hero__decor" aria-hidden="true">
        <span className="hero__spark hero__spark--left-lg" />
        <span className="hero__spark hero__spark--left-sm" data-variant="rose" />
        <span className="hero__spark hero__spark--right-lg" />
        <span className="hero__spark hero__spark--right-sm" data-variant="rose" />
        <span className="hero__spark hero__spark--top" />
        <span className="hero__spark hero__spark--center" />
        <span className="hero__spark hero__spark--left-mini" />
        <span className="hero__spark hero__spark--right-mini" data-variant="rose" />
        <span className="hero__spark hero__spark--bottom" />
        <span className="hero__spark hero__spark--midline" />
        <span className="hero__spark hero__spark--scatter-one" />
        <span className="hero__spark hero__spark--scatter-two" />
      </div>
      <div className="hero__content">
        <p className="hero__eyebrow">Holiday planning</p>
        <div className="hero__ribbon">{heroRibbonText}</div>
        <h1 className="hero__title">
          Christmas <span className="hero__title-accent">Gift</span> Tracker
        </h1>
        <p className="hero__lead">
          Dárky bez chaosu. Rozpočet pod dohledem.
          <em className="hero__lead-break">Ať vás realita nepřekvapí.</em>
        </p>
        <button
          type="button"
          className="hero__cta"
          onClick={onScrollToGiftForm}
          disabled={!canAddGift}
        >
          Přidat dárek
        </button>
        <div className="hero__timeline" role="tablist" aria-label="Roky">
          {canAddNextYear ? (
            <div className="hero__year-add">
              <button
                type="button"
                className="hero__year hero__year--new"
                onClick={() => setAddYearConfirmOpen(true)}
              >
                + {nextYear}
              </button>
              {addYearConfirmOpen ? (
                <Confirm
                  className="hero__year-confirm table-status__confirm--wrap"
                  message={`Přidat ${nextYear}?`}
                  onConfirm={handleAddYear}
                  onCancel={() => setAddYearConfirmOpen(false)}
                />
              ) : null}
            </div>
          ) : null}
          {(() => {
            const baseYears = availableYears.slice(0, 3);
            if (selectedYear && !baseYears.includes(selectedYear)) {
              const nextYears = [...baseYears];
              nextYears[nextYears.length - 1] = selectedYear;
              return nextYears;
            }
            return baseYears;
          })().map((year) => {
            const isActive = year === selectedYear;
            return (
              <button
                key={year}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`hero__year${isActive ? ' is-active' : ''}`}
                onClick={() => onSelectYear(year)}
              >
                <span>{year}</span>
              </button>
            );
          })}
          {availableYears.length > 3 ? (
            <button
              type="button"
              className="hero__year hero__year--ellipsis"
              onClick={handleYearsToggle}
              ref={yearsToggleRef}
              aria-label={showAllYears ? 'Skrýt starší roky' : 'Zobrazit všechny roky'}
            >
              <span>{showAllYears ? 'MÉNĚ' : 'VÍCE'}</span>
            </button>
          ) : null}
          {showAllYears ? (
            <div className="hero__year-menu" ref={yearsMenuRef}>
              {availableYears
                .filter((year) => {
                  const baseYears = availableYears.slice(0, 3);
                  const visibleYears = baseYears.includes(selectedYear)
                    ? baseYears
                    : [...baseYears.slice(0, 2), selectedYear];
                  return !visibleYears.includes(year);
                })
                .map((year) => (
                  <button
                    key={year}
                    type="button"
                    className="hero__year hero__year--menu"
                    onClick={() => {
                      onSelectYear(year);
                      setShowAllYears(false);
                    }}
                  >
                    {year}
                  </button>
                ))}
            </div>
          ) : null}
        </div>
        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-stat__label">ROK</span>
            <span className="hero-stat__value" data-testid="gift-hero-year">
              {selectedYear}
            </span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat__label">Celkový počet</span>
            <span className="hero-stat__value" data-testid="gift-hero-count">
              {totalItems}
              {giftCountSuffix}
            </span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat__label">Utraceno</span>
            <span className="hero-stat__value" data-testid="gift-hero-spent">
              {spentTotal.toLocaleString('cs-CZ')} Kč
            </span>
          </div>
        </div>
        <HeroBudgetSummary
          currentBudget={currentBudget}
          totalPercent={budgetPercentTotal}
          deltaAmount={budgetDelta}
        />
        <div className="year-lock-slot">
          {selectedYear < currentYear ? (
            <div className="year-lock">
              <span>Rok {selectedYear} nelze editovat.</span>
              {isPreviousYear ? (
                isYearEditable ? (
                  <button
                    type="button"
                    className="year-lock__button"
                    onClick={() => onLockPastYear(selectedYear)}
                  >
                    Zamknout úpravy
                  </button>
                ) : unlockConfirmOpen ? (
                  <Confirm
                    className="year-lock__confirm table-status__confirm--wrap"
                    message="Odemknout? Umožní úpravy."
                    onConfirm={() => {
                      onUnlockPastYear(selectedYear);
                      setUnlockConfirmOpen(false);
                    }}
                    onCancel={() => setUnlockConfirmOpen(false)}
                  />
                ) : (
                  <button
                    type="button"
                    className="year-lock__button"
                    onClick={() => setUnlockConfirmOpen(true)}
                  >
                    Odemknout úpravy
                  </button>
                )
              ) : (
                <span className="year-lock__button-placeholder" aria-hidden="true" />
              )}
            </div>
          ) : (
            <span className="year-lock__placeholder" aria-hidden="true" />
          )}
        </div>
      </div>
    </div>
  );
};

HeroHeader.propTypes = {
  heroRibbonText: PropTypes.string.isRequired,
  onScrollToGiftForm: PropTypes.func.isRequired,
  canAddNextYear: PropTypes.bool.isRequired,
  nextYear: PropTypes.number.isRequired,
  onAddYear: PropTypes.func.isRequired,
  availableYears: PropTypes.arrayOf(PropTypes.number).isRequired,
  selectedYear: PropTypes.number.isRequired,
  onSelectYear: PropTypes.func.isRequired,
  totalItems: PropTypes.number.isRequired,
  giftCountSuffix: PropTypes.string.isRequired,
  spentTotal: PropTypes.number.isRequired,
  currentBudget: PropTypes.number,
  budgetPercentTotal: PropTypes.number.isRequired,
  budgetDelta: PropTypes.number,
  currentYear: PropTypes.number.isRequired,
  isPreviousYear: PropTypes.bool.isRequired,
  isYearEditable: PropTypes.bool.isRequired,
  canAddGift: PropTypes.bool.isRequired,
  onUnlockPastYear: PropTypes.func.isRequired,
  onLockPastYear: PropTypes.func.isRequired,
};

HeroHeader.defaultProps = {
  currentBudget: null,
  budgetDelta: null,
};

export default HeroHeader;
