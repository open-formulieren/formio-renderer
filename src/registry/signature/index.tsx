import type {SignatureComponentSchema} from '@open-formulieren/types';
import {FormField} from '@utrecht/component-library-react';
import {useField, useFormikContext} from 'formik';
import {useId, useLayoutEffect, useRef} from 'react';
import {useIntl} from 'react-intl';
import SignatureCanvas from 'react-signature-canvas';

import HelpText from '@/components/forms/HelpText';
import Label from '@/components/forms/Label';
import Tooltip from '@/components/forms/Tooltip';
import ValidationErrors from '@/components/forms/ValidationErrors';
import Icon from '@/components/icons';
import {useDebouncedCallback, useFieldConfig, useFieldError} from '@/hooks';
import type {RegistryEntry} from '@/registry/types';

import './Signature.scss';
import ValueDisplay from './ValueDisplay';
import isEmpty from './empty';
import getInitialValues from './initialValues';
import getValidationSchema from './validationSchema';

const BG_COLOR = 'rgb(245,245,235)';

export interface FormioSignatureFieldProps {
  componentDefinition: SignatureComponentSchema;
}

/**
 * A signature form field, complete with label, help text and validation errors.
 *
 * It contains a canvas on which the user can draw (continuous) lines, by holding the mouse button
 * and moving the mouse. Also works with a touch screen. The png image is base64-encoded and saved
 * to the Formik field when the user stops drawing.
 *
 * It includes a button with which the entire canvas can be cleared.
 */
export const FormioSignatureField: React.FC<FormioSignatureFieldProps> = ({
  componentDefinition: {key: name, label, description, tooltip, validate = {}, footer},
}) => {
  name = useFieldConfig(name);
  const intl = useIntl();
  const {validateField} = useFormikContext();
  const [{value: currentValue}, {touched}, {setValue, setTouched}] = useField<string | undefined>(
    name
  );
  const error = useFieldError(name, false);
  const id = useId();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<SignatureCanvas | null>(null);

  const invalid = touched && !!error;
  const errorMessageId = invalid ? `${id}-error-message` : undefined;

  const resizeHandler = () => {
    const containerDiv = containerRef.current;
    const instance = canvasRef.current;
    if (!containerDiv || !instance) return;
    const value = instance.toDataURL();
    const containerWidth = containerDiv.offsetWidth;
    const canvas = instance.getCanvas();
    canvas.width = containerWidth;
    // changing dimensions requires redrawing, which is done through the clear() method
    instance.clear();
    if (value) {
      instance.fromDataURL(value, {
        ratio: 1,
        width: canvas.width,
        height: canvas.height,
      });
    }
  };
  const onResize = useDebouncedCallback(resizeHandler, 100);

  useLayoutEffect(() => {
    window.addEventListener('resize', onResize);
    resizeHandler();

    // if there's a current value from form state, set it
    if (currentValue && canvasRef.current) {
      const canvas = canvasRef.current.getCanvas();
      canvasRef.current.fromDataURL(currentValue, {
        ratio: 1,
        width: canvas.width,
        height: canvas.height,
      });
    }

    return () => {
      window.removeEventListener('resize', resizeHandler);
    };
    // we deliberately exclude currentValue from the dependencies, because we don't want to rerender
    // the canvas after the value has changed, since it's already showing the latest drawing
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onEnd = async () => {
    const instance = canvasRef.current;
    if (instance === null) return;
    const dataUrl = instance.toDataURL();
    await setValue(dataUrl);
    // Need to manually validate and set the field as touched, since we are not passing any formik
    // props to the canvas element
    await validateField(name);
    await setTouched(true);
  };

  const onClear = async () => {
    const instance = canvasRef.current;
    if (instance === null) return;
    instance.clear();
    await setValue('');
  };

  return (
    <FormField invalid={invalid} className="utrecht-form-field--openforms">
      <Label
        id={id}
        isRequired={validate.required ?? false}
        tooltip={tooltip ? <Tooltip>{tooltip}</Tooltip> : undefined}
      >
        {label}
      </Label>
      <div ref={containerRef}>
        <Icon
          icon="refresh"
          className="openforms-signature-refresh"
          aria-label={intl.formatMessage({
            description: 'Signature: accessible clear signature label',
            defaultMessage: 'Clear signature',
          })}
          aria-hidden="false"
          onClick={onClear}
        />
        <SignatureCanvas
          ref={canvasRef}
          onEnd={onEnd}
          minWidth={0.5}
          maxWidth={2.5}
          penColor="black"
          backgroundColor={BG_COLOR}
          clearOnResize={false}
        />
        <div className="openforms-signature-footer">{footer}</div>
      </div>
      <HelpText>{description}</HelpText>
      {touched && errorMessageId && <ValidationErrors error={error} id={errorMessageId} />}
    </FormField>
  );
};

const SignatureFieldComponent: RegistryEntry<SignatureComponentSchema> = {
  formField: FormioSignatureField,
  valueDisplay: ValueDisplay,
  getInitialValues,
  getValidationSchema,
  isEmpty,
};

export default SignatureFieldComponent;
