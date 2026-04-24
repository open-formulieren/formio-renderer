import type {FileComponentSchema, JSONValue} from '@open-formulieren/types';
import type {FileUploadData} from '@open-formulieren/types/dist/components/file';
import {expect, test} from 'vitest';

import testConditional from './conditional';
import {buildFile} from './test-utils';

test.each([
  // file components are weird and the formio-builder currently emits strings as
  // comparison value
  ['', [] satisfies FileUploadData[], true],
  [
    '',
    [
      buildFile({name: 'foo.png', size: 123, type: 'image/png', state: undefined}),
    ] satisfies FileUploadData[],
    false,
  ],
  ['garbage data', [] satisfies FileUploadData[], false],
  [
    'garbage data',
    [
      buildFile({name: 'foo.png', size: 123, type: 'image/png', state: undefined}),
    ] satisfies FileUploadData[],
    false,
  ],
])(
  'File testConditional compares against empty array',
  (compareValue: string, valueToTest: FileUploadData[], expected: boolean) => {
    const component: FileComponentSchema = {
      type: 'file',
      key: 'file',
      id: 'file',
      label: 'File',
      file: {
        name: '',
        type: ['*'],
        allowedTypesLabels: ['anything'],
      },
      filePattern: '*',
    };

    const result = testConditional(component, compareValue, valueToTest as unknown as JSONValue[]);

    expect(result).toBe(expected);
  }
);
