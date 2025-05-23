import {AnyComponentSchema} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react';
import {fn} from '@storybook/test';
import {getIn} from 'formik';
import {useEffect, useState} from 'react';

import {FormioForm} from '.';

const DEFAULT_ENDPOINT: string = '';

const loadFormDefinition = async (
  endpoint: string,
  path: string
): Promise<AnyComponentSchema[]> => {
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

  const response = await window.fetch(endpoint, {mode: 'cors'});
  const body = await response.json();
  const node = path ? getIn(body, path) : body;
  return node?.components ?? [];
};

interface Args {
  endpoint: string;
  formDefinitionPath: string;
  requiredFieldsWithAsterisk: boolean;
}

const Preview: React.FC<Args> = ({endpoint, formDefinitionPath, requiredFieldsWithAsterisk}) => {
  const [loading, setLoading] = useState(true);
  const [components, setComponents] = useState<AnyComponentSchema[]>([]);

  useEffect(() => {
    setLoading(true);
    const effect = async () => {
      const result = await loadFormDefinition(endpoint, formDefinitionPath);
      setComponents(result);
      setLoading(false);
    };
    effect().catch(console.error);
  }, [endpoint, formDefinitionPath]);

  return (
    <>
      <p>
        Modify the story controls to get a live preview of the referenced form. Note that the
        endpoint must allow cross origin requests! You can use a CORS proxy to circumvent those
        issues.
      </p>
      <hr style={{margin: '20px 50px'}} />
      {loading ? (
        <p>Retrieving form definition...</p>
      ) : (
        <FormioForm
          components={components}
          onSubmit={fn()}
          requiredFieldsWithAsterisk={requiredFieldsWithAsterisk}
        />
      )}
    </>
  );
};

export default {
  title: 'Introduction / Playground',
  render: args => <Preview {...args} />,
  args: {
    endpoint: DEFAULT_ENDPOINT,
    formDefinitionPath: '',
    requiredFieldsWithAsterisk: true,
  },
} satisfies Meta<Args>;

type Story = StoryObj<Args>;

export const Playground: Story = {};
