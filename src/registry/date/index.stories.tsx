import {DateComponentSchema} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react';
import {expect, fn, userEvent, within} from '@storybook/test';

import FormioForm, {FormioFormProps} from '@/components/FormioForm';
import {withFormik} from '@/sb-decorators';

import {FormioDate} from './';

export default {
  title: 'Component registry / custom / date',
  component: FormioDate,
  decorators: [withFormik],
} satisfies Meta<typeof FormioDate>;

type Story = StoryObj<typeof FormioDate>;

export const MinimalConfiguration: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'date',
      key: 'my.date',
      label: 'Your date',
    } satisfies DateComponentSchema,
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          date: '',
        },
      },
    },
  },
};

interface ValidationStoryArgs {
  componentDefinition: DateComponentSchema;
  onSubmit: FormioFormProps['onSubmit'];
}

type ValidationStory = StoryObj<ValidationStoryArgs>;

const BaseValidationStory: ValidationStory = {
  render: args => (
    <FormioForm
      onSubmit={args.onSubmit}
      components={[args.componentDefinition]}
      requiredFieldsWithAsterisk
    >
      <div style={{marginBlockStart: '20px'}}>
        <button type="submit">Submit</button>
      </div>
    </FormioForm>
  ),
  parameters: {
    formik: {
      disable: true,
    },
  },
};

export const ValidateRequired: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'date',
      key: 'my.date',
      label: 'Your date',
      validate: {
        required: true,
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const yearInput = canvas.getByLabelText('Year');
    expect(yearInput).toBeVisible();

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('Required')).toBeVisible();
  },
};
