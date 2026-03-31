// @ts-check
import { test as base, expect } from '@playwright/test';

/** @typedef {import('@playwright/test').Page} Page */

export const test = base.extend({
  /**
   * @param {{ page: Page }} args
   * @param {(page: Page) => Promise<void>} applyFixture
   */
  page: async ({ page }, applyFixture) => {
    await page.addInitScript(() => {
      const resetMarker = '__pw-storage-reset__';
      if (window.sessionStorage.getItem(resetMarker)) {
        return;
      }
      window.localStorage.clear();
      window.sessionStorage.clear();
      window.sessionStorage.setItem(resetMarker, '1');
    });
    await page.goto('/');
    await applyFixture(page);
  },
});

export { expect };
