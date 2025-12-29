import {clsx} from 'clsx';
import {FormattedMessage} from 'react-intl';
import Select, {components} from 'react-select';
import type {ClearIndicatorProps, GroupBase, InputProps, Props} from 'react-select';

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
  isReadOnly?: boolean;
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
 * A keyboard-navigation accessible clear indicator.
 *
 * @see {@link https://react-select.com/components} for the upstream documentation.
 * @see {@link https://github.com/JedWatson/react-select/blob/052e864b4990a67c4ee416851c34d1eb7b58267b/packages/react-select/src/components/indicators.tsx#L134}
 *   the default implementation.
 */
const CustomClearIndicator = <O extends BaseOption = BaseOption>(props: ClearIndicatorProps<O>) => {
  const {children, getStyles, innerProps} = props;
  return (
    <div
      {...innerProps}
      style={getStyles('clearIndicator', props) as React.CSSProperties}
      aria-hidden="false"
    >
      <button
        className="openforms-select-clear-indicator"
        type="button"
        onKeyDown={event => {
          if (event.code === 'Enter') {
            props.clearValue();
          }
        }}
      >
        <span className="sr-only">
          <FormattedMessage
            description="Select: accessible label for clear-value label"
            defaultMessage="Clear selection"
          />
        </span>
        {children || <components.CrossIcon />}
      </button>
    </div>
  );
};

/**
 * Wrapper around react-select taking care of the type generics and NL DS integration.
 */
function ReactSelectWrapper<O extends BaseOption = BaseOption>({
  inputId,
  isRequired,
  isReadOnly,
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
            'utrecht-select--disabled': isReadOnly,
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
        valueContainer: () => 'rs-value-container',
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
      isSearchable={isReadOnly ? false : undefined}
      openMenuOnClick={isReadOnly ? false : undefined}
      openMenuOnFocus={isReadOnly ? false : undefined}
      menuIsOpen={isReadOnly ? false : undefined}
      aria-readonly={isReadOnly}
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
      components={{
        Input: Input<O>,
        ClearIndicator: isReadOnly ? undefined : CustomClearIndicator<O>,
        ...props.components,
      }}
      value={value}
    />
  );
}

export default ReactSelectWrapper;
