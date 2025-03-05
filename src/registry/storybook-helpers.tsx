import {AnyComponentSchema} from '@open-formulieren/types';
import {PrimaryActionButton} from '@utrecht/component-library-react';

import FormioForm, {FormioFormProps} from '@/components/FormioForm';

export interface RenderArgs {
  componentDefinition: AnyComponentSchema;
  onSubmit: FormioFormProps['onSubmit'];
}

export const renderComponentInForm = (args: RenderArgs) => (
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
      id="formio-form"
      requiredFieldsWithAsterisk
    />
    <PrimaryActionButton type="submit" form="formio-form" style={{alignSelf: 'flex-start'}}>
      Submit
    </PrimaryActionButton>
  </div>
);
