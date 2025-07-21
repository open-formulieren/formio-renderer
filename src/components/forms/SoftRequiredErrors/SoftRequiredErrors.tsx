import {getIn, useFormikContext} from 'formik';
import {useId, useMemo} from 'react';

import {useFormSettings} from '@/hooks';

import './SoftRequiredErrors.scss';
import SoftRequiredErrorsMessage from './SoftRequiredErrorsMessage';
import {getSoftRequiredComponentsRecursive, resolveEditgridChildrenPath} from './utils';
import type {SoftRequiredComponent} from './utils';

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
  const {values} = useFormikContext();
  const {components} = useFormSettings();
  const id = useId();

  const softRequiredComponents = useMemo((): SoftRequiredComponent[] => {
    // @TODO limit search to visible components
    // (requires logic from `feature/59-clear-on-hide` branch)

    return getSoftRequiredComponentsRecursive(components || []);
  }, [components]);

  const missingFields = useMemo((): SoftRequiredComponent[] => {
    const resolvedComponents = resolveEditgridChildrenPath(
      softRequiredComponents,
      values as object
    );

    return resolvedComponents.filter(component => {
      // Components that are not inside an editgrid
      const componentValue = getIn(values, component.pathToComponent);

      // @TODO The `!== undefined` check is probably only needed because we don't limit
      // to only visible components.
      return !componentValue && componentValue !== undefined;
    });
  }, [softRequiredComponents, values]);

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
