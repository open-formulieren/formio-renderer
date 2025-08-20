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

  // Because `visibleComponents` changes with every `values` change, it doesn't make
  // sense to separate these functions. (Grouping them in 1 useMemo has the same effect
  // as 3 separate useMemo's)
  // When we do notice a performance hit, we can further investigate, redesign, optimize.
  // Maybe a `useProcessVisibility` hook could solve some of the issues/lighten the
  // workload.
  const missingFields: MissingFields[] = useMemo(() => {
    // We only show visible components in the soft-required list.
    const {visibleComponents} = processVisibility(components, values, {
      parentHidden: false,
      initialValues,
      getRegistryEntry,
      componentsMap,
    });

    // Filter the list of visible components to the components that are actually
    // soft-required.
    const softRequiredComponents = getSoftRequiredComponents(visibleComponents);

    // Get the missing/empty soft-required fields, and return them.
    return getMissingFields(softRequiredComponents, values, getRegistryEntry);
  }, [components, componentsMap, getRegistryEntry, initialValues, values]);

  if (!missingFields.length) {
    return null;
  }

  return (
    <Alert type="warning" icon={<Icon icon="warning" />}>
      <HTMLContent>
        <SoftRequiredErrorsMessage html={html} missingFields={missingFields} />
      </HTMLContent>
    </Alert>
  );
};

const SoftRequiredErrorsComponent: RegistryEntry<SoftRequiredErrorsComponentSchema> = {
  formField: SoftRequiredErrors,
};

export default SoftRequiredErrorsComponent;
