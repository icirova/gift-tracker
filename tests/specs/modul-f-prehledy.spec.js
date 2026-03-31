// @ts-check
import { test, expect } from './fixtures';

test('TS-20: tabulka seznam dárků filtruje podle hledání, stavu a roku', async ({ page }) => {
  const searchInput = page.getByTestId('gift-table-search');
  const statusFilter = page.getByTestId('gift-table-status-filter');
  const yearFilter = page.getByTestId('gift-table-year-filter');
  const giftTable = page.getByTestId('gift-table');

  await test.step('Hledání omezuje tabulku na relevantní položky', async () => {
    await searchInput.fill('lázní');

    await expect(giftTable).toContainText('Výlet do lázní');
    await expect(giftTable).not.toContainText('Kolo');
  });

  await test.step('Filtr stavu zobrazí jen plánované dárky', async () => {
    await searchInput.clear();
    await statusFilter.selectOption('idea');

    await expect(giftTable).toContainText('Čtečka knih');
    await expect(giftTable).toContainText('Skicovací sada');
    await expect(giftTable).not.toContainText('Výlet do lázní');
    await expect(giftTable).not.toContainText('Kolo');
  });

  await test.step('Filtr stavu zobrazí jen koupené dárky', async () => {
    await statusFilter.selectOption('bought');

    await expect(giftTable).toContainText('Výlet do lázní');
    await expect(giftTable).toContainText('Kolo');
    await expect(giftTable).not.toContainText('Čtečka knih');
    await expect(giftTable).not.toContainText('Skicovací sada');
  });

  await test.step('Přepnutí roku v tabulce zobrazí pouze data z daného roku', async () => {
    await statusFilter.selectOption('all');
    await yearFilter.selectOption('2025');

    await expect(page.getByTestId('gift-hero-year')).toHaveText('2025');
    await expect(giftTable).toContainText('Noise-cancelling sluchátka');
    await expect(giftTable).toContainText('Kožená taška');
    await expect(giftTable).not.toContainText('Výlet do lázní');
    await expect(giftTable).not.toContainText('Sportovní bunda');
  });
});

test('TS-21: historie dárků podle osoby se přepíná napříč roky', async ({ page }) => {
  const personFilter = page.getByTestId('person-history-filter');
  const historyTable = page.getByTestId('person-history-table');

  await test.step('Výchozí historie osoby Anna obsahuje koupené dárky z více let', async () => {
    await expect(historyTable).toContainText('2026');
    await expect(historyTable).toContainText('Výlet do lázní');
    await expect(historyTable).toContainText('2025');
    await expect(historyTable).toContainText('Noise-cancelling sluchátka');
    await expect(historyTable).toContainText('2024');
    await expect(historyTable).toContainText('Designový parfém');
    await expect(historyTable).toContainText('2023');
    await expect(historyTable).toContainText('Šperkovnice');
  });

  await test.step('Přepnutí osoby změní obsah historie', async () => {
    await personFilter.selectOption('Petra');

    await expect(historyTable).toContainText('Kurz vaření');
    await expect(historyTable).toContainText('Kurz focení');
    await expect(historyTable).not.toContainText('Výlet do lázní');
    await expect(historyTable).not.toContainText('Noise-cancelling sluchátka');
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
