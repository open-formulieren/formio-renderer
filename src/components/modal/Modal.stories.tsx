import type {Meta, StoryObj} from '@storybook/react-vite';
import {fn} from 'storybook/test';

import Modal from './Modal';

export default {
  title: 'Internal API  / Modal',
  component: Modal,
  args: {
    isOpen: true,
    closeModal: fn(),
    title: 'Modal title',
    children: <span>Simple modal content</span>,
  },
} satisfies Meta<typeof Modal>;

type Story = StoryObj<typeof Modal>;

export const Default: Story = {};

export const WithoutTitle: Story = {
  args: {
    title: undefined,
  },
};
