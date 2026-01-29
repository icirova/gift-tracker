// @ts-check
import { test, expect } from '@playwright/test';

test('TS-01: první načtení aplikace načte demo data', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Plán rozpočtu' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Seznam osob' })).toBeVisible();
  await expect(page.locator('.people-manager__list')).toBeVisible();
  await expect(page.locator('.people-manager__list')).toContainText('Anna');

  await expect(page.getByRole('heading', { name: 'Přidat dárek do seznamu' })).toBeVisible();
  await expect(page.locator('#gift-form')).toBeVisible();

  await expect(page.getByRole('heading', { name: /Seznam dárků/ })).toBeVisible();
  await expect(page.getByTestId('gift-table')).toBeVisible();
  await expect(page.locator('[data-testid^="gift-table-row-"]').first()).toBeVisible();
  await expect(page.getByTestId('gift-table')).toContainText('Anna');
  await expect(page.getByTestId('gift-table')).toContainText('Výlet do lázní');

  await expect(page.getByRole('heading', { name: 'Historie dárků podle osoby' })).toBeVisible();
  await expect(page.locator('.person-history__table')).toBeVisible();
  await expect(page.locator('.person-history__table')).toContainText('Výlet do lázní');
  await expect(page.getByRole('heading', { name: 'Počet dárků' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Utraceno podle osob' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Historie utracené částky' })).toBeVisible();

  await expect(page.getByTestId('gift-summary-cheapest')).toBeVisible();
  await expect(page.getByTestId('gift-summary-expensive')).toBeVisible();
  await expect(page.getByTestId('gift-summary-average')).toBeVisible();
  await expect(page.getByTestId('gift-summary-trend')).toBeVisible();
});
