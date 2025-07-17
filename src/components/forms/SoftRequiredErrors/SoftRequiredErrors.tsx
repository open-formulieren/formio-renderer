import {AnyComponentSchema} from '@open-formulieren/types';
import {getIn, useFormikContext} from 'formik';
import {useId, useMemo} from 'react';

import SoftRequiredErrorsMessage from '@/components/forms/SoftRequiredErrors/SoftRequiredErrorsMessage';
import {useFormSettings} from '@/hooks';

import "./SoftRequiredErrors.scss";

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

  const getSoftRequiredComponentsRecursive = (
    components: AnyComponentSchema[]
  ): AnyComponentSchema[] => {
    const componentsToReturn: AnyComponentSchema[] = [];
    if (!components.length) {
      return componentsToReturn;
    }

    components.forEach(component => {
      if (getIn(component, `openForms.softRequired`, false)) {
        componentsToReturn.push(component);
      }

      // Go recursive
      switch (component.type) {
        case 'fieldset':
          componentsToReturn.push(...getSoftRequiredComponentsRecursive(component.components));
          return;
        case 'editgrid':
          componentsToReturn.push(...getSoftRequiredComponentsRecursive(component.components));
          return;
        case 'columns':
          component.columns.forEach(column => {
            componentsToReturn.push(...getSoftRequiredComponentsRecursive(column.components));
          });
      }
    });

    return componentsToReturn;
  };

  // Get all soft required components. Only update when components change
  // Recursive get and flatten?
  const softRequiredComponents = useMemo(() => {
    // @TODO limit to visible components
    // (requires logic from `feature/59-clear-on-hide` branch)
    return getSoftRequiredComponentsRecursive(components || []);
  }, [components]);

  // When to trigger? Use without useMemo and trigger each re-render?
  const missingFields = useMemo((): AnyComponentSchema[] => {
    // @TODO do some proper "is empty" check, including: [], 0, {}, etc.
    return softRequiredComponents.filter(component => getIn(values, component.key) === '');
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
