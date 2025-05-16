import {expect, userEvent, waitFor, within} from '@storybook/test';

import {ReferenceMeta, storyFactory} from './utils';

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
          // @ts-expect-error
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
