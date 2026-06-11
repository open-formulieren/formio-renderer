import type {Meta, StoryObj} from '@storybook/react-vite';

import FAQTooltip from './FAQTooltip';

export default {
  title: 'Internal API / Forms / FAQTooltip',
  component: FAQTooltip,
  args: {
    faqItem: {
      title: 'Title text',
      content: 'HTML content inside the <strong>tooltip</strong>',
    },
  },
} satisfies Meta<typeof FAQTooltip>;

type Story = StoryObj<typeof FAQTooltip>;

export const Default: Story = {};
