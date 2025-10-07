import type {FieldsetComponentSchema} from '@open-formulieren/types';
import {clsx} from 'clsx';

import FormFieldContainer from '@/components/FormFieldContainer';
import type {FormioComponentProps} from '@/components/FormioComponent';
import Tooltip from '@/components/forms/Tooltip';
import type {RegistryEntry} from '@/registry/types';

import './Fieldset.scss';
import getInitialValues from './initialValues';
import getValidationSchema from './validationSchema';
import applyVisibility from './visibility';

export interface FieldsetProps {
  componentDefinition: FieldsetComponentSchema;
  renderNested: React.FC<FormioComponentProps>;
}

export const Fieldset: React.FC<FieldsetProps> = ({
  componentDefinition: {components, hideHeader = false, label, tooltip},
  renderNested: FormioComponent,
}) => {
  return (
    <fieldset className={clsx('openforms-fieldset', {'openforms-fieldset--no-header': hideHeader})}>
      {!hideHeader && (
        <legend
          className={clsx('openforms-fieldset__legend', {
            'openforms-fieldset__legend--tooltip': !!tooltip,
          })}
        >
          {label}
          {tooltip && <Tooltip>{tooltip}</Tooltip>}
        </legend>
      )}
      <FormFieldContainer>
        {components.map(nestedDefinition => (
          <FormioComponent key={nestedDefinition.id} componentDefinition={nestedDefinition} />
        ))}
      </FormFieldContainer>
    </fieldset>
  );
};

const FieldsetComponent: RegistryEntry<FieldsetComponentSchema> = {
  formField: Fieldset,
  getInitialValues,
  getValidationSchema,
  applyVisibility,
};

export default FieldsetComponent;
