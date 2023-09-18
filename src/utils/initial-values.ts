import {AnyComponentSchema} from '@open-formulieren/types';

import {ComponentValue, FormioConfiguration, Submission, SubmissionData} from '@/types';

type AnyComponentSchemaWithDefaultValue = AnyComponentSchema & {defaultValue: ComponentValue};

const hasDefaultValue = (
  component: AnyComponentSchema
): component is AnyComponentSchemaWithDefaultValue => {
  return component.hasOwnProperty('defaultValue');
};

export const getInitialValues = (
  configuration: FormioConfiguration,
  submission: Submission
): SubmissionData => {
  // TODO: use lodash-set for deep-setting keys
  // TODO: exclude layout components
  const initialvalues: SubmissionData = {};
  configuration.components.forEach(component => {
    const {key} = component;

    const defaultValue = hasDefaultValue(component) ? component.defaultValue : null;

    // TODO: use data-type appropriate default empty value, but ensure that the form inputs
    // properly use empty string as value for values like null.
    initialvalues[key] = submission.data[key] ?? defaultValue ?? '';
  });
  return initialvalues;
};
