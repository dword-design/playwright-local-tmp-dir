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

      test('works', async () => {
        await fs.mkdir('testdir');
        await new Promise(() => {});
      });
    `,
  );

  const cwd = process.cwd();

  const dirCreated = new Promise(resolve => {
    const watcher = fs.watch('.', (eventType, filename) => {
      if (eventType === 'rename' && filename.startsWith('tmp-')) {
        watcher.close();
        resolve();
      }
    });
  });

  const testProcess = execaCommand('playwright test', { reject: false });
  await dirCreated;
  testProcess.kill('SIGINT');
  await testProcess;
  expect(process.cwd()).toEqual(cwd);
  expect(await globby('*', { onlyDirectories: true })).toEqual([]);
});
