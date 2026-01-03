import type {EmailComponentSchema} from '@open-formulieren/types';
import {expect, test} from 'vitest';

import {getRegistryEntry} from '@/registry';

import isEmpty from './empty';

test.each([
  // Empty states
  [undefined, true],
  [null, true],
  ['', true],
  // Non-empty state
  ['test@mail.com', false],
])(
  'Email isEmpty compares against defined string with more then 0 characters state of value',
  (valueToTest: string | undefined, expected: boolean) => {
    const component: EmailComponentSchema = {
      type: 'email',
      key: 'email',
      id: 'email',
      label: 'Email',
    };

    const result = isEmpty(component, valueToTest, getRegistryEntry);
    expect(result).toBe(expected);
  }
);

test.each([
  // Empty states
  [undefined, true],
  [null, true],
  [[], true],
  [[''], true],
  [['', ''], true],
  [['      '], true],
  [[undefined], true],
  [[null], true],
  // Non-empty state
  [['    test@mail.com'], false],
  [['test@mail.com    '], false],
  [['test@mail.com'], false],
  [['test@mail.com', 'test2@mail.com'], false],
  [['', 'test2@mail.com'], false],
])(
  'Multiple email isEmpty compares against defined string with more then 0 characters state of value',
  (valueToTest: string[] | undefined, expected: boolean) => {
    const component: EmailComponentSchema = {
      type: 'email',
      key: 'email',
      id: 'email',
      label: 'Email',
      multiple: true,
    };

    const result = isEmpty(component, valueToTest, getRegistryEntry);
    expect(result).toBe(expected);
  }
);
