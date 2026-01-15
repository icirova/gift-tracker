import DEFAULT_GIFTS from '../data/defaultGifts';
import ALLOWED_NAMES from '../data/allowedNames';
import { GIFT_STATUS, STATUS_VALUES } from './giftConstants';

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

const normalizeGifts = (entries) =>
  entries.map((gift) => {
    const priceValue = Number(gift.price);
    return {
      ...gift,
      price: Number.isFinite(priceValue) && priceValue > 0 ? priceValue : null,
      status: STATUS_VALUES.has(gift.status) ? gift.status : GIFT_STATUS.bought,
    };
  });

export const buildNamesByYearFromGifts = (entries) => {
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

export const ensureDemoDefaults = () => {
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

export const loadStoredGifts = () => {
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

export const loadStoredYears = () => {
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

export const loadStoredBudgets = () => {
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

export const loadStoredNames = (fallbackNamesByYear) => {
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

export const saveStoredGifts = (gifts) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(gifts));
  } catch (error) {
    console.warn('Nepodařilo se uložit dárky do localStorage.', error);
  }
};

export const saveStoredYears = (extraYears) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(YEARS_KEY, JSON.stringify(extraYears));
  } catch (error) {
    console.warn('Nepodařilo se uložit roky do localStorage.', error);
  }
};

export const saveStoredBudgets = (budgets) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
  } catch (error) {
    console.warn('Nepodařilo se uložit rozpočty do localStorage.', error);
  }
};

export const saveStoredNames = (namesByYear) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(NAMES_KEY, JSON.stringify(namesByYear));
  } catch (error) {
    console.warn('Nepodařilo se uložit jména do localStorage.', error);
  }
};
