import type {SignatureComponentSchema} from '@open-formulieren/types';
import {expect, test} from 'vitest';

import isEmpty from './empty';

test.each([
  // Empty states
  [undefined, true],
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

  const result = isEmpty(component, valueToTest);
  expect(result).toBe(expected);
});
