import type {Meta, StoryObj} from '@storybook/react-vite';

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
