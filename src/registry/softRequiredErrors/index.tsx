import type {SoftRequiredErrorsComponentSchema} from '@open-formulieren/types';
import {Alert, HTMLContent} from '@utrecht/component-library-react';
import {useFormikContext} from 'formik';
import {useMemo} from 'react';

import Icon from '@/components/icons';
import {getComponentsMap} from '@/formio';
import {useFormSettings} from '@/hooks';
import {RegistryEntry, RenderComponentProps} from '@/registry/types';
import type {JSONObject} from '@/types';
import {processVisibility} from '@/visibility';

import './SoftRequiredErrors.scss';
import SoftRequiredErrorsMessage from './SoftRequiredErrorsMessage';
import {type MissingFields, getMissingFields, getSoftRequiredComponents} from './missingFields';

export type SoftRequiredErrorsProps = RenderComponentProps<SoftRequiredErrorsComponentSchema>;

export const SoftRequiredErrors: React.FC<SoftRequiredErrorsProps> = ({
  componentDefinition: {html},
  getRegistryEntry,
}) => {
  const {values, initialValues} = useFormikContext<JSONObject>();
  const {components} = useFormSettings();

  const componentsMap = useMemo(() => getComponentsMap(components), [components]);

  // Compute the visible components and associated updated values (via clearOnHide)
  // every time either the form configuration (components) is modified or when the form
  // values change. Note that the form values also change as a reaction to processed
  // values via clearOnHide, and this implies multiple (render) passes to converge.
  const visibleComponents = useMemo(() => {
    const {visibleComponents} = processVisibility(components, values, {
      parentHidden: false,
      initialValues,
      getRegistryEntry,
      componentsMap,
    });
    return visibleComponents;
  }, [components, initialValues, values]);

  const softRequiredComponents = useMemo(
    () => getSoftRequiredComponents(visibleComponents),
    [visibleComponents]
  );

  const missingFields: MissingFields[] = useMemo(
    () => getMissingFields(softRequiredComponents, values),
    [softRequiredComponents, values]
  );

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
