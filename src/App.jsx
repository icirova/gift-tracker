import { useEffect, useMemo, useRef, useState } from 'react';
import Table from './components/Table';
import Summary from './components/Summary';
import GiftCharts from './components/GiftCharts';
import GiftForm from './components/GiftForm';
import HeroBudget from './components/HeroBudget';
import HeroBudgetSummary from './components/HeroBudgetSummary';
import PersonHistory from './components/PersonHistory';
import PeopleManager from './components/PeopleManager';
import Confirm from './components/Confirm';
import DEFAULT_GIFTS from './data/defaultGifts';
import ALLOWED_NAMES from './data/allowedNames';
import {
  buildYearlyTotals,
  calculateBudgetPercents,
  calculateSpentTotalForYear,
  calculateYearStats,
} from './utils/giftStats';

const STORAGE_KEY = 'gift-tracker:gifts';
const YEARS_KEY = 'gift-tracker:extra-years';
const BUDGETS_KEY = 'gift-tracker:budgets';
const NAMES_KEY = 'gift-tracker:names';
const SESSION_KEY = 'gift-tracker:session-init';
const DEFAULT_EXTRA_YEARS = [];
const DEFAULT_BUDGETS = {
  2026: 18000,
  2025: 16000,
  2024: 14000,
};
const GIFT_STATUS = {
  bought: 'bought',
  idea: 'idea',
};
const STATUS_OPTIONS = [
  { value: GIFT_STATUS.bought, label: 'Koupeno' },
  { value: GIFT_STATUS.idea, label: 'Plánováno' },
];
const STATUS_VALUES = new Set(Object.values(GIFT_STATUS));

const normalizeGifts = (entries) =>
  entries.map((gift) => {
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
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(normalizeGifts(DEFAULT_GIFTS)),
    );
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
        return Array.from(new Set([...DEFAULT_EXTRA_YEARS, ...storedYears])).filter(
          (year) => year !== 2021 && year !== 2022 && year !== 2027,
        );
      }
    }
  } catch (error) {
    console.warn('Nepodařilo se načíst roky z localStorage.', error);
  }

  return DEFAULT_EXTRA_YEARS;
};

const loadStoredBudgets = () => {
  if (typeof window === 'undefined') {
    return DEFAULT_BUDGETS;
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

  return DEFAULT_BUDGETS;
};

const buildNamesByYearFromGifts = (entries) => {
  const map = entries.reduce((acc, gift) => {
    const year = Number(gift.year);
    if (!Number.isFinite(year)) {
      return acc;
    }
    if (!acc[year]) {
      acc[year] = new Set();
    }
    if (gift.name) {
      acc[year].add(gift.name);
    }
    return acc;
  }, {});

  return Object.fromEntries(
    Object.entries(map).map(([year, names]) => [Number(year), Array.from(names)]),
  );
};

const ensureDemoDefaults = () => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    if (window.sessionStorage.getItem(SESSION_KEY)) {
      return;
    }
    window.sessionStorage.setItem(SESSION_KEY, '1');
    const normalizedGifts = normalizeGifts(DEFAULT_GIFTS);
    const fallbackNamesByYear =
      Object.keys(buildNamesByYearFromGifts(normalizedGifts)).length > 0
        ? buildNamesByYearFromGifts(normalizedGifts)
        : { [new Date().getFullYear()]: [...ALLOWED_NAMES] };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedGifts));
    window.localStorage.setItem(YEARS_KEY, JSON.stringify(DEFAULT_EXTRA_YEARS));
    window.localStorage.setItem(BUDGETS_KEY, JSON.stringify(DEFAULT_BUDGETS));
    window.localStorage.setItem(NAMES_KEY, JSON.stringify(fallbackNamesByYear));
  } catch (error) {
    console.warn('Nepodařilo se inicializovat demo data.', error);
  }
};

const loadStoredNames = (fallbackNamesByYear) => {
  if (typeof window === 'undefined') {
    return fallbackNamesByYear;
  }

  try {
    const rawValue = window.localStorage.getItem(NAMES_KEY);
    if (rawValue) {
      const parsedValue = JSON.parse(rawValue);
      if (parsedValue && typeof parsedValue === 'object') {
        const cleaned = Object.entries(parsedValue).reduce((acc, [year, names]) => {
          const numericYear = Number(year);
          if (!Number.isFinite(numericYear) || !Array.isArray(names)) {
            return acc;
          }
          const uniqueNames = Array.from(
            new Set(names.map((name) => String(name).trim()).filter(Boolean)),
          );
          if (uniqueNames.length) {
            acc[numericYear] = uniqueNames;
          }
          return acc;
        }, {});
        if (Object.keys(cleaned).length) {
          return cleaned;
        }
      }
    }
  } catch (error) {
    console.warn('Nepodařilo se načíst jména z localStorage.', error);
  }

  return fallbackNamesByYear;
};

function App() {
  ensureDemoDefaults();
  const initialGifts = loadStoredGifts();
  const fallbackNamesByYear =
    Object.keys(buildNamesByYearFromGifts(initialGifts)).length > 0
      ? buildNamesByYearFromGifts(initialGifts)
      : { [new Date().getFullYear()]: [...ALLOWED_NAMES] };
  const initialNamesByYear = loadStoredNames(fallbackNamesByYear);
  const [namesByYear, setNamesByYear] = useState(initialNamesByYear);
  const [gifts, setGifts] = useState(() => initialGifts);
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [unlockedPastYears, setUnlockedPastYears] = useState({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [unlockConfirmOpen, setUnlockConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [pendingAdd, setPendingAdd] = useState(null);
  const [pendingNameDelete, setPendingNameDelete] = useState(null);
  const [highlightedGiftId, setHighlightedGiftId] = useState(null);
  const [extraYears, setExtraYears] = useState(loadStoredYears);
  const [budgets, setBudgets] = useState(loadStoredBudgets);
  const [budgetEditingYear, setBudgetEditingYear] = useState(null);
  const [budgetDraft, setBudgetDraft] = useState('');
  const [showAllYears, setShowAllYears] = useState(false);
  const [addYearConfirmOpen, setAddYearConfirmOpen] = useState(false);
  const deleteTimeoutRef = useRef(null);
  const highlightTimeoutRef = useRef(null);
  const addToastTimeoutRef = useRef(null);
  const nameDeleteTimeoutRef = useRef(null);
  const yearsMenuRef = useRef(null);
  const yearsToggleRef = useRef(null);
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  const allowedNames = useMemo(
    () => namesByYear[selectedYear] ?? [],
    [namesByYear, selectedYear],
  );
  const isPreviousYear = selectedYear === currentYear - 1;
  const isYearEditable =
    selectedYear >= currentYear || (isPreviousYear && Boolean(unlockedPastYears[selectedYear]));
  const canEditNames = isYearEditable;

  const allNames = useMemo(() => {
    const namesFromGifts = gifts.map((gift) => gift.name);
    const namesFromYears = Object.values(namesByYear).flat();
    return Array.from(new Set([...namesFromGifts, ...namesFromYears])).sort((a, b) =>
      a.localeCompare(b, 'cs', { sensitivity: 'base' }),
    );
  }, [gifts, namesByYear]);

  useEffect(() => {
    if (namesByYear[selectedYear]) {
      return;
    }
    setNamesByYear((prev) => {
      if (prev[selectedYear]) {
        return prev;
      }
      const previousYearNames = prev[selectedYear - 1] ?? [];
      return {
        ...prev,
        [selectedYear]: previousYearNames.length ? [...previousYearNames] : [],
      };
    });
  }, [namesByYear, selectedYear]);

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
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(NAMES_KEY, JSON.stringify(namesByYear));
  }, [namesByYear]);

  useEffect(() => {
    return () => {
      if (deleteTimeoutRef.current) {
        clearTimeout(deleteTimeoutRef.current);
      }
      if (addToastTimeoutRef.current) {
        clearTimeout(addToastTimeoutRef.current);
      }
      if (nameDeleteTimeoutRef.current) {
        clearTimeout(nameDeleteTimeoutRef.current);
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
  const canAddNextYear = !availableYears.includes(nextYear);

  useEffect(() => {
    setExtraYears((prev) => prev.filter((year) => year !== currentYear));
  }, [currentYear]);

  useEffect(() => {
    if (availableYears.length <= 3 && showAllYears) {
      setShowAllYears(false);
    }
  }, [availableYears, selectedYear, showAllYears]);

  useEffect(() => {
    setUnlockConfirmOpen(false);
  }, [selectedYear]);

  useEffect(() => {
    setAddYearConfirmOpen(false);
  }, [selectedYear]);

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

  useEffect(() => {
    if (!canAddNextYear) {
      setAddYearConfirmOpen(false);
    }
  }, [canAddNextYear]);

  const handleYearsToggle = () => {
    setShowAllYears((prev) => !prev);
  };

  const handleScrollToGiftForm = () => {
    const target = document.getElementById('gift-form');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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
    if (!canAddNextYear) {
      setAddYearConfirmOpen(false);
      return;
    }
    setExtraYears((prev) => (prev.includes(nextYear) ? prev : [...prev, nextYear]));
    setSelectedYear(nextYear);
    setAddYearConfirmOpen(false);
  };

  const giftsForActiveYear = useMemo(
    () => gifts.filter((gift) => gift.year === selectedYear),
    [gifts, selectedYear],
  );

  const yearStats = useMemo(() => calculateYearStats(giftsForActiveYear), [giftsForActiveYear]);
  const { boughtTotal, ideaTotal, ideaMissingCount, boughtCount } = yearStats;
  const averageBoughtPrice = boughtCount > 0 ? boughtTotal / boughtCount : null;

  const ideaTotalForStats = isYearEditable ? ideaTotal : 0;
  const ideaMissingCountForStats = isYearEditable ? ideaMissingCount : 0;
  const planTotal = boughtTotal + ideaTotalForStats;

  const summary = useMemo(
    () => ({ totalItems: yearStats.totalItems, spentTotal: boughtTotal }),
    [boughtTotal, yearStats.totalItems],
  );

  const mostExpensiveGift = yearStats.mostExpensiveGift;
  const cheapestGift = yearStats.cheapestGift;

  const previousYearTotal = useMemo(
    () => calculateSpentTotalForYear(gifts, selectedYear - 1),
    [gifts, selectedYear],
  );

  const hasPreviousYear = useMemo(
    () => gifts.some((gift) => gift.year === selectedYear - 1),
    [gifts, selectedYear],
  );

  const yearlyTotals = useMemo(() => buildYearlyTotals(gifts), [gifts]);

  const currentBudget = budgets[selectedYear] ?? null;
  const planDelta = currentBudget === null ? null : currentBudget - planTotal;
  const isPlanOverBudget = currentBudget !== null && planDelta < 0;
  const budgetPercents = useMemo(
    () =>
      calculateBudgetPercents({
        currentBudget,
        boughtTotal,
        ideaTotal: ideaTotalForStats,
        planTotal,
      }),
    [boughtTotal, currentBudget, ideaTotalForStats, planTotal],
  );

  useEffect(() => {
    setBudgetDraft(currentBudget === null ? '' : String(currentBudget));
    setBudgetEditingYear(null);
  }, [selectedYear, currentBudget]);

  useEffect(() => {
    if (!isYearEditable && budgetEditingYear === selectedYear) {
      setBudgetEditingYear(null);
    }
  }, [budgetEditingYear, isYearEditable, selectedYear]);

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
    const namesForYear = namesByYear[year] ?? [];
    const isTargetEditable =
      year >= currentYear || (year === currentYear - 1 && Boolean(unlockedPastYears[year]));

    if (!isTargetEditable || !trimmedName || !trimmedGift || !namesForYear.includes(trimmedName)) {
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
    setPendingAdd({ gift: newGift });
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
    }
    highlightTimeoutRef.current = setTimeout(() => {
      setHighlightedGiftId(null);
      highlightTimeoutRef.current = null;
    }, 2500);
    if (addToastTimeoutRef.current) {
      clearTimeout(addToastTimeoutRef.current);
    }
    addToastTimeoutRef.current = setTimeout(() => {
      setPendingAdd(null);
      addToastTimeoutRef.current = null;
    }, 3000);
  };

  const handleBudgetDraftChange = (event) => {
    setBudgetDraft(event.target.value);
  };

  const handleBudgetEdit = () => {
    if (!isYearEditable) {
      return;
    }
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
      if (
        removedGift.year < currentYear &&
        !(removedGift.year === currentYear - 1 && unlockedPastYears[removedGift.year])
      ) {
        return prev;
      }
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
      prev.map((gift) => {
        if (gift.id !== giftId) {
          return gift;
        }
        if (
          gift.year < currentYear &&
          !(gift.year === currentYear - 1 && unlockedPastYears[gift.year])
        ) {
          return gift;
        }
        return { ...gift, ...updates };
      }),
    );
  };

  const handleNameRemove = (name) => {
    const year = selectedYear;
    const removedGifts = gifts.filter((gift) => gift.year === year && gift.name === name);

    setNamesByYear((prev) => ({
      ...prev,
      [year]: (prev[year] ?? []).filter((item) => item !== name),
    }));
    setGifts((prev) => prev.filter((gift) => !(gift.year === year && gift.name === name)));

    if (nameDeleteTimeoutRef.current) {
      clearTimeout(nameDeleteTimeoutRef.current);
    }
    setPendingNameDelete({ name, year, gifts: removedGifts });
    nameDeleteTimeoutRef.current = setTimeout(() => {
      setPendingNameDelete(null);
      nameDeleteTimeoutRef.current = null;
    }, 5000);
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

  const handleUndoNameDelete = () => {
    if (!pendingNameDelete) {
      return;
    }

    const { name, year, gifts: removedGifts } = pendingNameDelete;
    setNamesByYear((prev) => {
      const yearNames = prev[year] ?? [];
      if (yearNames.includes(name)) {
        return prev;
      }
      return { ...prev, [year]: [...yearNames, name] };
    });
    if (removedGifts.length) {
      setGifts((prev) => {
        const existingIds = new Set(prev.map((gift) => gift.id));
        const restored = removedGifts.filter((gift) => !existingIds.has(gift.id));
        return [...prev, ...restored];
      });
    }

    if (nameDeleteTimeoutRef.current) {
      clearTimeout(nameDeleteTimeoutRef.current);
      nameDeleteTimeoutRef.current = null;
    }
    setPendingNameDelete(null);
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
          <em className="hero__lead-break">Ať vás realita nepřekvapí.</em>
        </p>
        <button type="button" className="hero__cta" onClick={handleScrollToGiftForm}>
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
                onClick={() => setSelectedYear(year)}
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
                      setSelectedYear(year);
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
              {summary.totalItems}
              {summary.totalItems === 0 ? '' : ` ${formatGiftLabel(summary.totalItems)}`}
            </span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat__label">Utraceno</span>
            <span className="hero-stat__value" data-testid="gift-hero-spent">
              {summary.spentTotal.toLocaleString('cs-CZ')} Kč
            </span>
          </div>
        </div>
        <HeroBudgetSummary
          currentBudget={currentBudget}
          totalPercent={budgetPercents.total}
          deltaAmount={planDelta}
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
                    onClick={() =>
                      setUnlockedPastYears((prev) => ({
                        ...prev,
                        [selectedYear]: false,
                      }))
                    }
                  >
                    Zamknout úpravy
                  </button>
                ) : unlockConfirmOpen ? (
                  <Confirm
                    className="year-lock__confirm table-status__confirm--wrap"
                    message="Odemknout? Umožní úpravy."
                    onConfirm={() => {
                      setUnlockedPastYears((prev) => ({
                        ...prev,
                        [selectedYear]: true,
                      }));
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

      <div className='section'>
        <h2 className="subtitle">Plán rozpočtu</h2>
        <div className="budget-panel">
          <HeroBudget
            selectedYear={selectedYear}
            currentBudget={currentBudget}
            budgetEditingYear={budgetEditingYear}
            budgetDraft={budgetDraft}
            boughtTotal={boughtTotal}
            ideaTotal={ideaTotalForStats}
            ideaMissingCount={ideaMissingCountForStats}
          planTotal={planTotal}
          planDelta={planDelta}
          isPlanOverBudget={isPlanOverBudget}
          boughtPercent={budgetPercents.bought}
          ideaPercent={budgetPercents.idea}
          overPercent={budgetPercents.over}
            isDirty={isBudgetDirty}
            isEditable={isYearEditable}
            onDraftChange={handleBudgetDraftChange}
            onEdit={handleBudgetEdit}
            onSave={handleBudgetSave}
            onCancel={handleBudgetCancel}
          />
        </div>
      </div>

      <div className='section'>
        <h2 className="subtitle">Seznam osob</h2>
        <PeopleManager
          names={allowedNames}
          canEdit={canEditNames}
          onAddName={(name) => {
            setNamesByYear((prev) => {
              const yearNames = prev[selectedYear] ?? [];
              if (yearNames.some((item) => item.toLowerCase() === name.toLowerCase())) {
                return prev;
              }
              return { ...prev, [selectedYear]: [...yearNames, name] };
            });
          }}
          onRemoveName={handleNameRemove}
        />
      </div>

      {isYearEditable ? (
        <div className='section'>
          <h2 className="subtitle">Přidat dárek do seznamu</h2>
          <GiftForm
            onAddGift={handleGiftAdd}
            defaultYear={selectedYear}
            namesByYear={namesByYear}
            isEditable={isYearEditable}
            statusOptions={STATUS_OPTIONS}
            defaultStatus={GIFT_STATUS.bought}
          />
        </div>
      ) : null}

      <div className='section'>
        <Table
          gifts={giftsForActiveYear}
          selectedYear={selectedYear}
          onDeleteGift={handleGiftDelete}
          highlightedGiftId={highlightedGiftId}
          onUpdateGift={handleGiftUpdate}
          availableYears={availableYears}
          onYearChange={setSelectedYear}
          isEditable={isYearEditable}
        />
      </div>

      <div className='section'>
        <h2 className="subtitle">Historie dárků podle osoby</h2>
        <PersonHistory gifts={gifts} names={allNames} />
      </div>

      <div className='section'>
        <GiftCharts gifts={giftsForActiveYear} yearlyTotals={yearlyTotals} />
      </div>

      <div className='section'>
        <Summary
          mostExpensiveGift={mostExpensiveGift}
          cheapestGift={cheapestGift}
          yearChange={hasPreviousYear ? summary.spentTotal - previousYearTotal : null}
          averageBoughtPrice={averageBoughtPrice}
        />
      </div>
     
     {(pendingDelete || pendingAdd || pendingNameDelete) && (
       <div className="undo-toast" role="status">
         {pendingNameDelete ? (
           <>
             <span>Jméno bylo odebráno.</span>
             <button type="button" className="undo-toast__button" onClick={handleUndoNameDelete}>
               Zpět
             </button>
           </>
         ) : pendingAdd ? (
           <span>Dárek byl přidán.</span>
         ) : (
           <>
             <span>Dárek byl smazán.</span>
             <button type="button" className="undo-toast__button" onClick={handleUndoDelete}>
               Vrátit zpět
             </button>
           </>
         )}
       </div>
     )}
     <footer className="app-footer">
       <span>Gift Tracker · {new Date().getFullYear()} · Iveta Círová</span>
       <span className="app-footer__note">Rodinný přehled dárků</span>
     </footer>
    </div>
}

export default App;
