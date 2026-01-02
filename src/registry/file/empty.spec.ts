import type {FileComponentSchema} from '@open-formulieren/types';
import {expect, test} from 'vitest';

import {getRegistryEntry} from '@/registry';

import isEmpty from './empty';
import {buildFile, getFileConfiguration} from './test-utils';
import type {FormikFileUpload} from './types';

test.each([
  // Empty states
  [undefined, true],
  [null, true],
  [[], true],
  [[{}], true],
  // Non-empty states
  [[buildFile({name: 'not-empty.pdf', type: 'application/pdf', size: 1, state: undefined})], false],
])(
  'file isEmpty compares against defined, non-empty array state of value',
  (valueToTest: FormikFileUpload[] | undefined, expected: boolean) => {
    const component: FileComponentSchema = {
      ...getFileConfiguration(['application/pdf']),
      id: 'component1',
      type: 'file',
      key: 'attachments',
      label: 'Attachments',
    };

    const result = isEmpty(component, valueToTest, getRegistryEntry);
    expect(result).toBe(expected);
  }
);
