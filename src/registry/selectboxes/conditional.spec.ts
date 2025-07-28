import type {SelectboxesComponentSchema} from '@open-formulieren/types';
import {expect, test} from 'vitest';

import testConditional from './conditional';

test.each([
  // option is unchecked
  ['123', {'123': false}, false],
  // option is checked
  ['123', {'123': true}, true],
  // invalid option referenced
  ['missing', {'123': true}, false],
  // unknown value referenced in selectboxes value - we're being lenient here
  ['a', {a: true}, true],
  ['a', {a: false}, false],
])(
  'Selectboxes testConditional compares against checked/unchecked state of value',
  (compareValue: string, valueToTest: Record<string, boolean>, expected: boolean) => {
    const component: SelectboxesComponentSchema = {
      type: 'selectboxes',
      key: 'selectboxes',
      id: 'selectboxes',
      label: 'Selectboxes',
      openForms: {translations: {}, dataSrc: 'manual'},
      values: [{value: '123', label: 'First'}],
      defaultValue: {'123': false},
    };

    const result = testConditional(component, compareValue, valueToTest);

    expect(result).toBe(expected);
  }
);
