import type {TextFieldComponentSchema} from '@open-formulieren/types';
import {setIn} from 'formik';
import {expect, test} from 'vitest';

import {getRegistryEntry} from '@/registry';
import type {JSONObject} from '@/types';

import type {Errors} from './visibility';
import {processVisibility} from './visibility';

test('processVisibility filters out hidden components, clears values and clears errors', () => {
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
  const errors: Errors = {
    deep: {value: 'error to keep'},
    text: 'error to clear',
  };

  const {visibleComponents, updatedValues, updatedErrors} = processVisibility(
    components,
    values,
    errors,
    {
      parentHidden: false,
      initialValues: {text: ''},
      getRegistryEntry,
      componentsMap: {},
    }
  );

  expect(visibleComponents).toEqual([]);
  expect(updatedValues).toEqual({deep: {value: 'hide'}});
  expect(updatedErrors).toEqual({deep: {value: 'error to keep'}});
});

test('processVisibility crawls up when clearing nested errors', () => {
  // with nested objects for values (and errors), empty objects need to be cleared as
  // otherwise formik still considers the form invalid due to having validation errors
  const components: TextFieldComponentSchema[] = [
    {
      id: 'text1',
      type: 'textfield',
      key: 'parent.child.text1',
      label: 'Text 1',
      hidden: true,
    },
    {
      id: 'text2',
      type: 'textfield',
      key: 'parent.child.text2',
      label: 'Text 2',
      hidden: true,
    },
    {
      id: 'text3',
      type: 'textfield',
      key: 'toplevel.child1',
      label: 'Text 3',
      hidden: true,
    },
    {
      id: 'text4',
      type: 'textfield',
      key: 'toplevel.child2',
      label: 'Text 4',
      hidden: false,
    },
  ];
  const values: JSONObject = {
    parent: {child: {text1: '', text2: ''}},
    toplevel: {child1: '', child2: ''},
  };
  const errors: Errors = {
    parent: {child: {text1: 'error to clear', text2: 'error to clear'}},
    toplevel: {child1: 'error to clear', child2: 'error to keep'},
  };

  const {updatedErrors} = processVisibility(components, values, errors, {
    parentHidden: false,
    initialValues: {
      parent: {child: {text1: '', text2: ''}},
      toplevel: {child1: '', child2: ''},
    },
    getRegistryEntry,
    componentsMap: {},
  });

  expect(updatedErrors).toEqual({toplevel: {child2: 'error to keep'}});
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
  const itemErrors: Errors = {text1: 'keep error', text2: 'clear error'};
  const getEvaluationScope = (values: JSONObject): JSONObject => {
    return {item: values};
  };

  const {visibleComponents, updatedValues, updatedErrors} = processVisibility(
    itemComponents,
    itemValues,
    itemErrors,
    {
      parentHidden: false,
      initialValues: {text1: '', text2: ''},
      getRegistryEntry,
      getEvaluationScope,
      componentsMap: {},
    }
  );

  expect(visibleComponents).toHaveLength(1);
  // we require the identity to be the same if no modifications are made
  expect(visibleComponents[0]).toBe(itemComponents[0]);
  expect(updatedValues).toEqual({text1: 'keep me'});
  expect(updatedErrors).toEqual({text1: 'keep error'});
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
  const itemErrors: Errors = {text1: 'clear error'};
  const getEvaluationScope = (values: JSONObject): JSONObject => {
    return {text1: 'clear', item: values};
  };

  const {visibleComponents, updatedValues, updatedErrors} = processVisibility(
    itemComponents,
    itemValues,
    itemErrors,
    {
      parentHidden: false,
      initialValues: {text1: ''},
      getRegistryEntry,
      getEvaluationScope,
      componentsMap: {},
    }
  );

  expect(visibleComponents).toEqual([]);
  expect(updatedValues).toEqual({});
  expect(updatedErrors).toEqual({});
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
  const itemErrors: Errors = {text1: 'keep error', text2: 'keep error'};
  const getEvaluationScope = (values: JSONObject): JSONObject => {
    return {item: values}; // deliberately omitting text1 here
  };

  const {visibleComponents, updatedValues, updatedErrors} = processVisibility(
    itemComponents,
    itemValues,
    itemErrors,
    {
      parentHidden: false,
      initialValues: {text1: '', text2: ''},
      getRegistryEntry,
      getEvaluationScope,
      componentsMap: {},
    }
  );

  expect(visibleComponents).toEqual(itemComponents);
  expect(updatedValues).toEqual({text1: 'keep', text2: 'keep'});
  expect(updatedErrors).toEqual({text1: 'keep error', text2: 'keep error'});
});

test('record dataUpdates in accumulator', () => {
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
  const values: JSONObject = {deep: {value: 'show'}};
  const dataUpdatesAccumulator: JSONObject = {};

  processVisibility(
    components,
    values,
    {},
    {
      parentHidden: false,
      initialValues: {text: ''},
      getRegistryEntry,
      componentsMap: {},
      dataUpdatesAccumulator,
    }
  );

  expect(dataUpdatesAccumulator).toEqual({text: ''});
});

test('processVisibility takes optional clearValueCallback', () => {
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
  const values: JSONObject = {deep: {value: 'hide'}};
  const valuesCleared: string[] = [];

  processVisibility(
    components,
    values,
    {},
    {
      parentHidden: false,
      initialValues: {text: ''},
      getRegistryEntry,
      componentsMap: {},
      clearValueCallback: (values, key) => {
        valuesCleared.push(key);
        return setIn(values, key, undefined);
      },
    }
  );

  expect(valuesCleared).toEqual(['text']);
});
