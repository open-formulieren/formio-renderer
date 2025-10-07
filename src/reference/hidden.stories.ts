import type {
  CheckboxComponentSchema,
  ContentComponentSchema,
  NumberComponentSchema,
  SelectboxesComponentSchema,
  TextFieldComponentSchema,
} from '@open-formulieren/types';
import {expect, userEvent, waitFor, within} from 'storybook/test';

import type {ReferenceMeta} from './utils';
import {storyFactory} from './utils';

/**
 * Stories to guard the 'hidden' feature behaviour against the Formio.js reference.
 *
 * These stories exist to ensure that our Renderer behaves the same as the original
 * SDK _for the feature set we support_.
 */
export default {
  title: 'Internal API / Reference behaviour / Hidden',
} satisfies ReferenceMeta;

const {custom: Hidden, reference: HiddenReference} = storyFactory({
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
        type: 'textfield',
        id: 'textfieldHidden',
        key: 'textfieldHidden',
        label: 'Textfield hidden',
        hidden: true,
      },
    ],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const visibleField = await canvas.findByLabelText('Textfield visible');
    expect(visibleField).toBeVisible();

    const hiddenField = canvas.queryByLabelText('Textfield hidden');
    expect(hiddenField).not.toBeInTheDocument();
  },
});

export {Hidden, HiddenReference};

const {custom: ConditionallyHidden, reference: ConditionallyHiddenReference} = storyFactory({
  args: {
    components: [
      {
        type: 'textfield',
        id: 'textfieldTrigger',
        key: 'textfieldTrigger',
        label: 'Trigger',
      },
      {
        type: 'textfield',
        id: 'textfieldHide',
        key: 'textfieldHide',
        label: 'Dynamically hidden',
        conditional: {
          when: 'textfieldTrigger',
          eq: 'hide other field',
          show: false,
        },
      },
    ],
  },

  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const triggerField = await canvas.findByLabelText('Trigger');
    const followerField = await canvas.findByLabelText('Dynamically hidden');
    expect(followerField).toBeVisible();

    await userEvent.type(triggerField, 'hide other field');
    expect(triggerField).toHaveDisplayValue('hide other field');

    await waitFor(() => {
      expect(canvas.queryByLabelText('Dynamically hidden')).not.toBeInTheDocument();
      expect(canvas.queryAllByRole('textbox')).toHaveLength(1);
    });
  },
});

export {ConditionallyHidden, ConditionallyHiddenReference};

const {
  custom: ConditionallyHiddenWithOddComponents,
  reference: ConditionallyHiddenWithOddComponentsReference,
} = storyFactory({
  args: {
    components: [
      // selectboxes has an odd data shape
      {
        type: 'selectboxes',
        id: 'selectboxes',
        key: 'selectboxes',
        label: 'Select boxes',
        openForms: {translations: {}, dataSrc: 'manual'},
        values: [
          {value: 'a', label: 'A'},
          {value: 'b', label: 'B'},
        ],
        defaultValue: {a: false, b: false},
      } satisfies SelectboxesComponentSchema,
      {
        type: 'content',
        id: 'content1',
        key: 'content1',
        html: '<p>B is unchecked</p>',
        conditional: {
          show: false,
          when: 'selectboxes',
          eq: 'b',
        },
      } satisfies ContentComponentSchema,
      // a component with multiple has an array type value instead of its intrinsic type
      {
        type: 'textfield',
        key: 'textMultiple',
        id: 'textMultiple',
        label: 'Textfield multiple',
        multiple: true,
      } satisfies TextFieldComponentSchema,
      {
        type: 'content',
        id: 'content2',
        key: 'content2',
        html: `<p>'item 1' not in textfield values</p>`,
        conditional: {
          show: false,
          when: 'textMultiple',
          eq: 'item 1',
        },
      } satisfies ContentComponentSchema,
      // checkbox, which uses booleans
      {
        type: 'checkbox',
        key: 'checkbox',
        id: 'checkbox',
        label: 'Check to hide content',
        defaultValue: false,
      } satisfies CheckboxComponentSchema,
      {
        type: 'content',
        id: 'content3',
        key: 'content3',
        html: `<p>Checkbox unchecked</p>`,
        conditional: {
          show: false,
          when: 'checkbox',
          eq: true,
        },
      } satisfies ContentComponentSchema,
      {
        type: 'number',
        key: 'number',
        id: 'number',
        label: 'Number',
      } satisfies NumberComponentSchema,
      {
        type: 'content',
        id: 'content4',
        key: 'content4',
        html: `<p>Number not equal to 10</p>`,
        conditional: {
          show: false,
          when: 'number',
          eq: 10,
        },
      } satisfies ContentComponentSchema,
    ],
    submissionData: {
      selectboxes: {a: false, b: true},
      textMultiple: ['item 1', 'item 2'],
      checkbox: true,
      number: 10,
    },
  },

  play: async ({canvasElement, step}) => {
    const canvas = within(canvasElement);

    await step('selectboxes', async () => {
      const bCheckbox = await canvas.findByLabelText('B');
      expect(bCheckbox).toBeChecked();
      expect(canvas.queryByText('B is unchecked')).not.toBeInTheDocument();

      // change value and check that the conditional kicks in
      await userEvent.click(bCheckbox);
      expect(bCheckbox).not.toBeChecked();
      expect(await canvas.findByText('B is unchecked')).toBeVisible();
    });

    await step('textfield multiple=true', async () => {
      // Formio has multiple elements with the same ID, so we can't reliably look up
      // the textboxes
      // TODO - implement multiple display in the renderer :-) it now looks silly in our
      // own components
      expect(canvas.queryByText(`'item 1' not in textfield values`)).not.toBeInTheDocument();
    });

    await step('checkbox', async () => {
      const checkbox = await canvas.findByLabelText('Check to hide content');
      expect(checkbox).toBeChecked();
      expect(canvas.queryByText('Checkbox unchecked')).not.toBeInTheDocument();

      // change value and check that the conditional kicks in
      await userEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();
      expect(await canvas.findByText('Checkbox unchecked')).toBeVisible();
    });

    await step('number', async () => {
      const number = await canvas.findByLabelText('Number');
      expect(number).toHaveDisplayValue('10');

      // change value and check that the conditional kicks in
      await userEvent.click(number);
      await userEvent.type(number, '0');
      expect(number).toHaveDisplayValue('100');
      expect(await canvas.findByText('Number not equal to 10')).toBeVisible();
    });
  },
});

export {ConditionallyHiddenWithOddComponents, ConditionallyHiddenWithOddComponentsReference};

const {custom: NestedHidden, reference: NestedHiddenReference} = storyFactory({
  args: {
    components: [
      {
        type: 'fieldset',
        id: 'fieldset',
        key: 'fieldset',
        label: 'Layout container',
        hideHeader: false,
        components: [
          {
            type: 'textfield',
            id: 'hiddenTextfield',
            key: 'hiddenTextfield',
            label: 'Hidden textfield',
            hidden: true,
          },
        ],
      },
      {
        type: 'columns',
        id: 'columns',
        key: 'columns',
        columns: [
          {
            size: 12,
            sizeMobile: 4,
            components: [
              {
                type: 'textfield',
                id: 'hiddenTextFieldInColumns',
                key: 'hiddenTextFieldInColumns',
                label: 'Hidden textfield in columns',
                hidden: true,
              },
            ],
          },
        ],
      },
    ],
  },

  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    expect(canvas.queryByLabelText('Hidden textfield')).not.toBeInTheDocument();
    expect(canvas.queryByLabelText('Hidden textfield in columns')).not.toBeInTheDocument();
  },
});

export {NestedHidden, NestedHiddenReference};

const {custom: ConditionallyNestedVisible, reference: ConditionallyNestedVisibleReference} =
  storyFactory({
    args: {
      components: [
        {
          type: 'fieldset',
          id: 'fieldset',
          key: 'fieldset',
          label: 'Layout container',
          hideHeader: false,
          components: [
            {
              type: 'textfield',
              id: 'textfieldTrigger',
              key: 'textfieldTrigger',
              label: 'Trigger',
            },
            {
              type: 'textfield',
              id: 'textfieldHide',
              key: 'textfieldHide',
              label: 'Dynamically visible',
              conditional: {
                when: 'textfieldTrigger',
                eq: 'show other field',
                show: true,
              },
            },
          ],
        },
      ],
    },

    play: async ({canvasElement}) => {
      const canvas = within(canvasElement);

      const triggerField = await canvas.findByLabelText('Trigger');
      expect(canvas.queryByLabelText('Dynamically visible')).not.toBeInTheDocument();

      await userEvent.type(triggerField, 'show other field');
      expect(triggerField).toHaveDisplayValue('show other field');

      const followerField = await canvas.findByLabelText('Dynamically visible');
      expect(followerField).toBeVisible();
    },
  });

export {ConditionallyNestedVisible, ConditionallyNestedVisibleReference};

const {custom: ConditionallyVisibleInEditGrid, reference: ConditionallyVisibleInEditGridReference} =
  storyFactory({
    args: {
      components: [
        {
          type: 'textfield',
          id: 'externalTrigger',
          key: 'externalTrigger',
          label: 'Trigger outside editgrid',
        },
        {
          type: 'editgrid',
          id: 'editgrid',
          key: 'editgrid',
          label: 'Edit grid',
          disableAddingRemovingRows: false,
          groupLabel: 'Item',
          hideLabel: false,
          // @ts-expect-error option not defined in our TS types, but required for Formio.js
          inlineEdit: false,
          components: [
            {
              type: 'textfield',
              id: 'nestedTrigger',
              key: 'nestedTrigger',
              label: 'Trigger inside editgrid',
            },
            {
              type: 'textfield',
              id: 'follower1',
              key: 'follower1',
              label: 'Follower 1',
              conditional: {
                when: 'externalTrigger',
                eq: 'show follower 1',
                show: true,
              },
            },
            {
              type: 'textfield',
              id: 'follower2',
              key: 'follower2',
              label: 'Follower 2',
              conditional: {
                when: 'editgrid.nestedTrigger',
                eq: 'show follower 2',
                show: true,
              },
            },
          ],
          defaultValue: [],
        },
      ],
    },
    play: async ({canvasElement, step}) => {
      const canvas = within(canvasElement);

      const externalTriggerField = await canvas.findByLabelText('Trigger outside editgrid');
      expect(externalTriggerField).toBeVisible();

      // Add two items to the edit grid, but don't edit them yet. Note: the lookup needs
      // to be done multiple times because Formio re-renders the element in the DOM...
      await userEvent.click(await canvas.findByRole('button', {name: /Add/}));
      await userEvent.click(await canvas.findByRole('button', {name: /Add/}));
      expect(canvas.queryByLabelText('Follower 1')).not.toBeInTheDocument();
      expect(canvas.queryByLabelText('Follower 2')).not.toBeInTheDocument();

      await step('Visibility trigger because of external trigger', async () => {
        await userEvent.type(externalTriggerField, 'show follower 1');

        // Formio renders the same ID for multiple elements in repeating groups. :)
        // So we can't do getAllByLabelText
        await waitFor(() => {
          const follower1Fields = canvas.getAllByText('Follower 1');
          expect(follower1Fields).toHaveLength(2);
        });
      });

      // here the logic/conditional is applied to the scope of a single item in the
      // repeating group, while the external trigger affects *all* items
      await step('Visibility trigger with nested trigger', async () => {
        const firstNestedTrigger = canvas.getAllByLabelText('Trigger inside editgrid')[0];
        await userEvent.type(firstNestedTrigger, 'show follower 2');

        // Formio renders the same ID for multiple elements in repeating groups. :)
        // So we can't do getAllByLabelText
        await waitFor(() => {
          const follower1Fields = canvas.getAllByText('Follower 1');
          expect(follower1Fields).toHaveLength(2);

          const follower2Fields = canvas.getAllByText('Follower 2');
          expect(follower2Fields).toHaveLength(1);
        });
      });
    },
  });

export {ConditionallyVisibleInEditGrid, ConditionallyVisibleInEditGridReference};
