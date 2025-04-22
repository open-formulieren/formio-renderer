import {AnyComponentSchema} from '@open-formulieren/types';
import {INITIAL_VIEWPORTS} from '@storybook/addon-viewport';
import type {Meta, StoryObj} from '@storybook/react';
import {expect, fn, userEvent, within} from '@storybook/test';

import FormioComponent from '@/components/FormioComponent';
import {FormioFormProps} from '@/components/FormioForm';
import {renderComponentInForm} from '@/registry/storybook-helpers';
import {withFormik} from '@/sb-decorators';

import {Columns} from './';

export default {
  title: 'Component registry / layout / columns',
  component: Columns,
  decorators: [withFormik],
  args: {
    renderNested: FormioComponent,
  },
} satisfies Meta<typeof Columns>;

type Story = StoryObj<typeof Columns>;

export const MinimalConfiguration: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'columns',
      key: 'columns',
      columns: [
        {
          size: 6,
          sizeMobile: 4,
          components: [
            {
              id: 'component2',
              type: 'textfield',
              key: 'my.textfield',
              label: 'Textfield 1',
            },
          ],
        },
        {
          size: 6,
          sizeMobile: 4,
          components: [
            {
              id: 'component3',
              type: 'textfield',
              key: 'otherTextfield',
              label: 'Textfield 2',
              defaultValue: 'Initial value textfield 2',
            },
          ],
        },
      ],
    },
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          textfield: '',
        },
      },
    },
  },
};

export const MobileMinimalConfiguration: Story = {
  ...MinimalConfiguration,
  globals: {
    viewport: {value: 'mobile1', isRotated: false},
  },
};
