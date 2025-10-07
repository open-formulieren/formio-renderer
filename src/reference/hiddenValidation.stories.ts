import type {EditGridComponentSchema, TextFieldComponentSchema} from '@open-formulieren/types';
import {expect, fn, userEvent, within} from 'storybook/test';

import type {ReferenceMeta} from './utils';
import {hideSpinner, storyFactory} from './utils';

/**
 * Stories to guard the 'clear on hide' feature behaviour against the Formio.js
 * reference.
 *
 * These stories exist to ensure that our Renderer behaves the same as the original
 * SDK _for the feature set we support_.
 */
export default {
  title: 'Internal API / Reference behaviour / Validation hidden components',
  decorators: [hideSpinner],
} satisfies ReferenceMeta;

// Ensure that a hidden component doesn't block validation
const {custom: NoValidateHidden, reference: NoValidateHiddenReference} = storyFactory({
  args: {
    components: [
      {
        type: 'textfield',
        id: 'textfieldVisible',
        key: 'textfieldVisible',
        label: 'Textfield visible',
        hidden: false,
        clearOnHide: true,
      } satisfies TextFieldComponentSchema,
      {
        type: 'textfield',
        id: 'textfieldHidden',
        key: 'textfieldHidden',
        label: 'Textfield hidden',
        hidden: true,
        clearOnHide: true,
        // does not pass validation out of the box because the value is cleared
        validate: {
          required: true,
        },
      } satisfies TextFieldComponentSchema,
    ],
    submissionData: {
      textfieldVisible: 'keep me',
    },
    onSubmit: fn(),
  },
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);

    const visibleField = await canvas.findByLabelText('Textfield visible');
    expect(visibleField).toBeVisible();
    expect(canvas.queryByText('Textfield hidden')).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));

    // we expect validation not to block
    expect(args.onSubmit).toHaveBeenCalledOnce();
  },
});

export {NoValidateHidden, NoValidateHiddenReference};

const {
  custom: NoValidateHiddenWithoutValueClearing,
  reference: NoValidateHiddenWithoutValueClearingReference,
} = storyFactory({
  args: {
    components: [
      {
        type: 'textfield',
        id: 'textfieldVisible',
        key: 'textfieldVisible',
        label: 'Textfield visible',
        hidden: false,
        clearOnHide: true,
      } satisfies TextFieldComponentSchema,
      {
        type: 'textfield',
        id: 'textfieldHidden',
        key: 'textfieldHidden',
        label: 'Textfield hidden',
        conditional: {
          show: false,
          when: 'textfieldVisible',
          eq: 'hide',
        },
        clearOnHide: false,
        // does not pass validation - the value does not match the pattern, BUT formio
        // does let the value through so our implementation does too.
        // We can discuss this if we have strong feelings about what's the best
        // behaviour, though note that changing this may also seriously impact the
        // backend.
        validate: {
          pattern: '[0-9]+',
        },
      } satisfies TextFieldComponentSchema,
    ],
    submissionData: {
      textfieldVisible: 'hide',
      textfieldHidden: 'keep me',
    },
    onSubmit: fn(),
  },
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);

    const visibleField = await canvas.findByLabelText('Textfield visible');
    expect(visibleField).toBeVisible();
    expect(canvas.queryByText('Textfield hidden')).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));

    // we expect validation not to block
    expect(args.onSubmit).toHaveBeenCalledOnce();
  },
});

export {NoValidateHiddenWithoutValueClearing, NoValidateHiddenWithoutValueClearingReference};

const {custom: NestedEditGrids, reference: NestedEditGridsReference} = storyFactory({
  args: {
    components: [
      {
        type: 'editgrid',
        id: 'outer',
        key: 'outer',
        label: 'Outer',
        groupLabel: 'Outer item',
        disableAddingRemovingRows: true, // less buttons to query
        components: [
          {
            type: 'editgrid',
            id: 'inner',
            key: 'inner',
            label: 'Inner',
            groupLabel: 'Inner item',
            disableAddingRemovingRows: true, // less buttons to query
            components: [
              {
                type: 'textfield',
                id: 'visibleTextfield',
                key: 'visibleTextfield',
                label: 'Visible textfield',
                hidden: false,
                clearOnHide: true,
                validate: {required: true},
              } satisfies TextFieldComponentSchema,
              {
                type: 'textfield',
                id: 'hiddenTextfield',
                key: 'hiddenTextfield',
                label: 'Hidden textfield',
                hidden: true,
                clearOnHide: false,
                validate: {pattern: '[a-z]{4}'}, // 4 letters
              } satisfies TextFieldComponentSchema,
            ],
          } satisfies EditGridComponentSchema,
        ],
      } satisfies EditGridComponentSchema,
    ],
    submissionData: {
      outer: [
        {
          inner: [
            {
              visibleTextfield: 'Has required value',
              hiddenTextfield: '123',
            },
          ],
        },
      ],
    },
    onSubmit: fn(),
  },
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);

    // XXX - the reference Formio edit buttons are not accessible, so we have to
    // access them by their position in the DOM.

    // Open the outer edit grid
    const outerEditButton = (await canvas.findAllByRole<HTMLButtonElement>('button'))[0];
    await userEvent.click(outerEditButton);

    // Open the inner edit grid
    const innerEditButton = (await canvas.findAllByRole<HTMLButtonElement>('button'))[0];
    await userEvent.click(innerEditButton);

    const innerSaveButton = (
      await canvas.findAllByRole<HTMLButtonElement>('button', {name: 'Save'})
    )[0];
    await userEvent.click(innerSaveButton);
    expect(canvas.queryAllByRole<HTMLButtonElement>('button', {name: 'Save'})).toHaveLength(1);

    const outerSaveButton = (
      await canvas.findAllByRole<HTMLButtonElement>('button', {name: 'Save'})
    )[0];
    await userEvent.click(outerSaveButton);
    expect(canvas.queryAllByRole<HTMLButtonElement>('button', {name: 'Save'})).toHaveLength(0);

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    // we expect validation not to block
    expect(args.onSubmit).toHaveBeenCalledOnce();
  },
});

export {NestedEditGrids, NestedEditGridsReference};
