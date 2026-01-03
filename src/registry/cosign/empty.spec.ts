import type {CosignV2ComponentSchema} from '@open-formulieren/types';
import {expect, test} from 'vitest';

import {getRegistryEntry} from '@/registry';

import isEmpty from './empty';

test.each([
  // Empty states
  [undefined, true],
  [null, true],
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
    };

    const result = isEmpty(component, valueToTest, getRegistryEntry);
    expect(result).toBe(expected);
  }
);
