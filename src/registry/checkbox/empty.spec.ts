import type {CheckboxComponentSchema} from '@open-formulieren/types';
import {expect, test} from 'vitest';

import isEmpty from './empty';

test.each([
  // Empty states
  [undefined, true],
  [false, true],
  // Non-empty state
  [true, false],
])(
  'Checkbox isEmpty compares against checked/unchecked state of value',
  (valueToTest: any, expected: boolean) => {
    const component: CheckboxComponentSchema = {
      type: 'checkbox',
      key: 'checkbox',
      id: 'checkbox',
      label: 'Checkbox',
      defaultValue: false,
    };

    const result = isEmpty(component, valueToTest);
    expect(result).toBe(expected);
  }
);
