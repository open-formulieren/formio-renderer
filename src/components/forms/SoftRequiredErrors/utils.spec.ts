import {expect, test} from 'vitest';
import {resolveEditgridChildrenPath, EDITGRID_CHILDREN_COMPONENT_PATH_WILDCARD} from './utils';
import type {SoftRequiredComponent} from './utils';

test('Resolve non-nested components', () => {});
test('Resolve components nested in fieldset', () => {
  const components: SoftRequiredComponent[] = [
    {
      pathToComponent: "textfield",
      label: "Textfield",
    },
    {
      pathToComponent: "fieldset[0].textfield",
      label: "Nested textfield",
    },
  ];
  const formValues = {
    textfield: "simple text value",
    fieldset: [
      {
        textfield: "simple text value",
      }
    ]
  }

  const resolvedComponents = resolveEditgridChildrenPath(components, formValues);
  // The `resolvedComponents` should not be different that the input.
  expect(resolvedComponents).toBe(components);
});
test('Resolve components nested in editgrid', () => {
  const components: SoftRequiredComponent[] = [
    {
      pathToComponent: "textfield",
      label: "Textfield",
    },
    {
      pathToComponent: `editgrid${EDITGRID_CHILDREN_COMPONENT_PATH_WILDCARD}.textfield`,
      label: "Nested textfield",
    },
  ];
  const formValues = {
    textfield: "simple text value",
    editgrid: [
      {
        textfield: "nested text value"
      },
      {
        textfield: "nested text value"
      }
    ],
  }

  const resolvedComponents = resolveEditgridChildrenPath(components, formValues);
});
test('Resolve components nested in multi-level editgrid', () => {});
test('Resolve components nested in columns', () => {});
