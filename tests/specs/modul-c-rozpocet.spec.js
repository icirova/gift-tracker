// @ts-check
import { test, expect } from './fixtures';

/** @typedef {import('@playwright/test').Page} Page */

/**
 * @param {Page} page
 * @param {number} value
 */
const setBudget = async (page, value) => {
  await page.getByRole('button', { name: 'Upravit rozpočet' }).click();
  await page.locator('.hero-budget input').fill(String(value));
  await page.getByRole('button', { name: 'Uložit' }).click();
};

/**
 * @param {Page} page
 * @param {number} year
 * @param {number} value
 */
const expectBudgetValueInStorage = async (page, year, value) => {
  await expect
    .poll(() =>
      page.evaluate((selectedYear) => {
        const raw = window.localStorage.getItem('gift-tracker:budgets');
        return raw ? JSON.parse(raw)[selectedYear] : null;
      }, year),
    )
    .toBe(value);
};

test('TS-08: nastavení rozpočtu pro aktivní rok se uloží a přetrvá po refreshi', async ({
  page,
}) => {
  await test.step('Změna rozpočtu pro aktivní rok', async () => {
    await expect(page.getByTestId('gift-hero-year')).toHaveText('2026');

    await setBudget(page, 20000);

    await expect(page.getByRole('button', { name: 'Upravit rozpočet' })).toContainText('20');
    await expect(page.getByRole('button', { name: 'Upravit rozpočet' })).toContainText('Kč');
    await expect(page.getByTestId('gift-hero-budget-summary')).toContainText('Rozpočet: 20');
    await expectBudgetValueInStorage(page, 2026, 20000);
  });

  await test.step('Rozpočet zůstane po refreshi zachovaný', async () => {
    await page.reload();

    await expect(page.getByTestId('gift-hero-year')).toHaveText('2026');
    await expect(page.getByRole('button', { name: 'Upravit rozpočet' })).toContainText('20');
    await expect(page.getByRole('button', { name: 'Upravit rozpočet' })).toContainText('Kč');
    await expect(page.getByTestId('gift-hero-budget-summary')).toContainText('Rozpočet: 20');
    await expectBudgetValueInStorage(page, 2026, 20000);
  });
});

test('TS-09: součty koupeno, plánováno a delta odpovídají datům v tabulce', async ({ page }) => {
  await test.step('Tabulka obsahuje položky odpovídající součtům', async () => {
    await expect(page.getByTestId('gift-table')).toContainText('Výlet do lázní');
    await expect(page.getByTestId('gift-table')).toContainText('Kolo');
    await expect(page.getByTestId('gift-table')).toContainText('Kurz vaření');
    await expect(page.getByTestId('gift-table')).toContainText('Wellness balíček');
    await expect(page.getByTestId('gift-table')).toContainText('Sportovní bunda');
    await expect(page.getByTestId('gift-table')).toContainText('Čtečka knih');
    await expect(page.getByTestId('gift-table')).toContainText('Projektor');
    await expect(page.getByTestId('gift-table')).toContainText('Skicovací sada');
  });

  await test.step('Souhrn rozpočtu odpovídá demo datům pro rok 2026', async () => {
    await expect(page.getByTestId('gift-budget-spent')).toContainText('18');
    await expect(page.getByTestId('gift-budget-spent')).toContainText('200 Kč');

    await expect(page.getByTestId('gift-budget-planned')).toContainText('8');
    await expect(page.getByTestId('gift-budget-planned')).toContainText('200 Kč');
    await expect(page.getByTestId('gift-budget-planned')).toContainText('+ 1 dárek bez ceny');

    await expect(page.getByTestId('gift-budget-total')).toContainText('26');
    await expect(page.getByTestId('gift-budget-total')).toContainText('400 Kč');

    await expect(page.getByTestId('gift-budget-delta')).toContainText('Překročeno');
    await expect(page.getByTestId('gift-budget-delta')).toContainText('-8');
    await expect(page.getByTestId('gift-budget-delta')).toContainText('400 Kč');
  });
});

test('TS-10: při překročení rozpočtu se zobrazí over-budget stav', async ({ page }) => {
  await test.step('Snížení rozpočtu vyvolá over-budget stav', async () => {
    await setBudget(page, 12000);

    await expect(page.getByTestId('gift-hero-budget-summary')).toContainText('Rozpočet: 12');
    await expect(page.getByTestId('gift-hero-budget-summary')).toContainText('000 Kč');
    await expect(page.getByTestId('gift-hero-budget-delta')).toHaveText('-14 400 Kč');
    await expect(page.getByTestId('gift-budget-delta')).toContainText('Překročeno');
    await expect(page.getByTestId('gift-budget-delta')).toContainText('-14');
    await expect(page.getByTestId('gift-budget-delta')).toContainText('400 Kč');
  });

  await test.step('Hero i plán rozpočtu zobrazují červený over-budget indikátor', async () => {
    await expect(page.getByTestId('gift-hero-budget-bar')).toHaveClass(/hero-budget-summary__fill--over/);
    await expect(page.locator('.hero-budget__segment--over')).toHaveCount(1);
  });
});
