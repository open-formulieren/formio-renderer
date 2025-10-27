import type {Meta, StoryObj} from '@storybook/react-vite';

import Fieldset from './Fieldset';
import Tooltip from './Tooltip';

export default {
  title: 'Internal API / Forms / Fieldset',
  component: Fieldset,
  args: {
    children: 'Children passed to the fieldset',
  },
} satisfies Meta<typeof Fieldset>;

type Story = StoryObj<typeof Fieldset>;

export const Default: Story = {
  args: {
    header: 'Fieldset header',
  },
};

export const NoHeader: Story = {
  args: {
    header: undefined,
  },
};

export const WithTooltip: Story = {
  args: {
    hasTooltip: true,
    header: (
      <>
        Header with <Tooltip>tooltip</Tooltip>
      </>
    ),
  },
};
