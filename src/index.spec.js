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

      test('works', () => new Promise(() => {}));
    `,
  );

  const cwd = process.cwd();
  const testProcess = execaCommand('playwright test', { reject: false });
  let tmpDir;

  await new Promise(resolve => {
    const watcher = fs.watch('.', (eventType, filename) => {
      if (eventType === 'rename' && filename.startsWith('tmp-')) {
        tmpDir = pathLib.resolve(filename);
        watcher.close();
        resolve();
      }
    });
  });

  testProcess.kill('SIGINT');

  await new Promise(resolve => {
    const watcher = fs.watch('.', async (eventType, filename) => {
      if (
        eventType === 'rename' &&
        pathLib.join(process.cwd(), filename) === tmpDir &&
        !(await fs.exists(filename))
      ) {
        watcher.close();
        resolve();
      }
    });
  });

  await testProcess;
  expect(process.cwd()).toEqual(cwd);
});
