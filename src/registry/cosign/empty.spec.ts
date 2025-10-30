import type {CosignV2ComponentSchema} from '@open-formulieren/types';
import {expect, test} from 'vitest';

import isEmpty from './empty';

test.each([
  // Empty states
  [undefined, true],
  ['', true],
  // Non-empty state
  ['asdf@example.com', false],
])(
  'Cosign value %s, expected empty state %s',
  (valueToTest: string | undefined, expected: boolean) => {
    const component: CosignV2ComponentSchema = {
      type: 'cosign',
      key: 'cosign',
      id: 'cosign',
      label: 'Cosign',
      validateOn: 'blur',
    };

    const result = isEmpty(component, valueToTest);
    expect(result).toBe(expected);
  }
);
