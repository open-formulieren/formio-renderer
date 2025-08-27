import {PartnerDetails, PartnersComponentSchema} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, within} from 'storybook/test';

import FormioComponent from '@/components/FormioComponent';
import {getRegistryEntry} from '@/registry';
import {withFormik} from '@/sb-decorators';

import {PartnersField} from './';
import ValueDisplay from './ValueDisplay';

export default {
  title: 'Component registry / special / partners',
  component: PartnersField,
  decorators: [withFormik],
  args: {
    renderNested: FormioComponent,
    getRegistryEntry: getRegistryEntry,
  },
} satisfies Meta<typeof PartnersField>;

type Story = StoryObj<typeof PartnersField>;

export const MinimalConfiguration: Story = {
  args: {
    componentDefinition: {
      id: 'partners',
      type: 'partners',
      key: 'partners',
      label: 'Partners',
    },
  },
  parameters: {
    formik: {
      initialValues: {
        partners: [
          {
            bsn: '123456789',
            initials: 'J',
            affixes: 'K',
            lastName: 'Boei',
            dateOfBirth: '1-1-2000',
          },
        ],
      },
    },
  },
};

export const WithTooltip: Story = {
  args: {
    componentDefinition: {
      id: 'partners',
      type: 'partners',
      key: 'partners',
      label: 'Partners',
      tooltip: 'Surprise!',
    },
  },
  parameters: {
    formik: {
      initialValues: {
        partners: [
          {
            bsn: '123456789',
            initials: 'J',
            affixes: 'K',
            lastName: 'Boei',
            dateOfBirth: '1-1-2000',
          },
        ],
      },
    },
  },
};

interface ValueDisplayStoryArgs {
  componentDefinition: PartnersComponentSchema;
  value: PartnerDetails[];
}

type ValueDisplayStory = StoryObj<ValueDisplayStoryArgs>;

const BaseValueDisplayStory: ValueDisplayStory = {
  render: args => <ValueDisplay {...args} />,
  parameters: {
    formik: {
      disable: true,
    },
  },
};

export const NoPartnersDisplay: ValueDisplayStory = {
  ...BaseValueDisplayStory,
  args: {
    componentDefinition: {
      id: 'partners',
      type: 'partners',
      key: 'partners',
      label: 'Partners',
    },
    value: [],
  },
};

export const SinglePartnerDisplay: ValueDisplayStory = {
  ...BaseValueDisplayStory,
  args: {
    componentDefinition: {
      id: 'partners',
      type: 'partners',
      key: 'partners',
      label: 'Partners',
    },
    value: [
      {
        bsn: '123456789',
        initials: 'J',
        affixes: 'de',
        lastName: 'Boei',
        dateOfBirth: '1-1-2000',
      },
    ],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const definitions = canvas.getAllByRole('definition');

    expect(definitions).toHaveLength(5);
    expect(definitions[0]).toContainHTML('123456789');
    expect(definitions[1]).toContainHTML('J');
    expect(definitions[2]).toContainHTML('de');
    expect(definitions[3]).toContainHTML('Boei');
    expect(definitions[4]).toContainHTML('1-1-2000');
  },
};

export const MultiplePartnersDisplay: ValueDisplayStory = {
  ...BaseValueDisplayStory,
  args: {
    componentDefinition: {
      id: 'partners',
      type: 'partners',
      key: 'partners',
      label: 'Partners',
    },
    value: [
      {
        bsn: '123456789',
        initials: 'J',
        affixes: 'de',
        lastName: 'Boei',
        dateOfBirth: '1-1-2000',
      },
      {
        bsn: '111222333',
        initials: 'V',
        affixes: 'van',
        lastName: 'Vis',
        dateOfBirth: '12-12-1980',
      },
    ],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const definitions = canvas.getAllByRole('definition');

    expect(definitions).toHaveLength(10);
    expect(definitions[0]).toContainHTML('123456789');
    expect(definitions[1]).toContainHTML('J');
    expect(definitions[2]).toContainHTML('de');
    expect(definitions[3]).toContainHTML('Boei');
    expect(definitions[4]).toContainHTML('1-1-2000');

    expect(definitions[5]).toContainHTML('111222333');
    expect(definitions[6]).toContainHTML('V');
    expect(definitions[7]).toContainHTML('van');
    expect(definitions[8]).toContainHTML('Vis');
    expect(definitions[9]).toContainHTML('12-12-1980');
  },
};
