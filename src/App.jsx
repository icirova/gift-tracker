import { useEffect, useMemo, useRef, useState } from 'react';
import Table from './components/Table';
import Summary from './components/Summary';
import GiftCharts from './components/GiftCharts';
import GiftForm from './components/GiftForm';
import HeroBudget from './components/HeroBudget';
import HeroBudgetSummary from './components/HeroBudgetSummary';
import DEFAULT_GIFTS from './data/defaultGifts';
import ALLOWED_NAMES from './data/allowedNames';

const STORAGE_KEY = 'gift-tracker:gifts';
const YEARS_KEY = 'gift-tracker:extra-years';
const BUDGETS_KEY = 'gift-tracker:budgets';
const DEFAULT_EXTRA_YEARS = [2022, 2021];
const GIFT_STATUS = {
  bought: 'bought',
  idea: 'idea',
};
const STATUS_OPTIONS = [
  { value: GIFT_STATUS.bought, label: 'Koupeno' },
  { value: GIFT_STATUS.idea, label: 'Nápad' },
];
const STATUS_VALUES = new Set(Object.values(GIFT_STATUS));

const normalizeGifts = (entries) =>
  entries
    .filter((gift) => ALLOWED_NAMES.includes(gift.name))
    .map((gift) => {
      const priceValue = Number(gift.price);
      return {
        ...gift,
        price: Number.isFinite(priceValue) && priceValue > 0 ? priceValue : null,
        status: STATUS_VALUES.has(gift.status) ? gift.status : GIFT_STATUS.bought,
      };
    });

const loadStoredGifts = () => {
  if (typeof window === 'undefined') {
    return normalizeGifts(DEFAULT_GIFTS);
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    if (rawValue) {
      const parsedValue = JSON.parse(rawValue);
      if (Array.isArray(parsedValue)) {
        return normalizeGifts(parsedValue);
      }
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeGifts(DEFAULT_GIFTS)));
  } catch (error) {
    console.warn('Nepodařilo se načíst dárky z localStorage.', error);
  }

  return normalizeGifts(DEFAULT_GIFTS);
};

const loadStoredYears = () => {
  if (typeof window === 'undefined') {
    return DEFAULT_EXTRA_YEARS;
  }

  try {
    const rawValue = window.localStorage.getItem(YEARS_KEY);
    if (rawValue) {
      const parsedValue = JSON.parse(rawValue);
      if (Array.isArray(parsedValue)) {
        const storedYears = parsedValue.filter((year) => Number.isFinite(year)).map(Number);
        return Array.from(new Set([...DEFAULT_EXTRA_YEARS, ...storedYears]));
      }
    }
  } catch (error) {
    console.warn('Nepodařilo se načíst roky z localStorage.', error);
  }

  return DEFAULT_EXTRA_YEARS;
};

const loadStoredBudgets = () => {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const rawValue = window.localStorage.getItem(BUDGETS_KEY);
    if (rawValue) {
      const parsedValue = JSON.parse(rawValue);
      if (parsedValue && typeof parsedValue === 'object') {
        return Object.entries(parsedValue).reduce((acc, [year, value]) => {
          const numericYear = Number(year);
          const numericValue = Number(value);
          if (Number.isFinite(numericYear) && Number.isFinite(numericValue)) {
            acc[numericYear] = numericValue;
          }
          return acc;
        }, {});
      }
    }
  } catch (error) {
    console.warn('Nepodařilo se načíst rozpočty z localStorage.', error);
  }

  return {};
};

function App() {
  const [gifts, setGifts] = useState(normalizeGifts(DEFAULT_GIFTS));
  const [selectedYear, setSelectedYear] = useState(DEFAULT_GIFTS[0]?.year ?? new Date().getFullYear());
  const [isInitialized, setIsInitialized] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [highlightedGiftId, setHighlightedGiftId] = useState(null);
  const [extraYears, setExtraYears] = useState(loadStoredYears);
  const [budgets, setBudgets] = useState(loadStoredBudgets);
  const [budgetEditingYear, setBudgetEditingYear] = useState(null);
  const [budgetDraft, setBudgetDraft] = useState('');
  const [showAllYears, setShowAllYears] = useState(false);
  const deleteTimeoutRef = useRef(null);
  const highlightTimeoutRef = useRef(null);
  useEffect(() => {
    const storedGifts = loadStoredGifts();
    setGifts(storedGifts);
    const currentYear = new Date().getFullYear();
    setSelectedYear(currentYear);
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    setExtraYears((prev) => prev.filter((year) => year !== 2026 && year !== 2027));
  }, []);

  useEffect(() => {
    if (!isInitialized || typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(gifts));
  }, [gifts, isInitialized]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(YEARS_KEY, JSON.stringify(extraYears));
  }, [extraYears]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    return () => {
      if (deleteTimeoutRef.current) {
        clearTimeout(deleteTimeoutRef.current);
      }
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);

  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = new Set([...gifts.map((gift) => gift.year), ...extraYears, currentYear]);
    return [...years].sort((a, b) => b - a);
  }, [gifts, extraYears]);

  useEffect(() => {
    if (availableYears.length <= 4 && showAllYears) {
      setShowAllYears(false);
    }
  }, [availableYears, selectedYear, showAllYears]);

  const handleYearsToggle = () => {
    if (showAllYears) {
      const visibleYears = availableYears.slice(0, 4);
      if (visibleYears.length && !visibleYears.includes(selectedYear)) {
        setSelectedYear(visibleYears[0]);
      }
      setShowAllYears(false);
      return;
    }
    setShowAllYears(true);
  };

  useEffect(() => {
    if (!availableYears.length) {
      return;
    }

    if (!availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears, selectedYear]);

  const handleAddYear = () => {
    if (typeof window !== 'undefined') {
      const confirmed = window.confirm('Přidat nový rok do timeline?');
      if (!confirmed) {
        return;
      }
    }
    const currentMax = Math.max(...availableYears, new Date().getFullYear());
    const nextYear = currentMax + 1;
    setExtraYears((prev) => (prev.includes(nextYear) ? prev : [...prev, nextYear]));
    setSelectedYear(nextYear);
  };

  const giftsForActiveYear = useMemo(
    () => gifts.filter((gift) => gift.year === selectedYear),
    [gifts, selectedYear],
  );

  const { boughtTotal, ideaTotal, ideaMissingCount } = useMemo(
    () =>
      giftsForActiveYear.reduce(
        (acc, gift) => {
          const priceValue = Number(gift.price);
          const hasValidPrice = Number.isFinite(priceValue) && priceValue > 0;
          if (gift.status === GIFT_STATUS.bought && hasValidPrice) {
            acc.boughtTotal += priceValue;
          }
          if (gift.status === GIFT_STATUS.idea) {
            if (hasValidPrice) {
              acc.ideaTotal += priceValue;
            } else {
              acc.ideaMissingCount += 1;
            }
          }
          return acc;
        },
        { boughtTotal: 0, ideaTotal: 0, ideaMissingCount: 0 },
      ),
    [giftsForActiveYear],
  );

  const planTotal = boughtTotal + ideaTotal;

  const summary = useMemo(() => {
    const totalItems = giftsForActiveYear.length;
    const totalPrice = giftsForActiveYear.reduce((sum, gift) => sum + (gift.price ?? 0), 0);
    return { totalItems, totalPrice };
  }, [giftsForActiveYear]);

  const mostExpensiveGift = useMemo(() => {
    const prices = giftsForActiveYear
      .map((gift) => gift.price)
      .filter((price) => Number.isFinite(price) && price > 0);
    if (!prices.length) {
      return null;
    }
    return Math.max(...prices);
  }, [giftsForActiveYear]);

  const previousYearTotal = useMemo(() => {
    const previousYear = selectedYear - 1;
    return gifts
      .filter((gift) => gift.year === previousYear)
      .reduce((sum, gift) => sum + (gift.price ?? 0), 0);
  }, [gifts, selectedYear]);

  const hasPreviousYear = useMemo(
    () => gifts.some((gift) => gift.year === selectedYear - 1),
    [gifts, selectedYear],
  );

  const yearlyTotals = useMemo(() => {
    const annualTotals = gifts.reduce((acc, gift) => {
      acc[gift.year] = (acc[gift.year] ?? 0) + (gift.price ?? 0);
      return acc;
    }, {});

    return Object.entries(annualTotals)
      .map(([year, total]) => ({ year: Number(year), total }))
      .sort((a, b) => a.year - b.year);
  }, [gifts]);

  const currentBudget = budgets[selectedYear] ?? null;
  const budgetDelta = currentBudget === null ? null : currentBudget - summary.totalPrice;
  const planDelta = currentBudget === null ? null : currentBudget - planTotal;
  const isPlanOverBudget = currentBudget !== null && planDelta < 0;
  const budgetPercents = useMemo(() => {
    if (!currentBudget || currentBudget <= 0 || planTotal <= 0) {
      return { bought: 0, idea: 0, over: 0, total: 0 };
    }

    if (planTotal > currentBudget) {
      const withinPercent = (currentBudget / planTotal) * 100;
      const boughtShare = (boughtTotal / planTotal) * withinPercent;
      const ideaShare = (ideaTotal / planTotal) * withinPercent;
      const overShare = 100 - withinPercent;
      return {
        bought: boughtShare,
        idea: ideaShare,
        over: overShare,
        total: 100,
      };
    }

    const boughtPercent = (boughtTotal / currentBudget) * 100;
    const ideaPercent = (ideaTotal / currentBudget) * 100;
    const totalPercent = Math.min((planTotal / currentBudget) * 100, 100);
    return {
      bought: boughtPercent,
      idea: ideaPercent,
      over: 0,
      total: totalPercent,
    };
  }, [boughtTotal, currentBudget, ideaTotal, planTotal]);

  useEffect(() => {
    setBudgetDraft(currentBudget === null ? '' : String(currentBudget));
    setBudgetEditingYear(null);
  }, [selectedYear, currentBudget]);

  const daysToChristmasEve = useMemo(() => {
    const now = new Date();
    const year = now.getMonth() === 11 && now.getDate() > 24 ? now.getFullYear() + 1 : now.getFullYear();
    const target = new Date(year, 11, 24);
    target.setHours(0, 0, 0, 0);
    const current = new Date(now);
    current.setHours(0, 0, 0, 0);
    const diffMs = target.getTime() - current.getTime();
    return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  }, []);

  const formatDaysLabel = (days) => {
    if (days === 1) {
      return 'den';
    }
    if (days >= 2 && days <= 4) {
      return 'dny';
    }
    return 'dní';
  };

  const formatDaysVerb = (days) => (days >= 2 && days <= 4 ? 'zbývají' : 'zbývá');

  const formatGiftLabel = (count) => {
    if (count === 1) {
      return 'dárek';
    }
    if (count >= 2 && count <= 4) {
      return 'dárky';
    }
    return 'dárků';
  };

  const handleGiftAdd = (giftInput) => {
    const trimmedName = giftInput.name.trim();
    const trimmedGift = giftInput.gift.trim();
    const year = Number(giftInput.year) || selectedYear;
    const status = STATUS_VALUES.has(giftInput.status) ? giftInput.status : GIFT_STATUS.bought;
    const priceValue = giftInput.price === '' || giftInput.price === null ? null : Number(giftInput.price);
    const hasValidPrice = Number.isFinite(priceValue) && priceValue > 0;

    if (!trimmedName || !trimmedGift || !ALLOWED_NAMES.includes(trimmedName)) {
      return;
    }

    if (status === GIFT_STATUS.bought && !hasValidPrice) {
      return;
    }

    if (status === GIFT_STATUS.idea && priceValue !== null && !hasValidPrice) {
      return;
    }

    const newGift = {
      id: `gift-${year}-${Date.now()}`,
      year,
      name: trimmedName,
      gift: trimmedGift,
      price: hasValidPrice ? priceValue : null,
      status,
    };

    setGifts((prev) => [...prev, newGift]);
    setSelectedYear(year);
    setHighlightedGiftId(newGift.id);
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
    }
    highlightTimeoutRef.current = setTimeout(() => {
      setHighlightedGiftId(null);
      highlightTimeoutRef.current = null;
    }, 2500);
  };

  const handleBudgetDraftChange = (event) => {
    setBudgetDraft(event.target.value);
  };

  const handleBudgetEdit = () => {
    setBudgetEditingYear(selectedYear);
  };

  const handleBudgetCancel = () => {
    setBudgetDraft(currentBudget === null ? '' : String(currentBudget));
    setBudgetEditingYear(null);
  };

  const handleBudgetSave = () => {
    setBudgets((prev) => {
      if (!budgetDraft.trim()) {
        const next = { ...prev };
        delete next[selectedYear];
        return next;
      }
      const numericValue = Number(budgetDraft);
      if (!Number.isFinite(numericValue) || numericValue < 0) {
        return prev;
      }
      return { ...prev, [selectedYear]: numericValue };
    });
    setBudgetEditingYear(null);
  };

  const handleGiftDelete = (giftId) => {
    setGifts((prev) => {
      const index = prev.findIndex((gift) => gift.id === giftId);
      if (index === -1) {
        return prev;
      }

      const removedGift = prev[index];
      if (deleteTimeoutRef.current) {
        clearTimeout(deleteTimeoutRef.current);
      }
      setPendingDelete({ gift: removedGift, index });
      deleteTimeoutRef.current = setTimeout(() => {
        setPendingDelete(null);
        deleteTimeoutRef.current = null;
      }, 5000);

      return prev.filter((gift) => gift.id !== giftId);
    });
  };

  const handleGiftUpdate = (giftId, updates) => {
    setGifts((prev) =>
      prev.map((gift) => (gift.id === giftId ? { ...gift, ...updates } : gift)),
    );
  };

  const isBudgetDirty = (() => {
    const trimmed = budgetDraft.trim();
    if (currentBudget === null) {
      return trimmed !== '';
    }
    return trimmed !== String(currentBudget);
  })();

  const handleUndoDelete = () => {
    if (!pendingDelete) {
      return;
    }

    const { gift, index } = pendingDelete;
    setGifts((prev) => {
      if (prev.some((item) => item.id === gift.id)) {
        return prev;
      }

      const next = [...prev];
      const safeIndex = Math.min(Math.max(index, 0), next.length);
      next.splice(safeIndex, 0, gift);
      return next;
    });

    if (deleteTimeoutRef.current) {
      clearTimeout(deleteTimeoutRef.current);
      deleteTimeoutRef.current = null;
    }
    setPendingDelete(null);
  };

  return <div className='wrapper'>

    <div className='hero'>
      <div className='hero__decor' aria-hidden="true">
        <span className='hero__spark hero__spark--left-lg' />
        <span className='hero__spark hero__spark--left-sm' data-variant="rose" />
        <span className='hero__spark hero__spark--right-lg' />
        <span className='hero__spark hero__spark--right-sm' data-variant="rose" />
        <span className='hero__spark hero__spark--top' />
        <span className='hero__spark hero__spark--center' />
        <span className='hero__spark hero__spark--left-mini' />
        <span className='hero__spark hero__spark--right-mini' data-variant="rose" />
        <span className='hero__spark hero__spark--bottom' />
        <span className='hero__spark hero__spark--midline' />
        <span className='hero__spark hero__spark--scatter-one' />
        <span className='hero__spark hero__spark--scatter-two' />
      </div>
      <div className='hero__content'>
        <p className='hero__eyebrow'>Holiday planning</p>
        <div className='hero__ribbon'>
          {daysToChristmasEve === 0
            ? 'Štědrý den je dnes'
            : `Do Vánoc ${formatDaysVerb(daysToChristmasEve)} ${daysToChristmasEve} ${formatDaysLabel(
                daysToChristmasEve,
              )}`}
        </div>
        <h1 className='hero__title'>Christmas <span className='hero__title-accent'>Gift</span> Tracker</h1>
        <p className='hero__lead'>
          Dárky bez chaosu. Rozpočet pod dohledem.
          <em className="hero__lead-break">Realita může překvapit… nebo vyděsit.</em>
        </p>
        <div className="hero__timeline" role="tablist" aria-label="Roky">
          {(showAllYears ? availableYears : availableYears.slice(0, 4)).map((year) => {
            const isActive = year === selectedYear;
            return (
              <button
                key={year}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`hero__year${isActive ? ' is-active' : ''}`}
                onClick={() => setSelectedYear(year)}
              >
                <span>{year}</span>
              </button>
            );
          })}
          {availableYears.length > 4 ? (
            <button
              type="button"
              className="hero__year hero__year--ellipsis"
              onClick={handleYearsToggle}
              aria-label={showAllYears ? 'Skrýt starší roky' : 'Zobrazit všechny roky'}
            >
              <span>{showAllYears ? 'MÉNĚ' : 'VÍCE'}</span>
            </button>
          ) : null}
          {/* <button type="button" className="hero__year hero__year--new" onClick={handleAddYear}>
            + Následující rok
          </button> */}
        </div>
        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-stat__label">ROK</span>
            <span className="hero-stat__value">{selectedYear}</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat__label">Celkový počet</span>
            <span className="hero-stat__value">
              {summary.totalItems}
              {summary.totalItems === 0 ? '' : ` ${formatGiftLabel(summary.totalItems)}`}
            </span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat__label">Celková suma</span>
            <span className="hero-stat__value">{summary.totalPrice.toLocaleString('cs-CZ')} Kč</span>
          </div>
        </div>
        <HeroBudgetSummary
          currentBudget={currentBudget}
          totalPercent={budgetPercents.total}
          overAmount={planDelta !== null && planDelta < 0 ? planDelta : null}
        />
      </div>
    </div>


      <div className='section'>
        <h2 className="subtitle">Plán rozpočtu</h2>
        <div className="budget-panel">
          <HeroBudget
            selectedYear={selectedYear}
            currentBudget={currentBudget}
            budgetEditingYear={budgetEditingYear}
            budgetDraft={budgetDraft}
            boughtTotal={boughtTotal}
            ideaTotal={ideaTotal}
            ideaMissingCount={ideaMissingCount}
          planTotal={planTotal}
          planDelta={planDelta}
          isPlanOverBudget={isPlanOverBudget}
          boughtPercent={budgetPercents.bought}
          ideaPercent={budgetPercents.idea}
          overPercent={budgetPercents.over}
            isDirty={isBudgetDirty}
            onDraftChange={handleBudgetDraftChange}
            onEdit={handleBudgetEdit}
            onSave={handleBudgetSave}
            onCancel={handleBudgetCancel}
          />
        </div>
      </div>

      <div className='section'>
        <h2 className="subtitle">Přidat dárek do seznamu</h2>
        <GiftForm
          onAddGift={handleGiftAdd}
          defaultYear={selectedYear}
          allowedNames={ALLOWED_NAMES}
          statusOptions={STATUS_OPTIONS}
          defaultStatus={GIFT_STATUS.bought}
        />
      </div>

      <div className='section'>
        <Table
          gifts={giftsForActiveYear}
          selectedYear={selectedYear}
          onDeleteGift={handleGiftDelete}
          highlightedGiftId={highlightedGiftId}
          onUpdateGift={handleGiftUpdate}
          availableYears={availableYears}
          onYearChange={setSelectedYear}
        />
      </div>

      <div className='section'>
        <GiftCharts gifts={giftsForActiveYear} yearlyTotals={yearlyTotals} />
      </div>

      <div className='section'>
        <Summary
          mostExpensiveGift={mostExpensiveGift}
          yearChange={hasPreviousYear ? summary.totalPrice - previousYearTotal : null}
          budgetDelta={budgetDelta}
        />
      </div>
     
     {pendingDelete && (
       <div className="undo-toast" role="status">
         <span>Dárek byl smazán.</span>
         <button type="button" className="undo-toast__button" onClick={handleUndoDelete}>
           Vrátit zpět
         </button>
       </div>
     )}
     <footer className="app-footer">
       <span>Gift Tracker · {new Date().getFullYear()} · Iveta Círová</span>
       <span className="app-footer__note">Rodinný přehled dárků</span>
     </footer>
    </div>
}

export default App;
