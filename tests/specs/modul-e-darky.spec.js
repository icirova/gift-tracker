// @ts-check
import { test, expect } from './fixtures';
import { confirmByTestId, fillGiftForm, giftRow, giftRows, submitGiftForm } from './helpers';

test('TS-15: plánovaný dárek bez ceny se uloží a zobrazí v tabulce', async ({ page }) => {
  const giftName = 'Test plánovaný dárek TS-15';

  await test.step('Přidání plánovaného dárku bez ceny', async () => {
    await fillGiftForm(page, {
      name: 'Anna',
      status: 'Plánováno',
      gift: giftName,
    });

    await expect(page.locator('#gift-form').getByRole('button', { name: 'Přidat dárek' })).toBeEnabled();
    await submitGiftForm(page);
  });

  await test.step('Nový dárek je vidět v tabulce jako plánovaný', async () => {
    await expect(page.getByRole('status')).toContainText('Dárek byl přidán.');
    await expect(giftRows(page)).toHaveCount(9);
    await expect(giftRows(page).filter({ hasText: giftName })).toHaveCount(1);
    await expect(giftRows(page).filter({ hasText: giftName })).toContainText('Plánováno');
  });
});

test('TS-16: koupený dárek s cenou se uloží a přepočítá rozpočet', async ({ page }) => {
  const giftName = 'Test koupený dárek TS-16';

  await test.step('Přidání koupeného dárku s cenou', async () => {
    await fillGiftForm(page, {
      name: 'Anna',
      status: 'Koupeno',
      gift: giftName,
      price: '500',
    });

    await expect(page.locator('#gift-form').getByRole('button', { name: 'Přidat dárek' })).toBeEnabled();
    await submitGiftForm(page);
  });

  await test.step('Dárek se uloží a souhrny se přepočítají', async () => {
    await expect(giftRows(page)).toHaveCount(9);
    await expect(giftRows(page).filter({ hasText: giftName })).toHaveCount(1);
    await expect(giftRows(page).filter({ hasText: giftName })).toContainText('Koupeno');
    await expect(page.getByTestId('gift-budget-spent')).toContainText('18 700 Kč');
    await expect(page.getByTestId('gift-budget-total')).toContainText('26 900 Kč');
    await expect(page.getByTestId('gift-hero-spent')).toHaveText(/18.?700 Kč/);
  });
});

test('TS-17: koupený dárek bez ceny nelze uložit', async ({ page }) => {
  await test.step('Formulář zůstane nevalidní bez vyplněné ceny', async () => {
    await fillGiftForm(page, {
      name: 'Anna',
      status: 'Koupeno',
      gift: 'Nevalidní dárek TS-17',
    });

    await expect(page.locator('#gift-form').getByRole('button', { name: 'Přidat dárek' })).toBeDisabled();
  });

  await test.step('Nevalidní dárek se do tabulky neuloží', async () => {
    await expect(giftRows(page).filter({ hasText: 'Nevalidní dárek TS-17' })).toHaveCount(0);
  });
});

test('TS-17b: dárek se při uložení otrimuje a záporná cena zůstane nevalidní', async ({ page }) => {
  await test.step('Koupený dárek se zápornou cenou nelze uložit', async () => {
    await fillGiftForm(page, {
      name: 'Anna',
      status: 'Koupeno',
      gift: 'Nevalidní záporná cena TS-17b',
      price: '-100',
    });

    await expect(page.locator('#gift-form').getByRole('button', { name: 'Přidat dárek' })).toBeDisabled();
    await expect(giftRows(page).filter({ hasText: 'Nevalidní záporná cena TS-17b' })).toHaveCount(0);
  });

  await test.step('Plánovaný dárek s mezerami se uloží otrimovaný', async () => {
    await fillGiftForm(page, {
      name: 'Anna',
      status: 'Plánováno',
      gift: '  Trim dárek TS-17b  ',
    });
    await submitGiftForm(page);

    await expect(giftRows(page).filter({ hasText: 'Trim dárek TS-17b' })).toHaveCount(1);
  });
});

test('TS-18: editace ceny plánovaného dárku se projeví v tabulce i statistikách', async ({
  page,
}) => {
  await test.step('Doplnění ceny u plánovaného dárku', async () => {
    await page
      .locator('button.table-price__clickable[aria-label="Doplnit cenu pro dárek Skicovací sada"]')
      .click();
    await page.getByTestId('gift-table-price-input-2026-petra-2').fill('1500');
    await page.getByTestId('gift-table-price-input-2026-petra-2').press('Enter');
  });

  await test.step('Nová cena se promítne do tabulky i souhrnů rozpočtu', async () => {
    await expect(
      page.locator('button.table-price__clickable[aria-label="Upravit cenu pro dárek Skicovací sada"]'),
    ).toContainText('1 500');
    await expect(page.getByTestId('gift-budget-planned')).toContainText('9');
    await expect(page.getByTestId('gift-budget-planned')).toContainText('700 Kč');
    await expect(page.getByTestId('gift-budget-total')).toContainText('27');
    await expect(page.getByTestId('gift-budget-total')).toContainText('900 Kč');
  });
});

test('TS-19: smazání dárku a undo vrátí dárek do tabulky', async ({ page }) => {
  await test.step('Smazání dárku zobrazí undo toast', async () => {
    await page.getByRole('button', { name: 'Smazat dárek Sportovní bunda pro David' }).click();
    await confirmByTestId(page, 'gift-delete-confirm-2026-david-1');

    await expect(page.getByRole('status')).toContainText('Dárek byl smazán.');
    await expect(page.getByRole('button', { name: 'Vrátit zpět' })).toBeVisible();
    await expect(giftRow(page, '2026-david-1')).toHaveCount(0);
  });

  await test.step('Undo vrátí smazaný dárek zpět', async () => {
    await page.getByRole('button', { name: 'Vrátit zpět' }).click();

    await expect(giftRow(page, '2026-david-1')).toContainText('Sportovní bunda');
    await expect(giftRow(page, '2026-david-1')).toContainText('David');
  });
});
