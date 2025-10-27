import type {FieldsetComponentSchema} from '@open-formulieren/types';

import FormFieldContainer from '@/components/FormFieldContainer';
import type {FormioComponentProps} from '@/components/FormioComponent';
import Fieldset from '@/components/forms/Fieldset';
import Tooltip from '@/components/forms/Tooltip';
import type {RegistryEntry} from '@/registry/types';

import getInitialValues from './initialValues';
import getValidationSchema from './validationSchema';
import applyVisibility from './visibility';

export interface FieldsetProps {
  componentDefinition: FieldsetComponentSchema;
  renderNested: React.FC<FormioComponentProps>;
}

export const FormioFieldset: React.FC<FieldsetProps> = ({
  componentDefinition: {components, hideHeader = false, label, tooltip},
  renderNested: FormioComponent,
}) => {
  return (
    <Fieldset
      header={
        hideHeader ? undefined : (
          <>
            {label}
            {tooltip && <Tooltip>{tooltip}</Tooltip>}
          </>
        )
      }
      hasTooltip={!!tooltip}
    >
      <FormFieldContainer>
        {components.map(nestedDefinition => (
          <FormioComponent key={nestedDefinition.id} componentDefinition={nestedDefinition} />
        ))}
      </FormFieldContainer>
    </Fieldset>
  );
};

const FieldsetComponent: RegistryEntry<FieldsetComponentSchema> = {
  formField: FormioFieldset,
  getInitialValues,
  getValidationSchema,
  applyVisibility,
};

export default FieldsetComponent;
