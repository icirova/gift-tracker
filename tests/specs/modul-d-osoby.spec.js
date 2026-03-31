// @ts-check
import { test, expect } from './fixtures';

/** @typedef {import('@playwright/test').Page} Page */

/**
 * @param {Page} page
 * @param {string} name
 */
const addPerson = async (page, name) => {
  const peopleForm = page.getByTestId('people-form');
  await peopleForm.getByRole('textbox').fill(name);
  await peopleForm.getByRole('button', { name: 'Přidat osobu' }).click();
};

/**
 * @param {Page} page
 * @returns {Promise<string[]>}
 */
const getGiftFormNames = async (page) =>
  page.locator('#gift-form select[name="name"] option').allInnerTexts();

test('TS-11: přidání osoby ji zobrazí v seznamu a ve formuláři pro dárky', async ({ page }) => {
  const newPerson = 'Iveta';

  await test.step('Přidání nové osoby do seznamu', async () => {
    await addPerson(page, newPerson);

    await expect(page.getByTestId('people-list')).toContainText(newPerson);
  });

  await test.step('Nová osoba je dostupná ve formuláři pro přidání dárku', async () => {
    await expect(page.locator('#gift-form')).toBeVisible();
    await expect.poll(async () => getGiftFormNames(page)).toContain(newPerson);
  });
});

test('TS-12: duplicitní osoba se bez ohledu na velikost písmen neuloží', async ({ page }) => {
  const peopleForm = page.getByTestId('people-form');

  await test.step('Pokus o přidání osoby se stejným jménem jiným case skončí chybou', async () => {
    await addPerson(page, 'eva');

    await expect(page.getByTestId('people-form-error')).toHaveText(
      'Osoba s tímto jménem už existuje.',
    );
  });

  await test.step('Duplicitní jméno se neobjeví v seznamu ani ve formuláři navíc', async () => {
    await expect(page.getByTestId('people-list')).toContainText('Eva');
    await expect(page.getByTestId('people-list')).not.toContainText('eva');
    await expect.poll(async () => getGiftFormNames(page)).toEqual(
      expect.arrayContaining(['Eva']),
    );
  });
});

test('TS-13: smazání osoby odstraní ji i její dárky z aktivního roku', async ({ page }) => {
  await test.step('Smazání osoby s dárky', async () => {
    await expect(page.getByTestId('people-list')).toContainText('Anna');
    await expect(page.getByTestId('gift-table')).toContainText('Výlet do lázní');

    await page.getByRole('button', { name: 'Odebrat osobu Anna' }).click();
    await page.getByTestId('people-remove-confirm-confirm').click();
  });

  await test.step('Osoba zmizí ze seznamu, formuláře i tabulky', async () => {
    await expect(page.getByTestId('people-list')).not.toContainText('Anna');
    await expect.poll(async () => getGiftFormNames(page)).not.toContain('Anna');
    await expect(page.getByTestId('gift-table')).not.toContainText('Výlet do lázní');
    await expect(page.getByTestId('gift-table')).not.toContainText('Čtečka knih');
  });
});

test('TS-14: undo po smazání osoby vrátí osobu, nabídku i dárky', async ({ page }) => {
  await test.step('Smazání osoby zobrazí undo toast', async () => {
    await page.getByRole('button', { name: 'Odebrat osobu Anna' }).click();
    await page.getByTestId('people-remove-confirm-confirm').click();

    await expect(page.getByRole('status')).toContainText('Jméno bylo odebráno.');
    await expect(page.getByRole('button', { name: 'Zpět' })).toBeVisible();
  });

  await test.step('Undo vrátí osobu do seznamu, formuláře i tabulky', async () => {
    await page.getByRole('button', { name: 'Zpět' }).click();

    await expect(page.getByTestId('people-list')).toContainText('Anna');
    await expect.poll(async () => getGiftFormNames(page)).toContain('Anna');
    await expect(page.getByTestId('gift-table')).toContainText('Výlet do lázní');
    await expect(page.getByTestId('gift-table')).toContainText('Čtečka knih');
  });
});
