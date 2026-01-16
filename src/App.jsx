import { useEffect, useMemo, useRef, useState } from 'react';
import Table from './components/Table';
import Summary from './components/Summary';
import GiftCharts from './components/GiftCharts';
import GiftForm from './components/GiftForm';
import HeroBudget from './components/HeroBudget';
import HeroHeader from './components/HeroHeader';
import PersonHistory from './components/PersonHistory';
import PeopleManager from './components/PeopleManager';
import UndoToast from './components/UndoToast';
import ALLOWED_NAMES from './data/allowedNames';
import useBudget from './hooks/useBudget';
import { GIFT_STATUS, STATUS_OPTIONS, STATUS_VALUES } from './utils/giftConstants';
import {
  buildYearlyTotals,
  calculateBudgetPercents,
  calculateSpentTotalForYear,
  calculateYearStats,
} from './utils/giftStats';
import {
  buildNamesByYearFromGifts,
  ensureDemoDefaults,
  loadStoredBudgets,
  loadStoredGifts,
  loadStoredNames,
  loadStoredYears,
  saveStoredBudgets,
  saveStoredGifts,
  saveStoredNames,
  saveStoredYears,
} from './utils/giftStorage';

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
  const [pendingDelete, setPendingDelete] = useState(null);
  const [pendingAdd, setPendingAdd] = useState(null);
  const [pendingNameDelete, setPendingNameDelete] = useState(null);
  const [highlightedGiftId, setHighlightedGiftId] = useState(null);
  const [extraYears, setExtraYears] = useState(loadStoredYears);
  const [budgets, setBudgets] = useState(loadStoredBudgets);
  const isPreviousYear = selectedYear === currentYear - 1;
  const isYearEditable =
    selectedYear >= currentYear || (isPreviousYear && Boolean(unlockedPastYears[selectedYear]));
  const canAddGift = selectedYear === currentYear || (isPreviousYear && isYearEditable);
  const currentBudget = budgets[selectedYear] ?? null;
  const {
    budgetDraft,
    budgetEditingYear,
    isBudgetDirty,
    handleBudgetDraftChange,
    handleBudgetEdit,
    handleBudgetCancel,
    handleBudgetSave,
  } = useBudget({
    selectedYear,
    currentBudget,
    isYearEditable,
    setBudgets,
  });
  const deleteTimeoutRef = useRef(null);
  const highlightTimeoutRef = useRef(null);
  const addToastTimeoutRef = useRef(null);
  const nameDeleteTimeoutRef = useRef(null);
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  const allowedNames = useMemo(
    () => namesByYear[selectedYear] ?? [],
    [namesByYear, selectedYear],
  );
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
    if (!isInitialized) {
      return;
    }

    saveStoredGifts(gifts);
  }, [gifts, isInitialized]);

  useEffect(() => {
    saveStoredYears(extraYears);
  }, [extraYears]);

  useEffect(() => {
    saveStoredBudgets(budgets);
  }, [budgets]);

  useEffect(() => {
    saveStoredNames(namesByYear);
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
      return;
    }
    setExtraYears((prev) => (prev.includes(nextYear) ? prev : [...prev, nextYear]));
    setSelectedYear(nextYear);
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

  const heroRibbonText =
    daysToChristmasEve === 0
      ? 'Štědrý den je dnes'
      : `Do Vánoc ${formatDaysVerb(daysToChristmasEve)} ${daysToChristmasEve} ${formatDaysLabel(
          daysToChristmasEve,
        )}`;
  const giftCountSuffix =
    summary.totalItems === 0 ? '' : ` ${formatGiftLabel(summary.totalItems)}`;
  const handleUnlockPastYear = (year) => {
    setUnlockedPastYears((prev) => ({
      ...prev,
      [year]: true,
    }));
  };

  const handleLockPastYear = (year) => {
    setUnlockedPastYears((prev) => ({
      ...prev,
      [year]: false,
    }));
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
    <HeroHeader
      heroRibbonText={heroRibbonText}
      onScrollToGiftForm={handleScrollToGiftForm}
      canAddNextYear={canAddNextYear}
      nextYear={nextYear}
      onAddYear={handleAddYear}
      availableYears={availableYears}
      selectedYear={selectedYear}
      onSelectYear={setSelectedYear}
      totalItems={summary.totalItems}
      giftCountSuffix={giftCountSuffix}
      spentTotal={summary.spentTotal}
      currentBudget={currentBudget}
      budgetPercentTotal={budgetPercents.total}
      budgetDelta={planDelta}
      currentYear={currentYear}
      isPreviousYear={isPreviousYear}
      isYearEditable={isYearEditable}
      canAddGift={canAddGift}
      onUnlockPastYear={handleUnlockPastYear}
      onLockPastYear={handleLockPastYear}
    />

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
     
     <UndoToast
       pendingDelete={pendingDelete}
       pendingAdd={pendingAdd}
       pendingNameDelete={pendingNameDelete}
       onUndoDelete={handleUndoDelete}
       onUndoNameDelete={handleUndoNameDelete}
     />
     <footer className="app-footer">
       <span>Gift Tracker · {new Date().getFullYear()} · Iveta Círová</span>
       <span className="app-footer__note">Rodinný přehled dárků</span>
     </footer>
    </div>
}

export default App;
