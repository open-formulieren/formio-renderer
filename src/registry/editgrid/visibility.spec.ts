import type {EditGridComponentSchema} from '@open-formulieren/types';
import {expect, test} from 'vitest';

import {getRegistryEntry} from '@/registry';
import type {JSONObject} from '@/types';

import applyVisibility from './visibility';

test('Hiding nested component clears its data', () => {
  interface Values extends JSONObject {
    outer: {
      trigger: string;
      inner: {
        textfield: string;
      }[];
    }[];
  }

  const component: EditGridComponentSchema = {
    id: 'outer',
    type: 'editgrid',
    key: 'outer',
    label: 'Outer',
    groupLabel: 'Outer item',
    disableAddingRemovingRows: false,
    components: [
      {
        id: 'trigger',
        type: 'textfield',
        key: 'trigger',
        label: 'Trigger',
      },
      {
        id: 'inner',
        type: 'editgrid',
        key: 'inner',
        label: 'inner',
        groupLabel: 'Inner item',
        disableAddingRemovingRows: false,
        components: [
          {
            id: 'textfield',
            type: 'textfield',
            key: 'textfield',
            label: 'Text field',
            clearOnHide: true,
            conditional: {
              show: false,
              when: 'outer.trigger',
              eq: 'hide',
            },
          },
        ],
      },
    ],
  };

  const values: Values = {
    outer: [
      {
        trigger: 'hide',
        inner: [
          {
            textfield: 'value to clear',
          },
        ],
      },
      {
        trigger: 'show',
        inner: [
          {
            textfield: 'value to keep',
          },
        ],
      },
    ],
  };
  const initialValues: Values = {outer: []};

  const {updatedValues} = applyVisibility(component, values, {
    parentHidden: false,
    initialValues: initialValues,
    getRegistryEntry,
  });

  expect(updatedValues).toEqual({
    outer: [
      {
        trigger: 'hide',
        inner: [{}],
      },
      {
        trigger: 'show',
        inner: [{textfield: 'value to keep'}],
      },
    ],
  });
});

test('Nested components gets default value when it becomes visible', () => {
  interface Values extends JSONObject {
    external: string;
    outer: {
      inner: {
        textfield?: string;
      }[];
    }[];
  }

  const component: EditGridComponentSchema = {
    id: 'outer',
    type: 'editgrid',
    key: 'outer',
    label: 'Outer',
    groupLabel: 'Outer item',
    disableAddingRemovingRows: false,
    components: [
      {
        id: 'inner',
        type: 'editgrid',
        key: 'inner',
        label: 'inner',
        groupLabel: 'Inner item',
        disableAddingRemovingRows: false,
        components: [
          {
            id: 'textfield',
            type: 'textfield',
            key: 'textfield',
            label: 'Text field',
            defaultValue: 'textfield default',
            clearOnHide: true,
            conditional: {
              show: true,
              when: 'external',
              eq: 'show',
            },
          },
        ],
      },
    ],
  };
  const values: Values = {
    external: 'show',
    outer: [{inner: [{}]}],
  };
  const initialValues: Values = {external: 'show', outer: []};

  const {updatedValues} = applyVisibility(component, values, {
    parentHidden: false,
    initialValues: initialValues,
    getRegistryEntry,
  });

  expect(updatedValues).toEqual({
    external: 'show',
    outer: [
      {
        inner: [
          {
            textfield: 'textfield default',
          },
        ],
      },
    ],
  });
});
