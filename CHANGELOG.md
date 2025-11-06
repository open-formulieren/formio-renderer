# Changes

## 0.12.0 (2025-11-06)

Feature release.

**Features**

- [`#107`][#107] Implemented the `signature` component type.
- [`OF#5548`][OF#5308] Changed appearance of "Add another button" to be less prominent in the
  `Editgrid` and `MultiField` components.
- [`#97`][#97] Implemented the `coSign` (v1/legacy) component type.
- [`#99`][#99] Implemented the `file` component type.

**Bugfixes**

- [`#122`][#122] Fixed an issue with item data not being available in isolation mode in edit grids.
- Fixed missing check implementation for currency and number component emptiness.

[#99]: https://github.com/open-formulieren/formio-renderer/issues/99
[OF#5548]: https://github.com/open-formulieren/open-forms/issues/5548
[#122]: https://github.com/open-formulieren/formio-renderer/issues/122
[#97]: https://github.com/open-formulieren/formio-renderer/issues/97
[#107]: https://github.com/open-formulieren/formio-renderer/issues/107

## 0.11.0 (2025-10-27)

Feature release.

**Features**

- [`#83`][#83] Implemented the `datetime` component type.
- [`#110`][#110] Implemented the `time` component type.
- [`#169`][#169] Added a modal component.
- [`#111`][#111] Implemented the `addressNL` component type, including a number of quality-of-life
  fixes that were previously not attainable:
  - Fixed asterisk/suffix display for required/optional fields.
  - Improved address derivation behaviour in combination with editable/readonly city/street fields.
- [`#104`][#104] Implemented the `postcode` component type.
- [`#119`][#119] Implemented the `partners` component type.
- [`#43`][#43] Added support for `{multiple: true}` multi-value fields for components that support
  it.
  - Fixes `maxLength` validation errors being reported for the list of values rather than being
    applied to the individual item ([`OF#5558`][OF#5558]).
  - Fixes validation triggering too soon when a new item is added ([`OF#5308`][OF#5308]).
  - Fixes multiple items being added on item add when `defaultValue` has more than 1 item
    ([`OF#1342`][OF#1342]).
- [`#76`][#76] Added support for async plugin validation for components that support it.

**Bugfixes**

- [`SDK#863`][SDK#863] Fixed crash when `editgrid.defaultValue` is set to `null`.
- [`SDK#863`][SDK#863] Fixed validation errors not being displayed for `currency` and `number`.
- [`SDK#863`][SDK#863] Fixed `selectboxes` labels displaying "not required" suffix when the required
  fields are not marked with an asterisk.
- Fixed potential accessibility issue by not using `label` tags inside fieldset `legend` elements.
- [`#171`][#171] Fixed (radio) fields inside edit grid items not being isolated from each other.

**Project maintenance**

- Ensure the `sr-only` class is defined.
- Mock the date/datetime in some stories for stable Chromatic snapshot behaviour.
- Added ESLint and fixed linting errors.
- Upgraded to NodeJS 24 (LTS).
- Updated the package publishing to use Trusted Publishing.
- Refactored i18n checks in CI to use reusable actions.

[#83]: https://github.com/open-formulieren/formio-renderer/issues/83
[SDK#863]: https://github.com/open-formulieren/open-forms-sdk/issues/863
[#110]: https://github.com/open-formulieren/formio-renderer/issues/110
[#169]: https://github.com/open-formulieren/formio-renderer/issues/169
[#111]: https://github.com/open-formulieren/formio-renderer/issues/111
[#171]: https://github.com/open-formulieren/formio-renderer/issues/171
[#104]: https://github.com/open-formulieren/formio-renderer/issues/104
[#43]: https://github.com/open-formulieren/formio-renderer/issues/43
[OF#5558]: https://github.com/open-formulieren/open-forms/issues/5558
[OF#5308]: https://github.com/open-formulieren/open-forms/issues/5308
[OF#1342]: https://github.com/open-formulieren/open-forms/issues/1342
[#76]: https://github.com/open-formulieren/formio-renderer/issues/76
[#119]: https://github.com/open-formulieren/formio-renderer/issues/119

## 0.10.0 (2025-09-29)

Small feature release.

- Ported the `disabledDates` prop for the datefield with datepicker widget.

## 0.9.0 (2025-09-09)

Feature release.

- [`#82`][#82] Implemented date picker for the `date` component type.
- Fixed handling of `component.conditional` produced by formio.js builder which violates its type
  definitions.

[#82]: https://github.com/open-formulieren/formio-renderer/issues/82

## 0.8.2 (2025-09-04)

Added the missing (Dutch) translations.

## 0.8.1 (2025-09-03)

Bugfix release.

- Fixed missing `Select` export (low-level component).
- Fixed missing `isLoading` prop for the `Select` component.

## 0.8.0 (2025-09-02)

Feature release.

- Added support for rendering user-supplied strings with ICU message format.
- [`#108`][#108] Implemented the `softRequiredErrors` component type.
- [`#81`][#81] Implemented the `currency` component type.
- [`#97`][#97] Implemented the `cosign` (v2) component type.
- [`#79`][#79] Added `onChange` prop to `FormioForm` component, receiving the updated form field
  values.
- [`#82`][#82] Ported the `FloatingWidget` from the SDK.
- [`#105`][#105] Implemented the `select` component type.

[#108]: https://github.com/open-formulieren/formio-renderer/issues/108
[#81]: https://github.com/open-formulieren/formio-renderer/issues/81
[#97]: https://github.com/open-formulieren/formio-renderer/issues/97
[#79]: https://github.com/open-formulieren/formio-renderer/issues/79
[#82]: https://github.com/open-formulieren/formio-renderer/issues/82
[#105]: https://github.com/open-formulieren/formio-renderer/issues/105

## 0.7.0 (2025-08-19)

Feature release with some architectural rework.

**💥 Breaking changes**

The low-level `EditGrid` component no longer accepts a `getItemValidationSchema` prop. This has been
replaced with the `validate` prop. This change is necessary to be able to dynamically update the
schema depending on the currently visible fields.

**Features**

- [`#100`][#100] Implemented the `iban` component type.
- [`#73`][#73] Implemented the `content` component type, now built on top of the `utrecht-html` NL
  Design System component.
- [`#59`][#59] Added support for the `clearOnHide` component configuration option.
- [`#101`][#101] Implemented the `licenseplate` component type.
- [`#109`][#109] Implemented the `textarea` component type.
- [`#103`][#103] Implemented the `number` component type.

**Bugfixes**

- [`#133`][#133], [`#141`][#141] Fixed two situations where infinite renders could happen with
  nested edit grids.

**Project maintenance**

- Added CI check for outdated i18n messages.
- [`#127`][#127] Upgraded to Storybook 9.
- [`#127`][#127] Added code coverage instrumentation and reporting.

[#100]: https://github.com/open-formulieren/formio-renderer/issues/100
[#73]: https://github.com/open-formulieren/formio-renderer/issues/73
[#59]: https://github.com/open-formulieren/formio-renderer/issues/100
[#101]: https://github.com/open-formulieren/formio-renderer/issues/101
[#133]: https://github.com/open-formulieren/formio-renderer/issues/133
[#109]: https://github.com/open-formulieren/formio-renderer/issues/109
[#127]: https://github.com/open-formulieren/formio-renderer/issues/127
[#141]: https://github.com/open-formulieren/formio-renderer/issues/141
[#103]: https://github.com/open-formulieren/formio-renderer/issues/103

## 0.6.1 (2025-06-03)

Fixed a packaging bug which caused the type declarations to be omitted.

## 0.6.0 (2025-06-03)

Feature release.

- Updated label markup to prevent invalid HTML being rendered.
- [`#93`][#93] Added tooltip component and enable it for the relevant formio components.
- [`#78`][#78] Added ability to imperatively set the form values and validation errors.
- [`#72`][#72] Implemented the `columns` component type.
- [`#59`][#59] Support simple conditional logic in `editgrid` components.
- Added preview function in storybook for real form definitions.
- [`#71`][#71] Implemented the `checkbox` component type.
- [`#106`][#106] Implemented the `selecboxes` component type.

[#93]: https://github.com/open-formulieren/formio-renderer/issues/93
[#78]: https://github.com/open-formulieren/formio-renderer/issues/78
[#72]: https://github.com/open-formulieren/formio-renderer/issues/72
[#59]: https://github.com/open-formulieren/formio-renderer/issues/59
[#71]: https://github.com/open-formulieren/formio-renderer/issues/71
[#106]: https://github.com/open-formulieren/formio-renderer/issues/106
