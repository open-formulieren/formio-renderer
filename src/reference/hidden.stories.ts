import {expect, within} from '@storybook/test';

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
