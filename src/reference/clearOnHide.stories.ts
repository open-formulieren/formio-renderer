import {expect, fn, userEvent, waitFor, within} from '@storybook/test';

import {ReferenceMeta, hideSpinner, storyFactory} from './utils';

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
        // defaultValue: 'keep me',
        hidden: false,
        clearOnHide: true,
      },
      {
        type: 'textfield',
        id: 'textfieldHidden',
        key: 'textfieldHidden',
        label: 'Textfield hidden',
        // defaultValue: 'clear me',
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
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);

    const visibleField = await canvas.findByLabelText('Textfield visible');
    expect(visibleField).toBeVisible();

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    // This is already some odd behaviour by Formio :/ It seems to only clear values
    // if the field has been touched?
    expect(args.onSubmit).toHaveBeenCalledWith({
      textfieldVisible: 'keep me',
      textfieldHidden: 'clear me',
    });
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
    await userEvent.type(triggerTextfield, 'hide', {delay: 50});
    await userEvent.click(await canvas.findByRole('button', {name: 'Save'}));

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(args.onSubmit).toHaveBeenCalledWith({
      editgrid: [{trigger: 'show', follower: 'keep me'}, {trigger: 'hide'}],
    });
  },
});

export {Editgrid, EditgridReference};
