import {expect, fn, userEvent, waitFor, within} from 'storybook/test';

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
  title: 'Internal API / Reference behaviour / Clear On Hide',
  decorators: [hideSpinner],
} satisfies ReferenceMeta;

// Ensure that a hidden component with existing submission data is cleared.
const {custom: ClearExisting, reference: ClearExistingReference} = storyFactory({
  args: {
    components: [
      {
        type: 'textfield',
        id: 'textfieldVisible',
        key: 'textfieldVisible',
        label: 'Textfield visible',
        hidden: false,
        clearOnHide: true,
      },
      {
        type: 'textfield',
        id: 'textfieldHidden',
        key: 'textfieldHidden',
        label: 'Textfield hidden',
        hidden: true,
        clearOnHide: true,
      },
    ],
    submissionData: {
      textfieldVisible: 'keep me',
      textfieldHidden: 'clear me',
    },
    onSubmit: fn(),
  },
  play: async ({canvasElement, args, id}) => {
    const canvas = within(canvasElement);

    const isOwnImplementation =
      id === 'internal-api-reference-behaviour-clear-on-hide--clear-existing';

    const visibleField = await canvas.findByLabelText('Textfield visible');
    expect(visibleField).toBeVisible();
    expect(canvas.queryByText('Textfield hidden')).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));

    // here we diverge from the reference behaviour because the reference does not make
    // much sense
    if (isOwnImplementation) {
      expect(args.onSubmit).toHaveBeenCalledWith({
        textfieldVisible: 'keep me',
      });
    } else {
      // This is already some odd behaviour by Formio :/ It seems to only clear values
      // if the field has been touched?
      expect(args.onSubmit).toHaveBeenCalledWith({
        textfieldVisible: 'keep me',
        textfieldHidden: 'clear me',
      });
    }
  },
});

export {ClearExisting, ClearExistingReference};

// An initially visible component becomes hidden.
const {custom: ClearInitiallyVisible, reference: ClearInitiallyVisibleReference} = storyFactory({
  args: {
    components: [
      {
        type: 'textfield',
        id: 'textfieldVisible',
        key: 'textfieldVisible',
        label: 'Textfield visible',
        defaultValue: 'keep me',
        hidden: false,
      },
      {
        type: 'textfield',
        id: 'textfieldConditionallyHidden',
        key: 'textfieldConditionallyHidden',
        label: 'Textfield to hide',
        defaultValue: 'clear me',
        hidden: false,
        conditional: {
          show: false,
          when: 'textfieldVisible',
          eq: 'hide second',
        },
        clearOnHide: true,
      },
    ],
    onSubmit: fn(),
  },
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);

    const fieldToHide = await canvas.findByLabelText('Textfield to hide');
    expect(fieldToHide).toBeVisible();

    const visibleField = canvas.getByLabelText('Textfield visible');
    await userEvent.clear(visibleField);
    await userEvent.type(visibleField, 'hide second');

    await waitFor(() => {
      expect(canvas.queryByLabelText('Textfield to hide')).not.toBeInTheDocument();
    });

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    // This is already some odd behaviour by Formio :/ It seems to only clear values
    // if the field has been touched?
    expect(args.onSubmit).toHaveBeenCalledWith({
      textfieldVisible: 'hide second',
    });
  },
});

export {ClearInitiallyVisible, ClearInitiallyVisibleReference};

// nested components are cleared when the fieldset parent becomes hidden
const {custom: ParentComponentHidden, reference: ParentComponentHiddenReference} = storyFactory({
  args: {
    components: [
      {
        type: 'textfield',
        id: 'textfieldVisible',
        key: 'textfieldVisible',
        label: 'Textfield visible',
        hidden: false,
      },
      {
        type: 'fieldset',
        id: 'fieldset',
        key: 'fieldset',
        label: 'Fieldset',
        hideHeader: false,
        components: [
          {
            type: 'textfield',
            id: 'nestedTextfield',
            key: 'nestedTextfield',
            label: 'Nested textfield',
            clearOnHide: true,
          },
          {
            type: 'textfield',
            id: 'nestedTextfield2',
            key: 'nestedTextfield2',
            label: 'Second textfield in fieldset',
            clearOnHide: false,
          },
        ],
        conditional: {
          show: false,
          when: 'textfieldVisible',
          eq: 'hide fieldset',
        },
      },
    ],
    submissionData: {
      textfieldVisible: 'keep me',
      nestedTextfield: 'clear me',
      nestedTextfield2: 'keep me',
    },
    onSubmit: fn(),
  },
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);

    const fieldToHide = await canvas.findByLabelText('Nested textfield');
    expect(fieldToHide).toBeVisible();

    const visibleField = canvas.getByLabelText('Textfield visible');
    await userEvent.clear(visibleField);
    await userEvent.type(visibleField, 'hide fieldset', {delay: 50});

    await waitFor(() => {
      expect(canvas.queryByLabelText('Nested textfield')).not.toBeInTheDocument();
    });

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(args.onSubmit).toHaveBeenCalledWith({
      textfieldVisible: 'hide fieldset',
      nestedTextfield2: 'keep me',
    });
  },
});

export {ParentComponentHidden, ParentComponentHiddenReference};

// nested component in layout component becomes hidden & clears value
const {custom: HiddenComponentInLayout, reference: HiddenComponentInLayoutReference} = storyFactory(
  {
    args: {
      components: [
        {
          type: 'textfield',
          id: 'textfieldVisible',
          key: 'textfieldVisible',
          label: 'Textfield visible',
          hidden: false,
        },
        {
          type: 'fieldset',
          id: 'fieldset',
          key: 'fieldset',
          label: 'Fieldset',
          hideHeader: false,
          components: [
            {
              type: 'textfield',
              id: 'nestedTextfield',
              key: 'nestedTextfield',
              label: 'Nested textfield',
              clearOnHide: true,
              conditional: {
                show: false,
                when: 'textfieldVisible',
                eq: 'hide nested',
              },
            },
          ],
        },
      ],
      submissionData: {
        textfieldVisible: 'keep me',
        nestedTextfield: 'clear me',
      },
      onSubmit: fn(),
    },
    play: async ({canvasElement, args}) => {
      const canvas = within(canvasElement);

      const fieldToHide = await canvas.findByLabelText('Nested textfield');
      expect(fieldToHide).toBeVisible();

      const visibleField = canvas.getByLabelText('Textfield visible');
      await userEvent.clear(visibleField);
      await userEvent.type(visibleField, 'hide nested', {delay: 50});

      await waitFor(() => {
        expect(canvas.queryByLabelText('Nested textfield')).not.toBeInTheDocument();
      });

      await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
      expect(args.onSubmit).toHaveBeenCalledWith({
        textfieldVisible: 'hide nested',
      });
    },
  }
);

export {HiddenComponentInLayout, HiddenComponentInLayoutReference};

// the default is to clear components when hidden when clearOnHide is not specified
const {custom: ClearOnHideDefault, reference: ClearOnHideDefaultReference} = storyFactory({
  args: {
    components: [
      {
        type: 'textfield',
        id: 'textfieldVisible',
        key: 'textfieldVisible',
        label: 'Textfield visible',
      },
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
      },
    ],
    submissionData: {
      textfieldVisible: '',
      textfieldHidden: 'clear me',
    },
    onSubmit: fn(),
  },
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);

    const visibleField = await canvas.findByLabelText('Textfield visible');
    expect(visibleField).toBeVisible();

    await userEvent.clear(visibleField);
    await userEvent.type(visibleField, 'hide', {delay: 50});

    await waitFor(() => {
      expect(canvas.queryByLabelText('Textfield hidden')).not.toBeInTheDocument();
    });

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(args.onSubmit).toHaveBeenCalledWith({
      textfieldVisible: 'hide',
    });
  },
});

export {ClearOnHideDefault, ClearOnHideDefaultReference};

// items inside an edit grid are independent from each other and nested
// components clear their value when hidden
const {custom: Editgrid, reference: EditgridReference} = storyFactory({
  args: {
    components: [
      {
        type: 'editgrid',
        id: 'editgrid',
        key: 'editgrid',
        label: 'Edit grid',
        disableAddingRemovingRows: true,
        groupLabel: 'Item',
        components: [
          {
            type: 'textfield',
            id: 'trigger',
            key: 'trigger',
            label: 'Trigger',
          },
          {
            type: 'fieldset',
            id: 'fieldset',
            key: 'fieldset',
            label: 'Fieldset',
            hideHeader: false,
            components: [
              {
                type: 'textfield',
                id: 'follower',
                key: 'follower',
                label: 'Follower',
                clearOnHide: true,
              },
            ],
            conditional: {
              show: false,
              when: 'editgrid.trigger',
              eq: 'hide',
            },
          },
        ],
      },
    ],
    submissionData: {
      editgrid: [
        {
          trigger: 'show',
          follower: 'keep me',
        },
        {
          trigger: 'trigger',
          follower: 'clear me',
        },
      ],
    },
    onSubmit: fn(),
  },
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);

    const buttons = await canvas.findAllByRole('button');
    const secondItemButton = buttons[1];
    await userEvent.click(secondItemButton);

    const triggerTextfield = await canvas.findByLabelText('Trigger');
    await userEvent.clear(triggerTextfield);
    await userEvent.type(triggerTextfield, 'hide', {delay: 100});
    await userEvent.click(await canvas.findByRole('button', {name: 'Save'}));

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(args.onSubmit).toHaveBeenCalledWith({
      editgrid: [{trigger: 'show', follower: 'keep me'}, {trigger: 'hide'}],
    });
  },
});

export {Editgrid, EditgridReference};

// Component dependencies resolve irrespective of where they are in the component tree
const {custom: DependentFields, reference: DependentFieldsReference} = storyFactory({
  args: {
    components: [
      {
        type: 'textfield',
        id: 'field1',
        key: 'field1',
        label: 'Field 1',
        clearOnHide: true,
      },
      {
        type: 'textfield',
        id: 'field2',
        key: 'field2',
        label: 'Field 2',
        clearOnHide: true,
        conditional: {
          show: true,
          when: 'field3',
          eq: 'visible',
        },
      },
      {
        type: 'textfield',
        id: 'field3',
        key: 'field3',
        label: 'Field 3',
        clearOnHide: true,
        conditional: {
          show: false,
          when: 'field1',
          eq: 'hidden',
        },
      },
      {
        type: 'textfield',
        id: 'field4',
        key: 'field4',
        label: 'Field 4',
        clearOnHide: true,
        conditional: {
          show: true,
          when: 'field3',
          eq: 'visible',
        },
      },
      {
        type: 'textfield',
        id: 'field5',
        key: 'field5',
        label: 'Field 5',
        defaultValue: 'default',
        conditional: {
          show: true,
          when: 'field2',
          eq: '',
        },
      },
    ],
    submissionData: {
      field1: '',
      field2: 'visible',
      field3: 'visible',
      field4: 'visible',
      field5: '',
    },
    onSubmit: fn(),
  },
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);

    const field1 = await canvas.findByLabelText('Field 1');
    expect(field1).toBeVisible();
    const field2 = await canvas.findByLabelText('Field 2');
    expect(field2).toBeVisible();
    const field3 = await canvas.findByLabelText('Field 3');
    expect(field3).toBeVisible();
    const field4 = await canvas.findByLabelText('Field 4');
    expect(field4).toBeVisible();
    expect(canvas.queryByText('Field 5')).not.toBeInTheDocument();

    await userEvent.type(field1, 'hidden', {delay: 200});

    const field5 = await canvas.findByLabelText('Field 5', undefined, {timeout: 1000});
    expect(field5).toBeVisible();

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(args.onSubmit).toHaveBeenCalledWith({
      field1: 'hidden',
      field5: '',
    });
  },
});

export {DependentFields, DependentFieldsReference};
