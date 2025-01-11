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
