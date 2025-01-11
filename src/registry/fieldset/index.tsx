import type {FieldsetComponentSchema} from '@open-formulieren/types';
import clsx from 'clsx';

import FormFieldContainer from '@/components/FormFieldContainer';
import type {FormioComponentProps} from '@/components/FormioComponent';

import './Fieldset.scss';

export interface FieldsetProps {
  componentDefinition: FieldsetComponentSchema;
  renderNested: React.FC<FormioComponentProps>;
}

const Fieldset: React.FC<FieldsetProps> = ({
  // TODO: display tooltip, if specified
  componentDefinition: {components, hideHeader = false, label},
  renderNested: FormioComponent,
}) => {
  return (
    <fieldset className={clsx('openforms-fieldset', {'openforms-fieldset--no-header': hideHeader})}>
      {!hideHeader && label && <legend className="openforms-fieldset__legend">{label}</legend>}
      <FormFieldContainer>
        {components.map(nestedDefinition => (
          <FormioComponent key={nestedDefinition.id} componentDefinition={nestedDefinition} />
        ))}
      </FormFieldContainer>
    </fieldset>
  );
};

export default Fieldset;
export {default as getInitialValues} from './initialValues';
export {default as getValidationSchema} from './validationSchema';
