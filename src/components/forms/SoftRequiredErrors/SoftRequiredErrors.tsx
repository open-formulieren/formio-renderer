import {useFormikContext} from 'formik';
import {useId, useMemo} from 'react';

import {getComponentsMap} from '@/formio';
import {useFormSettings} from '@/hooks';
import {getRegistryEntry} from '@/registry';
import type {JSONObject} from '@/types';
import {processVisibility} from '@/visibility';

import './SoftRequiredErrors.scss';
import SoftRequiredErrorsMessage from './SoftRequiredErrorsMessage';
import {getMissingFields, getSoftRequiredComponents} from './utils';
import type {MissingFields} from './utils';

export interface SoftRequiredErrorsProps {
  /**
   * The message that will be displayed when the form has soft required fields that are
   * still empty. The string could/should contain the `{{ missingFields }}` tag, this
   * will be replaced with a list of the soft required fields that are empty.
   *
   * The `html` field is populated using a WYSIWYG editor, so expect the string to
   * contain html tags.
   */
  html: string;
}

const SoftRequiredErrors: React.FC<SoftRequiredErrorsProps> = ({html}) => {
  const id = useId();
  const {values, initialValues} = useFormikContext<JSONObject>();
  const {components} = useFormSettings();

  const componentsMap = useMemo(() => getComponentsMap(components), [components]);

  // Compute the visible components and associated updated values (via clearOnHide)
  // every time either the form configuration (components) is modified or when the form
  // values change. Note that the form values also change as a reaction to processed
  // values via clearOnHide, and this implies multiple (render) passes to converge.
  // XXX: this means that component definitions may not have reference cycles in their
  // conditional logic to prevent infinite render loops!
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
    () => getMissingFields(softRequiredComponents, values as object),
    [softRequiredComponents, values]
  );

  if (!missingFields.length) {
    return null;
  }

  return (
    <div
      id={`${id}-content`}
      className="utrecht-alert utrecht-alert--warning openforms-soft-required-errors"
      role="status"
    >
      <div className="utrecht-alert__icon">
        <i className="fa fas fa-exclamation-triangle"></i>
      </div>
      <div className="utrecht-alert__message">
        <SoftRequiredErrorsMessage id={id} html={html} missingFields={missingFields} />
      </div>
    </div>
  );
};

SoftRequiredErrors.displayName = 'SoftRequiredErrors';

export default SoftRequiredErrors;
