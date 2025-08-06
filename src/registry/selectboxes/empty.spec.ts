import type {SelectboxesComponentSchema} from '@open-formulieren/types';
import {expect, test} from 'vitest';

import isEmpty from './empty';

test.each([
  // option is unchecked
  [{'123': false}, true],
  // option is checked
  [{'123': true}, false],
  // no options
  [{}, true],
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

    const result = isEmpty(component, valueToTest);
    expect(result).toBe(expected);
  }
);
