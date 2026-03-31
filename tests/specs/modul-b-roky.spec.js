// @ts-check
import { test, expect } from './fixtures';
import {
  confirmByTestId,
  expectBudgetValueInStorage,
  expectGiftFormEditable,
  expectGiftFormLocked,
  heroCta,
  selectYear,
} from './helpers';

/** @typedef {import('@playwright/test').Page} Page */
/** @typedef {import('@playwright/test').Browser} Browser */
/** @typedef {import('@playwright/test').BrowserContext} BrowserContext */

/**
 * @param {Browser} browser
 * @param {string} isoDate
 * @returns {Promise<{ context: BrowserContext, page: Page }>}
 */
const openAppWithMockedDate = async (browser, isoDate) => {
  const context = await browser.newContext();

  await context.addInitScript(`
    (() => {
      const fixedDate = new Date(${JSON.stringify(isoDate)});
      const RealDate = Date;

      function MockDate(...args) {
        if (!(this instanceof MockDate)) {
          return args.length === 0
            ? new RealDate(fixedDate).toString()
            : RealDate(...args);
        }
        return args.length === 0
          ? new RealDate(fixedDate)
          : new RealDate(...args);
      }

      MockDate.prototype = RealDate.prototype;
      Object.setPrototypeOf(MockDate, RealDate);
      MockDate.now = () => fixedDate.getTime();
      MockDate.parse = RealDate.parse;
      MockDate.UTC = RealDate.UTC;

      globalThis.Date = MockDate;
    })();
  `);

  const page = await context.newPage();
  await page.goto('/');

  return { context, page };
};

test('TS-03: přepnutí aktivního roku přefiltruje data', async ({ page }) => {
  await test.step('Přepnutí roku v hero sekci změní aktivní rok', async () => {
    await expect(page.getByTestId('gift-hero-year')).toHaveText('2026');
    await expect(page.getByTestId('gift-table')).toContainText('Výlet do lázní');

    await selectYear(page, 2025);
  });

  await test.step('Tabulka, rozpočet a statistiky odpovídají zvolenému roku', async () => {
    await expect(page.getByTestId('gift-table')).toContainText('Noise-cancelling sluchátka');
    await expect(page.getByTestId('gift-table')).not.toContainText('Výlet do lázní');
    await expect(page.locator('.hero-budget')).toContainText('16');
    await expect(page.locator('.hero-budget')).toContainText('Kč');
    await expect(page.getByTestId('gift-hero-spent')).toHaveText(/16.?400 Kč/);
  });
});

test('TS-04: ruční přidání následujícího roku aktivuje nový editovatelný rok', async ({
  page,
}) => {
  await test.step('CTA přidá pouze následující rok', async () => {
    const addYearButton = page.getByRole('button', { name: '+ 2027' });

    await expect(addYearButton).toBeVisible();
    await addYearButton.click();
    await confirmByTestId(page, 'hero-add-year-confirm');

    await expect(page.getByTestId('gift-hero-year')).toHaveText('2027');
    await expect(page.getByRole('combobox', { name: 'Rok' })).toHaveValue('2027');
    await expect(page.getByRole('button', { name: '+ 2027' })).toHaveCount(0);
  });

  await test.step('Nový rok je editovatelný a přebírá seznam osob', async () => {
    await expect(page.getByRole('button', { name: 'Nastavit rozpočet' })).toBeVisible();
    await expectGiftFormEditable(page);
    await expect(page.getByTestId('people-list')).toContainText('Anna');
    await expect(page.getByTestId('people-list')).toContainText('Jakub');
    await expect(page.getByRole('heading', { name: /Seznam dárků 2027/ })).toBeVisible();
  });
});

test(
  'TS-05: po přechodu do nového kalendářního roku se nový aktuální rok objeví v přepínači',
  /** @param {{ browser: Browser }} fixtures */
  async ({ browser }) => {
  const { context, page } = await openAppWithMockedDate(browser, '2027-01-01T10:00:00.000Z');

  try {
    await test.step('Nový aktuální rok je po načtení aplikace dostupný a aktivní', async () => {
      await expect(page.getByRole('tab', { name: '2027' })).toBeVisible();
      await expect(page.getByTestId('gift-hero-year')).toHaveText('2027');
      await expect(page.getByRole('combobox', { name: 'Rok' })).toHaveValue('2027');
    });

    await test.step('Nový aktuální rok je editovatelný', async () => {
      await expect(heroCta(page)).toBeEnabled();
      await expect(page.getByRole('button', { name: 'Nastavit rozpočet' })).toBeVisible();
      await expectGiftFormEditable(page);
    });
  } finally {
    await context.close();
  }
});

test(
  'TS-05b: po přechodu roku je dostupné přidání dalšího roku',
  /** @param {{ browser: Browser }} fixtures */
  async ({ browser }) => {
  const { context, page } = await openAppWithMockedDate(browser, '2027-01-01T10:00:00.000Z');

  try {
    await test.step('Hero sekce nabízí přidání následujícího roku', async () => {
      await expect(page.getByRole('button', { name: '+ 2028' })).toBeVisible();
    });

    await test.step('CTA umožní přidat rok aktuální + 1', async () => {
      await page.getByRole('button', { name: '+ 2028' }).click();
      await confirmByTestId(page, 'hero-add-year-confirm');

      await expect(page.getByTestId('gift-hero-year')).toHaveText('2028');
      await expect(page.getByRole('combobox', { name: 'Rok' })).toHaveValue('2028');
      await expect(page.getByRole('button', { name: '+ 2028' })).toHaveCount(0);
    });
  } finally {
    await context.close();
  }
});

test('TS-06: minulý rok je zamčený a nelze ho editovat', async ({ page }) => {
  await test.step('Minulý rok zobrazuje lock stav', async () => {
    await selectYear(page, 2025);

    await expect(page.getByText('Rok 2025 nelze editovat.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Odemknout úpravy' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Upravit rozpočet' })).toHaveCount(0);
    await expectGiftFormLocked(page);
  });

  await test.step('Po refreshi se bez odemknutí nic nezmění', async () => {
    await page.reload();
    await selectYear(page, 2025);

    await expect(page.getByText('Rok 2025 nelze editovat.')).toBeVisible();
    await expect(page.getByTestId('gift-table')).toContainText('Noise-cancelling sluchátka');
    await expect(page.getByTestId('gift-table')).not.toContainText('TS-06 testovací dárek');
    await expectGiftFormLocked(page);
  });
});

test('TS-07: po odemknutí lze minulý rok upravit a změny přetrvají po refreshi', async ({
  page,
}) => {
  await test.step('Minulý rok lze odemknout a upravit rozpočet', async () => {
    await selectYear(page, 2025);

    await page.getByRole('button', { name: 'Odemknout úpravy' }).click();
    await confirmByTestId(page, 'year-lock-confirm');

    await expect(page.getByRole('button', { name: 'Zamknout úpravy' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Upravit rozpočet' })).toBeVisible();
    await expectGiftFormEditable(page);

    await page.getByRole('button', { name: 'Upravit rozpočet' }).click();
    await page.locator('.hero-budget input').fill('16555');
    await page.getByRole('button', { name: 'Uložit' }).click();

    await expectBudgetValueInStorage(page, 2025, 16555);
  });

  await test.step('Po refreshi změna zůstane, ale editace je znovu zamčená', async () => {
    await page.reload();
    await selectYear(page, 2025);

    await expectBudgetValueInStorage(page, 2025, 16555);
    await expect(page.getByText('Rok 2025 nelze editovat.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Odemknout úpravy' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Upravit rozpočet' })).toHaveCount(0);
    await expectGiftFormLocked(page);
  });
});
