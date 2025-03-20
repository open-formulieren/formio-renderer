import type {Meta, StoryObj} from '@storybook/react';

import FormioComponent from '@/components/FormioComponent';
import {withFormik} from '@/sb-decorators';

import {EditGrid} from './';

export default {
  title: 'Component registry / special / editgrid',
  component: EditGrid,
  decorators: [withFormik],
  args: {
    renderNested: FormioComponent,
  },
} satisfies Meta<typeof EditGrid>;

type Story = StoryObj<typeof EditGrid>;

export const MinimalConfiguration: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'editgrid',
      key: 'editgrid',
      label: 'Repeating group',
      disableAddingRemovingRows: false,
      groupLabel: 'Nested item',
      components: [
        {
          id: 'component2',
          type: 'textfield',
          key: 'my.textfield',
          label: 'A simple textfield',
        },
        {
          id: 'component3',
          type: 'date',
          key: 'datefield',
          label: 'A date',
        },
      ],
    },
  },
  parameters: {
    formik: {
      initialValues: {
        editgrid: [
          {
            my: {
              textfield: '',
            },
            datefield: '',
          },
        ],
      },
    },
  },
};
