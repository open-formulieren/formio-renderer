import type {ChildrenComponentSchema} from '@open-formulieren/types';
import {expect, test} from 'vitest';

import {getRegistryEntry} from '@/registry';

import getInitialValues from './initialValues';

test('initialValues with prefilled children should return the prefilled children', () => {
  const component: ChildrenComponentSchema = {
    type: 'children',
    id: 'children',
    key: 'children',
    label: 'Children',
    enableSelection: false,
    defaultValue: [
      {
        bsn: '111222333',
        firstNames: 'johny',
        dateOfBirth: '2000-10-10',
      },
    ],
  };

  const initialValues = getInitialValues(component, getRegistryEntry);
  expect(initialValues).toEqual({
    children: [
      {
        bsn: '111222333',
        firstNames: 'johny',
        dateOfBirth: '2000-10-10',
      },
    ],
  });
});

test('initialValues with prefilled children and selection enabled should set `selected` to `false`', () => {
  const component: ChildrenComponentSchema = {
    type: 'children',
    id: 'children',
    key: 'children',
    label: 'Children',
    enableSelection: true,
    defaultValue: [
      {
        bsn: '111222333',
        firstNames: 'johny',
        dateOfBirth: '2000-10-10',
      },
    ],
  };

  const initialValues = getInitialValues(component, getRegistryEntry);
  expect(initialValues).toEqual({
    children: [
      {
        bsn: '111222333',
        firstNames: 'johny',
        dateOfBirth: '2000-10-10',
        selected: false,
      },
    ],
  });
});
