// @ts-check
import { test, expect } from './fixtures';

test('TS-03: přepnutí roku v záhlaví mění aktivní rok', async ({ page }) => {
  let secondYear = '';

  await test.step('Rok v záhlaví lze přepnout', async () => {
    const yearTabs = page.getByRole('tab');
    await expect(yearTabs).toHaveCount(3);

    const firstYear = (await yearTabs.nth(0).innerText()).trim();
    secondYear = (await yearTabs.nth(1).innerText()).trim();

    await expect(page.getByTestId('gift-hero-year')).toHaveText(firstYear);

    await yearTabs.nth(1).click();
  });

  await test.step('Přepnutí roku se projeví v UI', async () => {
    await expect(page.getByTestId('gift-hero-year')).toHaveText(secondYear);
    await expect(page.getByRole('combobox', { name: 'Rok' })).toHaveValue(secondYear);
  });
});

test('TS-04: ruční přidání následujícího roku', async ({ page }) => {
  let nextYear = '';

  await test.step('Tlačítko pro přidání dalšího roku je viditelné', async () => {
    const addYearButton = page.getByRole('button', { name: /^\+\s*\d{4}$/ });
    await expect(addYearButton).toBeVisible();
    const nextYearText = (await addYearButton.innerText()).trim();
    nextYear = nextYearText.replace('+', '').trim();
  });

  await test.step('Přidání roku nastaví aktivní rok', async () => {
    const addYearButton = page.getByRole('button', { name: /^\+\s*\d{4}$/ });
    await addYearButton.click();

    const confirm = page.locator('.hero__year-confirm');
    await expect(confirm).toBeVisible();
    await confirm.getByRole('button', { name: 'Ano' }).click();

    await expect(page.getByTestId('gift-hero-year')).toHaveText(nextYear);
    await expect(page.getByRole('combobox', { name: 'Rok' })).toHaveValue(nextYear);
  });
});
