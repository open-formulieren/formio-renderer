import {AnyComponentSchema} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react';
import {fn} from '@storybook/test';
import {useEffect, useState} from 'react';

import {FormioForm} from '.';

const loadFormDefinition = (endpoint: string, path: string): AnyComponentSchema[] => {
  if (!endpoint) {
    return [
      {
        id: 'fixedDefault',
        type: 'textfield',
        key: 'fixedDefault',
        label: 'Fixed default',
        description: 'Provide an endpoint to show a different form!',
      },
    ];
  }
  return [];
};

interface Args {
  endpoint: string;
  formDefinitionPath: string;
  requiredFieldsWithAsterisk: boolean;
}

const Preview: React.FC<Args> = ({endpoint, formDefinitionPath, requiredFieldsWithAsterisk}) => {
  const [components, setComponents] = useState<AnyComponentSchema[]>([]);
  useEffect(() => {
    const result = loadFormDefinition(endpoint, formDefinitionPath);
    setComponents(result);
  }, [endpoint, formDefinitionPath]);

  return (
    <>
      <p>
        Modify the story controls to get a live preview of the referenced form. Note that the
        endpoint must allow cross origin requests!
      </p>
      <hr style={{margin: '20px 50px'}} />
      <FormioForm
        components={components}
        onSubmit={fn()}
        requiredFieldsWithAsterisk={requiredFieldsWithAsterisk}
      />
    </>
  );
};

export default {
  title: 'Introduction / Playground',
  render: args => <Preview {...args} />,
  args: {
    endpoint: '',
    formDefinitionPath: '',
    requiredFieldsWithAsterisk: true,
  },
} satisfies Meta<Args>;

type Story = StoryObj<Args>;

export const Playground: Story = {};
