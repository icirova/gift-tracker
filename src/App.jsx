import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import Table from './components/Table';
import Summary from './components/Summary';
import GiftCharts from './components/GiftCharts';
import GiftForm from './components/GiftForm';
import DEFAULT_GIFTS from './data/defaultGifts';
import ALLOWED_NAMES from './data/allowedNames';
import { api, USE_API } from './services/api';

const STORAGE_KEY = 'gift-tracker:gifts';
const YEARS_KEY = 'gift-tracker:extra-years';

const normalizeGifts = (entries) =>
  entries.filter((gift) => ALLOWED_NAMES.includes(gift.name));

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
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(YEARS_KEY);
    if (rawValue) {
      const parsedValue = JSON.parse(rawValue);
      if (Array.isArray(parsedValue)) {
        return parsedValue.filter((year) => Number.isFinite(year)).map(Number);
      }
    }
  } catch (error) {
    console.warn('Nepodařilo se načíst roky z localStorage.', error);
  }

  return [];
};

function App() {
  const [gifts, setGifts] = useState(normalizeGifts(DEFAULT_GIFTS));
  const [selectedYear, setSelectedYear] = useState(DEFAULT_GIFTS[0]?.year ?? new Date().getFullYear());
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [highlightedGiftId, setHighlightedGiftId] = useState(null);
  const [extraYears, setExtraYears] = useState(loadStoredYears);
  const deleteTimeoutRef = useRef(null);
  const highlightTimeoutRef = useRef(null);
  const [quickGift, setQuickGift] = useState({
    name: ALLOWED_NAMES[0] ?? '',
    gift: '',
    price: '',
  });

  const loadGifts = useCallback(async () => {
    if (USE_API) {
      setIsLoading(true);
      try {
        const data = await api.getGifts();
        setGifts(normalizeGifts(data));
        if (data.length) {
          const newestYear = Math.max(...data.map((gift) => gift.year));
          setSelectedYear(newestYear);
        }
      } catch (error) {
        console.error('Failed to load gifts from API:', error);
        setGifts(normalizeGifts(DEFAULT_GIFTS));
      } finally {
        setIsLoading(false);
      }
    } else {
      const storedGifts = loadStoredGifts();
      setGifts(storedGifts);
      if (storedGifts.length) {
        const newestYear = Math.max(...storedGifts.map((gift) => gift.year));
        setSelectedYear(newestYear);
      }
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    loadGifts();
  }, [loadGifts]);

  useEffect(() => {
    setExtraYears((prev) => prev.filter((year) => year !== 2026 && year !== 2027));
  }, []);

  useEffect(() => {
    if (!isInitialized || typeof window === 'undefined' || USE_API) {
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

  const summary = useMemo(() => {
    const totalItems = giftsForActiveYear.length;
    const totalPrice = giftsForActiveYear.reduce((sum, gift) => sum + gift.price, 0);
    return { totalItems, totalPrice };
  }, [giftsForActiveYear]);

  const mostExpensiveGift = useMemo(() => {
    if (!giftsForActiveYear.length) {
      return null;
    }
    return Math.max(...giftsForActiveYear.map((gift) => gift.price));
  }, [giftsForActiveYear]);

  const previousYearTotal = useMemo(() => {
    const previousYear = selectedYear - 1;
    return gifts
      .filter((gift) => gift.year === previousYear)
      .reduce((sum, gift) => sum + gift.price, 0);
  }, [gifts, selectedYear]);

  const hasPreviousYear = useMemo(
    () => gifts.some((gift) => gift.year === selectedYear - 1),
    [gifts, selectedYear],
  );

  const yearlyTotals = useMemo(() => {
    const annualTotals = gifts.reduce((acc, gift) => {
      acc[gift.year] = (acc[gift.year] ?? 0) + gift.price;
      return acc;
    }, {});

    return Object.entries(annualTotals)
      .map(([year, total]) => ({ year: Number(year), total }))
      .sort((a, b) => a.year - b.year);
  }, [gifts]);

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

  const handleGiftAdd = async (giftInput) => {
    const trimmedName = giftInput.name.trim();
    const trimmedGift = giftInput.gift.trim();
    const year = Number(giftInput.year) || selectedYear;
    const price = Number(giftInput.price);

    if (!trimmedName || !trimmedGift || !price || !ALLOWED_NAMES.includes(trimmedName)) {
      return;
    }

    const newGift = {
      id: `gift-${year}-${Date.now()}`,
      year,
      name: trimmedName,
      gift: trimmedGift,
      price,
    };

    if (USE_API) {
      try {
        // Backend očekává objekt bez ID (CreateGiftRequest)
        const giftRequest = {
          year,
          name: trimmedName,
          gift: trimmedGift,
          price,
        };
        await api.createGift(giftRequest);
        // Znovu načti všechna data z API místo přidání do stavu
        await loadGifts();
        setSelectedYear(year);
      } catch (error) {
        console.error('Failed to create gift:', error);
      }
    } else {
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
    }
  };

  const isQuickValid =
    ALLOWED_NAMES.includes(quickGift.name) &&
    quickGift.gift.trim().length > 1 &&
    Number(quickGift.price) > 0;

  const handleQuickChange = (event) => {
    const { name, value } = event.target;
    setQuickGift((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuickSubmit = (event) => {
    event.preventDefault();
    if (!isQuickValid) {
      return;
    }

    handleGiftAdd({
      name: quickGift.name,
      gift: quickGift.gift,
      price: Number(quickGift.price),
      year: selectedYear,
    });
    setQuickGift((prev) => ({ ...prev, gift: '', price: '' }));

    if (typeof document !== 'undefined') {
      requestAnimationFrame(() => {
        const table = document.getElementById('gift-table');
        if (table) {
          table.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }
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

  if (isLoading) {
    return <div className='wrapper'><p>Načítám data...</p></div>;
  }

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
          {USE_API && (
            <div className="hero-stat">
              <span className="hero-stat__label">Režim</span>
              <span className="hero-stat__value">🌐 API</span>
            </div>
          )}
        </div>
        <div className="hero__timeline" role="tablist" aria-label="Roky">
          {availableYears.slice(0, 6).map((year) => {
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
          <button type="button" className="hero__year hero__year--new" onClick={handleAddYear}>
            + Nový rok
          </button>
        </div>
        <form className="hero-quick" onSubmit={handleQuickSubmit}>
          <label className="hero-quick__field">
            <span>Jméno</span>
            <select name="name" value={quickGift.name} onChange={handleQuickChange}>
              {ALLOWED_NAMES.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label className="hero-quick__field">
            <span>Dárek</span>
            <input
              type="text"
              name="gift"
              value={quickGift.gift}
              onChange={handleQuickChange}
              placeholder="Co se kupuje"
            />
          </label>
          <label className="hero-quick__field">
            <span>Cena (Kč)</span>
            <input
              type="text"
              inputMode="numeric"
              name="price"
              value={quickGift.price}
              onChange={handleQuickChange}
              placeholder="Např. 1200"
            />
          </label>
          <button type="submit" disabled={!isQuickValid}>
            Přidat dárek
          </button>
        </form>
        
      </div>
    </div>


      <div className='section'>
        <Summary
          year={selectedYear}
          mostExpensiveGift={mostExpensiveGift}
          yearChange={hasPreviousYear ? summary.totalPrice - previousYearTotal : null}
        />
      </div>

      <div className='section'>

      
        <GiftCharts gifts={giftsForActiveYear} yearlyTotals={yearlyTotals}/>
        </div>
     
     <div className='section'>
      <GiftForm
        onAddGift={handleGiftAdd}
        defaultYear={selectedYear}
        allowedNames={ALLOWED_NAMES}
      />
      <Table
        gifts={giftsForActiveYear}
        selectedYear={selectedYear}
        onDeleteGift={handleGiftDelete}
        highlightedGiftId={highlightedGiftId}
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
    </div>
}

export default App;