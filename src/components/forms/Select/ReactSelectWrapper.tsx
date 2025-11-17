import {clsx} from 'clsx';
import {FormattedMessage} from 'react-intl';
import Select, {components} from 'react-select';
import type {GroupBase, InputProps, Props} from 'react-select';

import './ReactSelectWrapper.scss';

export interface BaseOption {
  /**
   * The programmatic/system value of the option.
   *
   * Used for equality tests to check if this option is selected. We only support string
   * values.
   */
  value: string;
}

export interface ReactSelectWrapperProps<
  O extends BaseOption = BaseOption,
  IsMulti extends boolean = boolean,
> extends Props<O, IsMulti> {
  options: O[]; // only support options arrays, not option groups
  formikValue: IsMulti extends true ? string[] : string | null;
  isRequired?: boolean;
  isInvalid?: boolean;
}

/**
 * Type-narrowing formik-to-react-select-options value translation layer.
 *
 * The generic types cannot narrow at run-time to infer that `isMulti: true` implies
 * an array of strings as formik value.
 */
function formikToSelectValue<O extends BaseOption = BaseOption>(
  options: O[],
  isMulti: boolean | undefined,
  formikValue: string | null | string[]
): O | null | O[] {
  if (isMulti) {
    if (!Array.isArray(formikValue)) {
      throw new Error('isMulti select received a non-array formik value, this is not allowed.');
    }
    return options.filter(o => formikValue.includes(o.value));
  }

  return options.find(o => o.value === formikValue) || null;
}

// Pass along our own aria-describedby if provided
const Input = <O extends BaseOption = BaseOption>(props: InputProps<O>) => {
  const describedByBits: string[] = [
    props['aria-describedby'],
    // see https://github.com/JedWatson/react-select/issues/1570
    // @ts-expect-error parent component doesn't have an aria-describedby prop
    props.selectProps?.['aria-describedby'],
  ].filter(b => !!b);
  const describedby = describedByBits.length ? describedByBits.join(' ') : undefined;
  return <components.Input<O, boolean, GroupBase<O>> {...props} aria-describedby={describedby} />;
};

/**
 * Wrapper around react-select taking care of the type generics and NL DS integration.
 */
function ReactSelectWrapper<O extends BaseOption = BaseOption>({
  inputId,
  isRequired,
  isDisabled,
  isInvalid,
  options,
  formikValue,
  ...props
}: ReactSelectWrapperProps<O, boolean>) {
  const value = formikToSelectValue<O>(options, props.isMulti, formikValue);
  return (
    <Select<O, boolean>
      inputId={inputId}
      options={options}
      classNames={{
        control: state =>
          clsx('utrecht-select', 'utrecht-select--openforms', {
            'utrecht-select--focus': state.isFocused,
            'utrecht-select--focus-visible': state.isFocused,
            'utrecht-select--disabled': isDisabled,
            'utrecht-select--invalid': isInvalid,
            'utrecht-select--required': isRequired,
            'utrecht-select--openforms-is-multi': state.isMulti,
          }),
        menu: () => 'rs-menu',
        option: state =>
          clsx('rs-menu__option', {
            'rs-menu__option--focus': state.isFocused,
            'rs-menu__option--visible-focus': state.isFocused,
          }),
        singleValue: () => 'rs-value rs-value--single',
        multiValue: () => 'rs-value rs-value--multi',
        noOptionsMessage: () => 'rs-no-options',
        input: () => 'rs-input',
        placeholder: () => 'rs-placeholder',
      }}
      styles={{
        control: baseStyles => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const {outline, ...keep} = baseStyles;
          return keep;
        },
      }}
      unstyled
      getOptionValue={opt => opt.value}
      isDisabled={isDisabled}
      loadingMessage={() => (
        <FormattedMessage
          description="(Async) select options loading message"
          defaultMessage="Loading..."
        />
      )}
      noOptionsMessage={() => (
        <FormattedMessage
          description="Select 'no options' message"
          defaultMessage="No results found"
        />
      )}
      // Taken from snippet posted in react-select issue:
      // https://github.com/JedWatson/react-select/issues/3562#issuecomment-518841754
      onKeyDown={evt => {
        if (!(evt.target instanceof HTMLInputElement)) return;
        switch (evt.key) {
          case 'Home':
            evt.preventDefault();
            if (evt.shiftKey) evt.target.selectionStart = 0;
            else evt.target.setSelectionRange(0, 0);
            break;
          case 'End': {
            evt.preventDefault();
            const len = evt.target.value.length;
            if (evt.shiftKey) evt.target.selectionEnd = len;
            else evt.target.setSelectionRange(len, len);
            break;
          }
          // no default
        }
      }}
      {...props}
      components={{Input: Input<O>, ...props.components}}
      value={value}
    />
  );
}

export default ReactSelectWrapper;
