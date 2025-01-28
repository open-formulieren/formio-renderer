import {BsnComponentSchema} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react';
import {expect, fn, userEvent, within} from '@storybook/test';

import FormioForm, {FormioFormProps} from '@/components/FormioForm';
import {withFormik} from '@/sb-decorators';

import {FormioBSN as BSN} from './';

export default {
  title: 'Component registry / custom / bsn',
  component: BSN,
  decorators: [withFormik],
} satisfies Meta<typeof BSN>;

type Story = StoryObj<typeof BSN>;

export const MinimalConfiguration: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'bsn',
      key: 'my.bsn',
      label: 'A BSN field',
      inputMask: '999999999',
      validateOn: 'blur',
    } satisfies BsnComponentSchema,
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          bsn: '',
        },
      },
    },
  },
};

interface ValidationStoryArgs {
  componentDefinition: BsnComponentSchema;
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
      type: 'bsn',
      key: 'my.bsn',
      label: 'A BSN',
      inputMask: '999999999',
      validateOn: 'blur',
      validate: {
        required: true,
      },
    } satisfies BsnComponentSchema,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const bsnField = canvas.getByLabelText('A BSN');
    expect(bsnField).toBeVisible();

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('Required')).toBeVisible();
  },
};

export const ValidateBSN: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'bsn',
      key: 'my.bsn',
      label: 'A BSN',
      inputMask: '999999999',
      validateOn: 'blur',
      validate: {
        required: false,
      },
    } satisfies BsnComponentSchema,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const bsnField = canvas.getByLabelText('A BSN');
    expect(bsnField).toBeVisible();
    await userEvent.type(bsnField, '123456789');

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('Invalid BSN')).toBeVisible();
  },
};
