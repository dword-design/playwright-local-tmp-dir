import { endent } from '@dword-design/functions';
import { expect } from '@playwright/test';
import { execaCommand } from 'execa';
import fs from 'fs-extra';
import pathLib from 'path';

import { test } from './index.js';

test('works', () =>
  expect(pathLib.basename(process.cwd()).startsWith('tmp-')).toBe(true));

test('sigint', async () => {
  await fs.outputFile(
    'index.spec.js',
    endent`
      import { test } from '../src/index.js';

      test('works', () => {});
    `,
  );

  await execaCommand('playwright test');
});
