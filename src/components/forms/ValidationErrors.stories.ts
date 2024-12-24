import {Meta, StoryObj} from '@storybook/react';

import ValidationErrors from './ValidationErrors';

export default {
  title: 'Internal API / Forms / ValidationErrors',
  component: ValidationErrors,
  args: {
    id: 'error-id',
    error: 'Sample error',
  },
} satisfies Meta<typeof ValidationErrors>;

type Story = StoryObj<typeof ValidationErrors>;

export const Default: Story = {};
