import type {TextareaComponentSchema} from '@open-formulieren/types';
import {expect, test} from 'vitest';

import isEmpty from './empty';

test.each([
  // Empty states
  [undefined, true],
  ['', true],
  // Non-empty state
  ['foo', false],
])(
  'Textarea isEmpty compares against defined string with more then 0 characters state of value',
  (valueToTest: string | undefined, expected: boolean) => {
    const component: TextareaComponentSchema = {
      type: 'textarea',
      key: 'textarea',
      id: 'textarea',
      label: 'textarea',
      autoExpand: false,
    };

    const result = isEmpty(component, valueToTest);
    expect(result).toBe(expected);
  }
);

test.each([
  // Empty states
  [undefined, true],
  [[], true],
  [[''], true],
  [['      '], true],
  // Non-empty state
  [['    foo'], false],
  [['foo    '], false],
  [['foo'], false],
])(
  'Multiple textarea isEmpty compares against defined string with more then 0 characters state of value',
  (valueToTest: string[] | undefined, expected: boolean) => {
    const component: TextareaComponentSchema = {
      type: 'textarea',
      key: 'textarea',
      id: 'textarea',
      label: 'textarea',
      multiple: true,
      autoExpand: false,
    };

    const result = isEmpty(component, valueToTest);
    expect(result).toBe(expected);
  }
);
