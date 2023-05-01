import {Button} from '@components';
import type {ComponentStory, Meta} from '@storybook/react';
import React from 'react';

const meta: Meta<typeof Button> = {
  title: 'Components / Button',
  component: Button,
  decorators: [],
  parameters: {},
};
export default meta;

//
// renderForm
//

export const button: ComponentStory<typeof Button> = args => <Button {...args} />;
button.args = {
  component: {
    type: 'button',
    action: 'submit',
    label: 'Submit',
    theme: 'primary',
  },
};
