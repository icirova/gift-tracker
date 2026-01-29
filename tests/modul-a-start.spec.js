// @ts-check
import { test, expect } from './fixtures';

test('TS-01: první načtení aplikace načte demo data', async ({ page }) => {
  await test.step('Základní sekce jsou viditelné', async () => {
    await expect(page.getByRole('heading', { name: 'Plán rozpočtu' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Seznam osob' })).toBeVisible();
    await expect(page.locator('.people-manager__list')).toBeVisible();
    await expect(page.locator('.people-manager__list')).toContainText('Anna');
  });

  await test.step('Formulář pro přidání dárku je dostupný', async () => {
    await expect(page.getByRole('heading', { name: 'Přidat dárek do seznamu' })).toBeVisible();
    await expect(page.locator('#gift-form')).toBeVisible();
  });

  await test.step('Seznam dárků obsahuje demo data', async () => {
    await expect(page.getByRole('heading', { name: /Seznam dárků/ })).toBeVisible();
    await expect(page.getByTestId('gift-table')).toBeVisible();
    await expect(page.locator('[data-testid^="gift-table-row-"]').first()).toBeVisible();
    await expect(page.getByTestId('gift-table')).toContainText('Anna');
    await expect(page.getByTestId('gift-table')).toContainText('Výlet do lázní');
  });

  await test.step('Historie, grafy a statistiky jsou zobrazené', async () => {
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
});

test('TS-02: data zůstávají po refreshi a nepřepíší se demo daty', async ({ page }) => {
  const addedGiftName = 'Testovací dárek TS-02';

  await test.step('Přidání dárku', async () => {
    const giftForm = page.locator('#gift-form');
    await giftForm.getByLabel('Jméno').selectOption('Anna');
    await giftForm.getByLabel('Dárek').fill(addedGiftName);
    await giftForm.getByLabel('Cena (Kč)').fill('1234');
    await expect(giftForm.getByRole('button', { name: 'Přidat dárek' })).toBeEnabled();
    await giftForm.getByRole('button', { name: 'Přidat dárek' }).click();

    await expect(page.locator('.table-gift', { hasText: addedGiftName })).toBeVisible();
  });

  await test.step('Po refreshi zůstávají změny', async () => {
    await page.reload();

    await expect(page.locator('.table-gift', { hasText: addedGiftName })).toBeVisible();
    await expect(page.getByTestId('gift-table')).toContainText('Výlet do lázní');
  });
});
