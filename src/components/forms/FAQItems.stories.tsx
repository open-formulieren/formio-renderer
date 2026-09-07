import type {Meta, StoryObj} from '@storybook/react-vite';

import FAQItems from './FAQItems';

export default {
  title: 'Internal API / Forms / FAQ items',
  component: FAQItems,
  args: {
    items: [
      {
        id: '0',
        label: 'Title text',
        content: 'HTML content inside the <strong>tooltip</strong>',
        openForms: {
          translations: {
            en: {
              label: 'Title text',
              content: 'HTML content inside the <strong>tooltip</strong>',
            },
          },
        },
      },
      {
        id: '1',
        label: 'Other title text',
        content: 'HTML content inside the <strong>tooltip</strong>',
        openForms: {
          translations: {
            en: {
              label: 'Other title text',
              content: 'HTML content inside the <strong>tooltip</strong>',
            },
          },
        },
      },
    ],
  },
} satisfies Meta<typeof FAQItems>;

type Story = StoryObj<typeof FAQItems>;

export const Default: Story = {};
