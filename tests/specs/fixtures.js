// @ts-check
import { test as base, expect } from '@playwright/test';

export const test = base.extend({
  page: async ({ page }, applyFixture) => {
    await page.goto('/');
    await page.evaluate(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });
    await page.reload();
    await applyFixture(page);
  },
});

export { expect };
