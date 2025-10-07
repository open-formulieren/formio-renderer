import type {ColumnsComponentSchema} from '@open-formulieren/types';
import {clsx} from 'clsx';

import FormFieldContainer from '@/components/FormFieldContainer';
import type {FormioComponentProps} from '@/components/FormioComponent';
import type {RegistryEntry} from '@/registry/types';

import './Columns.scss';
import getInitialValues from './initialValues';
import getValidationSchema from './validationSchema';
import applyVisibility from './visibility';

export interface ColumnsProps {
  componentDefinition: ColumnsComponentSchema;
  renderNested: React.FC<FormioComponentProps>;
}

export const Columns: React.FC<ColumnsProps> = ({
  componentDefinition: {columns},
  renderNested: FormioComponent,
}) => {
  return (
    <div className="openforms-columns">
      {columns.map(({size, sizeMobile, components}, index) => (
        <FormFieldContainer
          key={`col-${index}`}
          className={clsx('openforms-columns__column', `openforms-columns__column--span-${size}`, {
            [`openforms-columns__column--span-mobile-${sizeMobile}`]: sizeMobile,
          })}
        >
          {components.map(nestedDefinition => (
            <FormioComponent key={nestedDefinition.id} componentDefinition={nestedDefinition} />
          ))}
        </FormFieldContainer>
      ))}
    </div>
  );
};

const ColumnsComponent: RegistryEntry<ColumnsComponentSchema> = {
  formField: Columns,
  getInitialValues,
  getValidationSchema,
  applyVisibility,
};

export default ColumnsComponent;
