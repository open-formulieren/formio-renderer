import type {TextFieldComponentSchema} from '@open-formulieren/types';
import {expect, test} from 'vitest';

import {getRegistryEntry} from '@/registry';
import type {JSONObject} from '@/types';

import {processVisibility} from './visibility';

test('processVisibility filters out hidden components and clears values', () => {
  const components: TextFieldComponentSchema[] = [
    {
      id: 'text',
      type: 'textfield',
      key: 'text',
      label: 'Text',
      clearOnHide: true,
      conditional: {
        show: false,
        when: 'deep.value',
        eq: 'hide',
      },
    },
  ];
  const values: JSONObject = {deep: {value: 'hide'}, text: 'value to clear'};

  const {visibleComponents, updatedValues} = processVisibility(components, values, {
    parentHidden: false,
    initialValues: {text: ''},
    getRegistryEntry,
    componentsMap: {},
  });

  expect(visibleComponents).toEqual([]);
  expect(updatedValues).toEqual({deep: {value: 'hide'}});
});

// for edit grids, access to the root values/scope is needed but *also* to the local
// (nested) item scopes, which are namespaced using their parent edit grid keys.
test('processVisibility uses provided evaluation scope', () => {
  const itemComponents: TextFieldComponentSchema[] = [
    {
      id: 'text1',
      type: 'textfield',
      key: 'text1',
      label: 'Text 1',
    },
    {
      id: 'text2',
      type: 'textfield',
      key: 'text2',
      label: 'Text 2',
      clearOnHide: true,
      conditional: {
        show: false,
        when: 'item.text1', // refers to its sibling
        eq: 'keep me',
      },
    },
  ];
  const itemValues: JSONObject = {text1: 'keep me', text2: 'clear me'};
  const getEvaluationScope = (values: JSONObject): JSONObject => {
    return {item: values};
  };

  const {visibleComponents, updatedValues} = processVisibility(itemComponents, itemValues, {
    parentHidden: false,
    initialValues: {text1: '', text2: ''},
    getRegistryEntry,
    getEvaluationScope,
    componentsMap: {},
  });

  expect(visibleComponents).toHaveLength(1);
  // we require the identity to be the same if no modifications are made
  expect(visibleComponents[0]).toBe(itemComponents[0]);
  expect(updatedValues).toEqual({text1: 'keep me'});
});

test('processVisibility handles duplicate keys in different scopes', () => {
  const itemComponents: TextFieldComponentSchema[] = [
    {
      id: 'text1',
      type: 'textfield',
      key: 'text1',
      label: 'Text 1',
      conditional: {
        show: false,
        when: 'text1', // refers to root scope
        eq: 'clear',
      },
    },
  ];
  const itemValues: JSONObject = {text1: 'clear me'};
  const getEvaluationScope = (values: JSONObject): JSONObject => {
    return {text1: 'clear', item: values};
  };

  const {visibleComponents, updatedValues} = processVisibility(itemComponents, itemValues, {
    parentHidden: false,
    initialValues: {text1: ''},
    getRegistryEntry,
    getEvaluationScope,
    componentsMap: {},
  });

  expect(visibleComponents).toEqual([]);
  expect(updatedValues).toEqual({});
});

// scoped item values may not be available in their outer context
test('processVisibility does not pollute the evaluation scope', () => {
  const itemComponents: TextFieldComponentSchema[] = [
    {
      id: 'text1',
      type: 'textfield',
      key: 'text1',
      label: 'Text 1',
    },
    {
      id: 'text2',
      type: 'textfield',
      key: 'text2',
      label: 'Text 1',
      conditional: {
        show: false,
        when: 'text1', // refers to root scope, which we leave *empty* on purpose
        eq: 'keep',
      },
    },
  ];
  const itemValues: JSONObject = {text1: 'keep', text2: 'keep'};
  const getEvaluationScope = (values: JSONObject): JSONObject => {
    return {item: values}; // deliberately omitting text1 here
  };

  const {visibleComponents, updatedValues} = processVisibility(itemComponents, itemValues, {
    parentHidden: false,
    initialValues: {text1: '', text2: ''},
    getRegistryEntry,
    getEvaluationScope,
    componentsMap: {},
  });

  expect(visibleComponents).toEqual(itemComponents);
  expect(updatedValues).toEqual({text1: 'keep', text2: 'keep'});
});
