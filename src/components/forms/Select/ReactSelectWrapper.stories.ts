import type {Meta, StoryObj} from '@storybook/react-vite';

import ReactSelectWrapper from './ReactSelectWrapper';

interface Option {
  value: string;
  label: string;
}

export default {
  title: 'Internal API / Forms / Select / ReactSelectWrapper',
  component: ReactSelectWrapper,
  args: {
    options: [
      {value: 'option-1', label: 'Option 1'},
      {value: 'option-2', label: 'Option 2'},
    ],
  },
} satisfies Meta<typeof ReactSelectWrapper<Option>>;

type Story = StoryObj<typeof ReactSelectWrapper<Option>>;

export const Single: Story = {
  args: {
    formikValue: 'option-2',
  },
};

export const SingleNoValue: Story = {
  args: {
    formikValue: null,
  },
};

export const MultiValue: Story = {
  args: {
    isMulti: true,
    formikValue: ['option-1', 'option-2'],
  },
};

export const ForceMenuOpen: Story = {
  args: {
    menuIsOpen: true,
    formikValue: null,
  },
};
