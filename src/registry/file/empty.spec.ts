import type {FileComponentSchema} from '@open-formulieren/types';
import {expect, test} from 'vitest';

import isEmpty from './empty';
import {FILE_COMPONENT_BOILERPLATE, buildFile, getFileConfiguration} from './test-utils';
import type {FormikFileUpload} from './types';

test.each([
  // Empty states
  [undefined, true],
  [[], true],
  // Non-empty states
  [[{}], false],
  [[buildFile({name: 'not-empty.pdf', type: 'application/pdf', size: 1, state: undefined})], false],
])(
  'file isEmpty compares against defined, non-empty array state of value',
  (valueToTest: FormikFileUpload[] | undefined, expected: boolean) => {
    const component: FileComponentSchema = {
      ...FILE_COMPONENT_BOILERPLATE,
      ...getFileConfiguration(['application/pdf']),
      id: 'component1',
      type: 'file',
      key: 'attachments',
      label: 'Attachments',
    };

    const result = isEmpty(component, valueToTest);
    expect(result).toBe(expected);
  }
);
