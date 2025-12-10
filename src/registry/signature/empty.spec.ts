import type {SignatureComponentSchema} from '@open-formulieren/types';
import {expect, test} from 'vitest';

import {getRegistryEntry} from '@/registry';

import isEmpty from './empty';

test.each([
  // Empty states
  [undefined, true],
  [null, true],
  ['', true],
  // Non-empty state
  ['data:image/png;base64,someEncodedImage', false],
])('Signature value: %s', (valueToTest: string | undefined, expected: boolean) => {
  const component: SignatureComponentSchema = {
    type: 'signature',
    key: 'signature',
    id: 'signature',
    label: 'Signature',
  };

  const result = isEmpty(component, valueToTest, getRegistryEntry);
  expect(result).toBe(expected);
});
