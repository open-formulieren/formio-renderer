import type {SoftRequiredErrorsComponentSchema} from '@open-formulieren/types';
import {Alert, HTMLContent} from '@utrecht/component-library-react';

import Icon from '@/components/icons';
import SoftRequiredErrorsMessage from '@/registry/softRequiredErrors/SoftRequiredErrorsMessage';
import type {RegistryEntry} from '@/registry/types';

import './SoftRequiredErrors.scss';

export interface SoftRequiredComponent {
  /**
   * The path to the component in the form values dict.
   */
  pathToComponent: string;
  /**
   * The label of the component.
   */
  label: string;
}

export interface SoftRequiredErrorsProps {
  componentDefinition: SoftRequiredErrorsComponentSchema;
}

export const SoftRequiredErrors: React.FC<SoftRequiredErrorsProps> = ({
  componentDefinition: {html},
}) => {
  const missingFields: SoftRequiredComponent[] = [{pathToComponent: '', label: 'Textfield'}];

  if (!missingFields.length) {
    return null;
  }

  return (
    <>
      <Alert type="warning" icon={<Icon icon="warning" />}>
        <HTMLContent>
          <SoftRequiredErrorsMessage html={html} missingFields={missingFields} />
        </HTMLContent>
      </Alert>
    </>
  );
};

const SoftRequiredErrorsComponent: RegistryEntry<SoftRequiredErrorsComponentSchema> = {
  formField: SoftRequiredErrors,
};

export default SoftRequiredErrorsComponent;
