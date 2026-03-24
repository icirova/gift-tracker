// @ts-check
import { test as base, expect } from '@playwright/test';

/** @typedef {import('@playwright/test').Page} Page */

export const test = base.extend({
  /**
   * @param {{ page: Page }} args
   * @param {(page: Page) => Promise<void>} applyFixture
   */
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
