import {AnyComponentSchema} from '@open-formulieren/types';

import {FormioConfiguration} from '@/types';

// Values must be JSON-serializable
export type ComponentValue =
  | string
  | number
  | boolean
  | null
  | ComponentValue[]
  | {[key: string]: ComponentValue};

export type SubmissionData = {
  [key: string]: ComponentValue;
};

export interface Submission {
  data: SubmissionData;
  // unused by us, but Form.io stores timezone info in here so not a bad idea to anticipate
  // usage
  metadata?: {[key: string]: unknown};
}

export interface ChangeContext {
  // could probably derive keys from FormioConfiguration type, but that makes little sense
  // since those values are dynamic anyway.
  name: string;
  // value type depends on the particular component type
  value: unknown;
  // pass back the component from the form configuration that was changed
  component: AnyComponentSchema;
  // total form value with all the filled out fields. Keys are the key of the matching
  // component, while the value may be a scalar/leaf node, array (for repeating groups
  // or certain component types, like file) or nested mappings.
  formValue: SubmissionData;
}

export interface FormioFormProps {
  /**
   * The Form.io form definition, as JSON schema.
   *
   * @note Only the Open Forms specific configurations are supported.
   */
  form: FormioConfiguration;
  /**
   * An optional existing submission with form values data.
   *
   * If provided, the `submission.data` key-value pairs will be used to initialize the
   * form field values.
   */
  submission?: Submission;
  /**
   * Callback when a form field value changes.
   *
   * The callback receives a context of what exactly changed and a full view of all the
   * form field values.
   */
  onChange: (changed: ChangeContext) => void;
  /**
   * Callback invoked when the form is submitted.
   *
   * If this callback fires, then it means that the form fields all validated on the
   * client side and the data is ready to be submitted to a backend.
   */
  onSubmit: (data: SubmissionData) => void;
}

const FormioForm: React.FC<FormioFormProps> = ({
  form: configuration,
  submission = {data: {}} satisfies Submission,
  onChange,
  onSubmit,
}) => {
  console.log(onChange, onSubmit);
  const {finalConfiguration, finalSubmission} = evaluateFormLogic(configuration, submission);
  // use the final submission for the form initialvalues
  // use the final configuration for rendering
  console.log(finalConfiguration, finalSubmission);
  return null;
};

// TODO: actually implement this! Keep in mind:
//
// 1. Values of fields can result in other components being hidden/shown.
// 2. Components may be configured to clear their value on hide -> configuration change
//    can affect the values again!
// 3. From 1. and 2. it's possible that you flip-flow infinitely with certain reference
//    cycles.
//
// Self-reminder: use immer to operate on drafts and guarantee immutability.
export const evaluateFormLogic = (
  configuration: FormioConfiguration,
  submission: Submission
): {
  finalConfiguration: FormioConfiguration;
  finalSubmission: Submission;
} => {
  // for the time being, do not actually do anything.
  return {
    finalConfiguration: configuration,
    finalSubmission: submission,
  };
};

export default FormioForm;
