import type {SelectboxesComponentSchema} from '@open-formulieren/types';
import {expect, test} from 'vitest';

import {getRegistryEntry} from '@/registry';

import isEmpty from './empty';

test.each([
  // Empty states
  [undefined, true],
  [null, true],
  [{}, true],
  [{'123': false}, true],
  // Non-empty states
  [{'123': true}, false],
])(
  'Selectboxes isEmpty compares against checked/unchecked state of value',
  (valueToTest: Record<string, boolean>, expected: boolean) => {
    const component: SelectboxesComponentSchema = {
      type: 'selectboxes',
      key: 'selectboxes',
      id: 'selectboxes',
      label: 'Selectboxes',
      openForms: {translations: {}, dataSrc: 'manual'},
      values: [{value: '123', label: 'First'}],
      defaultValue: {'123': false},
    };

    const result = isEmpty(component, valueToTest, getRegistryEntry);
    expect(result).toBe(expected);
  }
);
