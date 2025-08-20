import type {EmailComponentSchema} from '@open-formulieren/types';
import {expect, test} from 'vitest';

import isEmpty from './empty';

test.each([
  // Empty states
  [undefined, true],
  ['', true],
  // Non-empty state
  ['test@mail.com', false],
])(
  'Email isEmpty compares against defined string with more then 0 characters state of value',
  (valueToTest: any, expected: boolean) => {
    const component: EmailComponentSchema = {
      type: 'email',
      key: 'email',
      id: 'email',
      label: 'Email',
      validateOn: 'blur',
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
  [['    test@mail.com'], false],
  [['test@mail.com    '], false],
  [['test@mail.com'], false],
])(
  'Multiple email isEmpty compares against defined string with more then 0 characters state of value',
  (valueToTest: any, expected: boolean) => {
    const component: EmailComponentSchema = {
      type: 'email',
      key: 'email',
      id: 'email',
      label: 'Email',
      validateOn: 'blur',
      multiple: true,
    };

    const result = isEmpty(component, valueToTest);
    expect(result).toBe(expected);
  }
);
