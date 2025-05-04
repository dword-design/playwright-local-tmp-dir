import { test as base } from '@playwright/test';
import withLocalTmpDir from 'with-local-tmp-dir';

export const test = base.extend({
  localTmpDir: [
    async ({}, use) => {
      const reset = await withLocalTmpDir();
      try {
        await use();
      } finally {
        await reset();
      }
    },
    { auto: true },
  ],
});
