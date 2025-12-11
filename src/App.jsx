import { useEffect, useMemo, useState } from 'react';
import Table from './components/Table';
import Summary from './components/Summary';
import GiftCharts from './components/GiftCharts';
import GiftForm from './components/GiftForm';
import DEFAULT_GIFTS from './data/defaultGifts';
import ALLOWED_NAMES from './data/allowedNames';

const STORAGE_KEY = 'gift-tracker:gifts';

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

function App() {
  const [gifts, setGifts] = useState(normalizeGifts(DEFAULT_GIFTS));
  const [selectedYear, setSelectedYear] = useState(DEFAULT_GIFTS[0]?.year ?? new Date().getFullYear());
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const storedGifts = loadStoredGifts();
    setGifts(storedGifts);
    if (storedGifts.length) {
      const newestYear = Math.max(...storedGifts.map((gift) => gift.year));
      setSelectedYear(newestYear);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized || typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(gifts));
  }, [gifts, isInitialized]);

  const availableYears = useMemo(
    () => [...new Set(gifts.map((gift) => gift.year))].sort((a, b) => b - a),
    [gifts],
  );

  useEffect(() => {
    if (!availableYears.length) {
      return;
    }

    if (!availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears, selectedYear]);

  const giftsForActiveYear = useMemo(
    () => gifts.filter((gift) => gift.year === selectedYear),
    [gifts, selectedYear],
  );

  const summary = useMemo(() => {
    const totalItems = giftsForActiveYear.length;
    const totalPrice = giftsForActiveYear.reduce((sum, gift) => sum + gift.price, 0);
    return { totalItems, totalPrice };
  }, [giftsForActiveYear]);

  const yearlyTotals = useMemo(() => {
    const annualTotals = gifts.reduce((acc, gift) => {
      acc[gift.year] = (acc[gift.year] ?? 0) + gift.price;
      return acc;
    }, {});

    return Object.entries(annualTotals)
      .map(([year, total]) => ({ year: Number(year), total }))
      .sort((a, b) => a.year - b.year);
  }, [gifts]);

  const handleYearChange = (event) => {
    setSelectedYear(Number(event.target.value));
  };

  const handleGiftAdd = (giftInput) => {
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

    setGifts((prev) => [...prev, newGift]);
    setSelectedYear(year);
  };

  return <div className='wrapper'>

    <div className='hero'>
      <div className='hero__decor'>
        <img className='icon-head' src="snowflake1.svg" alt="vločka" />
        <img className='icon-head-lg' src="snowflake2.svg" alt="vločka" />
        <img className='icon-head-sm' src="snowflake3.svg" alt="vločka" />
        <img className='icon-head' src="snowflake4.svg" alt="vločka" />
        <img className='icon-head-sm' src="snowflake5.svg" alt="vločka" />
        <img className='icon-head-lg' src="snowflake14.svg" alt="vločka" />
        <img className='icon-head' src="snowflake13.svg" alt="vločka" />
        <img className='icon-head-sm' src="snowflake8.svg" alt="vločka" />
        <img className='icon-head' src="snowflake9.svg" alt="vločka" />
        <img className='icon-head-lg' src="snowflake10.svg" alt="vločka" />
        <img className='icon-head-sm' src="snowflake11.svg" alt="vločka" />
        <img className='icon-head' src="snowflake12.svg" alt="vločka" />
      </div>
      <div className='hero__content'>
        <p className='hero__eyebrow'>Holiday planning</p>
        <h1 className='hero__title'>Christmas Gift Tracker</h1>
        <p className='hero__lead'>
          Sleduj rozpočet, dárky i radost v rodině. Všechny roky na jednom místě s okamžitými grafy.
        </p>
        <div className='hero__meta'>
          <span className='hero__tag'>Rok {selectedYear}</span>
          <span className='hero__tag'>{summary.totalItems} položek</span>
        </div>
        <div className='toolbar toolbar--hero'>
          <label htmlFor="year-select" className='year-filter'>
            <span>Vyber rok</span>
            <select id="year-select" value={selectedYear} onChange={handleYearChange}>
              {availableYears.map((year) => (
                <option value={year} key={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </div>


      <div className='section'>
        <Summary totalItems={summary.totalItems} totalPrice={summary.totalPrice} year={selectedYear} />
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
      <Table gifts={giftsForActiveYear} selectedYear={selectedYear} />
     </div>
     
    </div>
}

export default App;
