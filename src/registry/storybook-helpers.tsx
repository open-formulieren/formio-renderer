import type {AnyComponentSchema} from '@open-formulieren/types';
import type {StoryContext} from '@storybook/react-vite';

import {PrimaryActionButton} from '@/components/Button';
import type {FormioFormProps} from '@/components/FormioForm';
import FormioForm from '@/components/FormioForm';
import type {JSONObject} from '@/types';

export interface RenderArgs {
  componentDefinition: AnyComponentSchema;
  onSubmit: FormioFormProps['onSubmit'];
  values?: JSONObject;
}

export const renderComponentInForm = (args: RenderArgs, context?: StoryContext<unknown>) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      rowGap: '20px',
    }}
  >
    <FormioForm
      onSubmit={args.onSubmit}
      components={[args.componentDefinition]}
      values={args.values}
      id="formio-form"
      requiredFieldsWithAsterisk
      componentParameters={context?.parameters?.formSettings?.componentParameters}
      validatePluginCallback={context?.parameters?.formSettings?.validatePluginCallback}
    />
    <PrimaryActionButton type="submit" form="formio-form" style={{alignSelf: 'flex-start'}}>
      Submit
    </PrimaryActionButton>
  </div>
);
