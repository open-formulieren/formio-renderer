import {Meta, StoryObj} from '@storybook/react-vite';

import InputContainer from './InputContainer';

export default {
  title: 'Internal API / Forms / InputContainer',
  component: InputContainer,
  args: {
    children: <input type="text" placeholder="This is example input" />,
    prefix: 'CO<sub>2</sub>',
    suffix: 'm<sup>2</sup>',
  },
} satisfies Meta<typeof InputContainer>;

type Story = StoryObj<typeof InputContainer>;

export const Default: Story = {};
