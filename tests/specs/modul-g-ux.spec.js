// @ts-check
import { test, expect } from './fixtures';

/** @typedef {import('@playwright/test').Page} Page */

/** @param {Page} page */
const installClock = async (page) => {
  await page.clock.install();
};

/**
 * @param {Page} page
 * @param {string} giftName
 */
const fillGiftForm = async (page, giftName) => {
  const form = page.locator('#gift-form');
  await form.locator('select[name="name"]').selectOption('Anna');
  await form.locator('select[name="status"]').selectOption('bought');
  await form.locator('input[name="gift"]').fill(giftName);
  await form.locator('input[name="price"]').fill('321');
};

test('TS-23: CTA v hero sekci scrolluje na formulář a v needitovatelném roce je neaktivní', async ({
  page,
}) => {
  await test.step('V editovatelném roce CTA volá scroll na formulář', async () => {
    await page.evaluate(`
      (() => {
        window.__giftFormScrollCalled = false;
        const originalScrollIntoView = Element.prototype.scrollIntoView;
        Element.prototype.scrollIntoView = function (...args) {
          if (this instanceof HTMLElement && this.id === 'gift-form') {
            window.__giftFormScrollCalled = true;
          }
          return originalScrollIntoView.apply(this, args);
        };
      })();
    `);

    await page.locator('.hero__cta').click();

    await expect
      .poll(() => page.evaluate('window.__giftFormScrollCalled'))
      .toBe(true);
  });

  await test.step('V needitovatelném minulém roce je CTA disabled', async () => {
    await page.getByRole('tab', { name: '2025' }).click();

    await expect(page.locator('.hero__cta')).toBeDisabled();
  });
});

test('TS-24: toast odpovídá akci, undo funguje a toast po timeoutu zmizí', async ({ page }) => {
  await test.step('Po smazání dárku se zobrazí toast a undo ho vrátí', async () => {
    await installClock(page);
    await page.getByRole('button', { name: 'Smazat dárek Sportovní bunda pro David' }).click();
    await page.locator('.table-status__confirm--wrap').getByRole('button', { name: 'Ano' }).click();

    await expect(page.getByRole('status')).toContainText('Dárek byl smazán.');
    await page.getByRole('button', { name: 'Vrátit zpět' }).click();
    await expect(page.getByTestId('gift-table')).toContainText('Sportovní bunda');
  });

  await test.step('Toast po časovém limitu zmizí', async () => {
    await page.getByRole('button', { name: 'Smazat dárek Sportovní bunda pro David' }).click();
    await page.locator('.table-status__confirm--wrap').getByRole('button', { name: 'Ano' }).click();

    await expect(page.getByRole('status')).toContainText('Dárek byl smazán.');
    await page.clock.runFor(5000);
    await expect(page.getByRole('status')).toHaveCount(0);
  });
});

test('TS-25: nově přidaná položka je dočasně zvýrazněná v tabulce', async ({ page }) => {
  const giftName = 'Zvýrazněný dárek TS-25';
  const highlightedRow = page.locator('tr.table-row--highlight', { hasText: giftName });

  await test.step('Po přidání dárku je nový řádek zvýrazněný', async () => {
    await installClock(page);
    await fillGiftForm(page, giftName);
    await page.locator('#gift-form').getByRole('button', { name: 'Přidat dárek' }).click();

    await expect(page.getByRole('status')).toContainText('Dárek byl přidán.');
    await expect(highlightedRow).toBeVisible();
  });

  await test.step('Zvýraznění po čase zmizí', async () => {
    await page.clock.runFor(2500);
    await expect(highlightedRow).toHaveCount(0);
  });
});
