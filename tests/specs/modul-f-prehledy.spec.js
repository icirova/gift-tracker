// @ts-check
import { test, expect } from './fixtures';
import { giftRow, giftRows, historyRow, historyRows } from './helpers';

test('TS-20: tabulka seznam dárků filtruje podle hledání, stavu a roku', async ({ page }) => {
  const searchInput = page.getByTestId('gift-table-search');
  const statusFilter = page.getByTestId('gift-table-status-filter');
  const yearFilter = page.getByTestId('gift-table-year-filter');
  const giftTable = page.getByTestId('gift-table');

  await test.step('Hledání omezuje tabulku na relevantní položky', async () => {
    await searchInput.fill('lázní');

    await expect(giftRows(page)).toHaveCount(1);
    await expect(giftRow(page, '2026-anna-1')).toContainText('Výlet do lázní');
  });

  await test.step('Filtr stavu zobrazí jen plánované dárky', async () => {
    await searchInput.clear();
    await statusFilter.selectOption('idea');

    await expect(giftRows(page)).toHaveCount(3);
    await expect(giftRow(page, '2026-anna-2')).toContainText('Čtečka knih');
    await expect(giftRow(page, '2026-petra-2')).toContainText('Skicovací sada');
    await expect(giftRow(page, '2026-martin-1')).toContainText('Projektor');
  });

  await test.step('Filtr stavu zobrazí jen koupené dárky', async () => {
    await statusFilter.selectOption('bought');

    await expect(giftRows(page)).toHaveCount(5);
    await expect(giftRow(page, '2026-anna-1')).toContainText('Výlet do lázní');
    await expect(giftRow(page, '2026-jakub-1')).toContainText('Kolo');
    await expect(giftRow(page, '2026-petra-1')).toContainText('Kurz vaření');
    await expect(giftRow(page, '2026-eva-1')).toContainText('Wellness balíček');
    await expect(giftRow(page, '2026-david-1')).toContainText('Sportovní bunda');
  });

  await test.step('Přepnutí roku v tabulce zobrazí pouze data z daného roku', async () => {
    await statusFilter.selectOption('all');
    await yearFilter.selectOption('2025');

    await expect(page.getByTestId('gift-hero-year')).toHaveText('2025');
    await expect(giftRows(page)).toHaveCount(6);
    await expect(giftRow(page, '2025-anna-1')).toContainText('Noise-cancelling sluchátka');
    await expect(giftRow(page, '2025-tomas-1')).toContainText('Kožená taška');
    await expect(giftRow(page, '2025-jakub-1')).toContainText('Outdoorová výbava');
    await expect(giftRow(page, '2025-petra-1')).toContainText('Workshop keramiky');
    await expect(giftRow(page, '2025-martin-1')).toContainText('Herní monitor');
    await expect(giftRow(page, '2025-lucie-1')).toContainText('Kurz baristy');
  });
});

test('TS-21: historie dárků podle osoby se přepíná napříč roky', async ({ page }) => {
  const personFilter = page.getByTestId('person-history-filter');
  const historyTable = page.getByTestId('person-history-table');

  await test.step('Výchozí historie osoby Anna obsahuje koupené dárky z více let', async () => {
    await expect(historyRows(page)).toHaveCount(4);
    await expect(historyRow(page, '2026-anna-1')).toContainText('Výlet do lázní');
    await expect(historyRow(page, '2025-anna-1')).toContainText('Noise-cancelling sluchátka');
    await expect(historyRow(page, '2024-anna-1')).toContainText('Designový parfém');
    await expect(historyRow(page, '2023-anna-1')).toContainText('Šperkovnice');
  });

  await test.step('Přepnutí osoby změní obsah historie', async () => {
    await personFilter.selectOption('Petra');

    await expect(historyRows(page)).toHaveCount(3);
    await expect(historyRow(page, '2026-petra-1')).toContainText('Kurz vaření');
    await expect(historyRow(page, '2024-petra-1')).toContainText('Kurz focení');
    await expect(historyRow(page, '2023-petra-1')).toContainText('Sportovní míč');
  });
});

test('TS-22: grafy a souhrny odpovídají datům v tabulce', async ({ page }) => {
  await test.step('Souhrny odpovídají demo datům pro aktivní rok 2026', async () => {
    await expect(page.getByTestId('gift-summary-cheapest')).toContainText('1 900 Kč');
    await expect(page.getByTestId('gift-summary-expensive')).toContainText('8 200 Kč');
    await expect(page.getByTestId('gift-summary-average')).toContainText('3 640 Kč');
    await expect(page.getByTestId('gift-summary-trend')).toContainText('+1 800 Kč');
  });

  await test.step('Sekce grafů pro aktivní rok jsou zobrazené', async () => {
    await expect(page.getByRole('heading', { name: 'Počet dárků' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Utraceno podle osob' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Historie utracené částky' })).toBeVisible();
    await expect(page.locator('.charts-legend')).toContainText('Anna');
    await expect(page.locator('.charts-legend')).toContainText('Jakub');
    await expect(page.locator('.charts-legend')).toContainText('Petra');
  });
});
