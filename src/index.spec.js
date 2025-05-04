import { endent } from '@dword-design/functions';
import { expect } from '@playwright/test';
import { execaCommand } from 'execa';
import fs from 'fs-extra';
import { globby } from 'globby';
import pathLib from 'path';

import { test } from './index.js';

test('works', () =>
  expect(pathLib.basename(process.cwd()).startsWith('tmp-')).toBe(true));

test('sigint', async () => {
  await fs.outputFile(
    'index.spec.js',
    endent`
      import { test } from '../src/index.js';

      test('works', () => new Promise(resolve => setTimeout(resolve, 2000)));
    `,
  );

  const cwd = process.cwd();

  const testProcess = execaCommand('playwright test', {
    reject: false,
    stdio: 'inherit',
  });

  await new Promise(resolve => setTimeout(resolve, 1000));
  testProcess.kill('SIGINT');
  await testProcess;
  expect(process.cwd()).toEqual(cwd);
  expect(await globby('*', { onlyDirectories: true })).toEqual([]);
});
