// @ts-check
import { test, expect } from './fixtures';
import { expectBudgetValueInStorage, giftRow, giftRows, setBudget } from './helpers';

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
    await expect(giftRows(page)).toHaveCount(8);
    await expect(giftRow(page, '2026-anna-1')).toContainText('Výlet do lázní');
    await expect(giftRow(page, '2026-jakub-1')).toContainText('Kolo');
    await expect(giftRow(page, '2026-petra-1')).toContainText('Kurz vaření');
    await expect(giftRow(page, '2026-eva-1')).toContainText('Wellness balíček');
    await expect(giftRow(page, '2026-david-1')).toContainText('Sportovní bunda');
    await expect(giftRow(page, '2026-anna-2')).toContainText('Čtečka knih');
    await expect(giftRow(page, '2026-martin-1')).toContainText('Projektor');
    await expect(giftRow(page, '2026-petra-2')).toContainText('Skicovací sada');
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

    await expect(page.getByTestId('gift-hero-budget-summary')).toContainText('Rozpočet: 12 000 Kč');
    await expect(page.getByTestId('gift-hero-budget-delta')).toHaveText('-14 400 Kč');
    await expect(page.getByTestId('gift-budget-delta')).toContainText('Překročeno');
    await expect(page.getByTestId('gift-budget-delta')).toContainText('-14 400 Kč');
  });

  await test.step('Hero i plán rozpočtu zobrazují červený over-budget indikátor', async () => {
    await expect(page.getByTestId('gift-hero-budget-bar')).toHaveClass(/hero-budget-summary__fill--over/);
    await expect(page.locator('.hero-budget__segment--over')).toHaveCount(1);
  });
});

test('TS-10b: nevalidní rozpočet se neuloží a původní hodnota zůstane zachovaná', async ({
  page,
}) => {
  await test.step('Výchozí rozpočet se nejdřív nastaví na validní hodnotu', async () => {
    await setBudget(page, 20000);
    await expect(page.getByTestId('gift-hero-budget-summary')).toContainText('Rozpočet: 20 000 Kč');
    await expectBudgetValueInStorage(page, 2026, 20000);
  });

  await test.step('Záporná hodnota se po uložení ignoruje', async () => {
    await page.getByRole('button', { name: 'Upravit rozpočet' }).click();
    await page.locator('.hero-budget input').fill('-500');
    await page.getByRole('button', { name: 'Uložit' }).click();

    await expect(page.getByTestId('gift-hero-budget-summary')).toContainText('Rozpočet: 20 000 Kč');
    await expectBudgetValueInStorage(page, 2026, 20000);
  });

  await test.step('Nečíselná hodnota se po uložení také ignoruje', async () => {
    await page.getByRole('button', { name: 'Upravit rozpočet' }).click();
    await page.locator('.hero-budget input').fill('abc');
    await page.getByRole('button', { name: 'Uložit' }).click();

    await expect(page.getByTestId('gift-hero-budget-summary')).toContainText('Rozpočet: 20 000 Kč');
    await expectBudgetValueInStorage(page, 2026, 20000);
  });
});
