// @ts-check
import { expect } from './fixtures';

/** @typedef {import('@playwright/test').Page} Page */

/** @param {Page} page */
export const giftForm = (page) => page.locator('#gift-form');

/** @param {Page} page */
export const heroCta = (page) => page.getByTestId('gift-hero-cta');

/** @param {Page} page */
export const giftRows = (page) => page.locator('[data-testid^="gift-table-row-"]');

/**
 * @param {Page} page
 * @param {string} giftId
 */
export const giftRow = (page, giftId) => page.getByTestId(`gift-table-row-${giftId}`);

/** @param {Page} page */
export const historyRows = (page) => page.locator('[data-testid^="person-history-row-"]');

/**
 * @param {Page} page
 * @param {string} giftId
 */
export const historyRow = (page, giftId) => page.getByTestId(`person-history-row-${giftId}`);

/**
 * @param {Page} page
 * @param {{ name?: string, status?: 'Koupeno'|'Plánováno', gift: string, price?: string }} gift
 */
export const fillGiftForm = async (
  page,
  { name = 'Anna', status = 'Koupeno', gift, price = '' },
) => {
  const form = giftForm(page);
  await form.locator('select[name="name"]').selectOption(name);
  await form.locator('select[name="status"]').selectOption(status === 'Koupeno' ? 'bought' : 'idea');
  await form.locator('input[name="gift"]').fill(gift);
  await form.locator('input[name="price"]').fill(price);
};

/** @param {Page} page */
export const submitGiftForm = async (page) => {
  await giftForm(page).getByRole('button', { name: 'Přidat dárek' }).click();
};

/**
 * @param {Page} page
 * @param {string} name
 */
export const addPerson = async (page, name) => {
  const peopleForm = page.getByTestId('people-form');
  await peopleForm.getByRole('textbox').fill(name);
  await peopleForm.getByRole('button', { name: 'Přidat osobu' }).click();
};

/**
 * @param {Page} page
 * @returns {Promise<string[]>}
 */
export const getGiftFormNames = async (page) =>
  page.locator('#gift-form select[name="name"] option').allInnerTexts();

/**
 * @param {Page} page
 * @param {number} year
 */
export const selectYear = async (page, year) => {
  await page.getByRole('tab', { name: String(year) }).click();
  await expect(page.getByTestId('gift-hero-year')).toHaveText(String(year));
  await expect(page.getByRole('combobox', { name: 'Rok' })).toHaveValue(String(year));
};

/** @param {Page} page */
export const expectGiftFormLocked = async (page) => {
  await expect(heroCta(page)).toBeDisabled();
  await expect(page.getByRole('heading', { name: 'Přidat dárek do seznamu' })).toHaveCount(0);
  await expect(giftForm(page)).toHaveCount(0);
};

/** @param {Page} page */
export const expectGiftFormEditable = async (page) => {
  const form = giftForm(page);
  await expect(form.locator('select[name="name"]')).toBeEnabled();
  await expect(form.locator('input[name="gift"]')).toBeEnabled();
  await expect(form.locator('input[name="price"]')).toBeEnabled();
};

/**
 * @param {Page} page
 * @param {number} value
 */
export const setBudget = async (page, value) => {
  await page.getByRole('button', { name: 'Upravit rozpočet' }).click();
  await page.locator('.hero-budget input').fill(String(value));
  await page.getByRole('button', { name: 'Uložit' }).click();
};

/**
 * @param {Page} page
 * @param {number} year
 * @param {number} value
 */
export const expectBudgetValueInStorage = async (page, year, value) => {
  await expect
    .poll(() =>
      page.evaluate((selectedYear) => {
        const raw = window.localStorage.getItem('gift-tracker:budgets');
        return raw ? JSON.parse(raw)[selectedYear] : null;
      }, year),
    )
    .toBe(value);
};

/**
 * @param {Page} page
 * @param {string} testId
 */
export const confirmByTestId = async (page, testId) => {
  await page.getByTestId(`${testId}-confirm`).click();
};

/** @param {Page} page */
export const installClock = async (page) => {
  await page.clock.install();
};
