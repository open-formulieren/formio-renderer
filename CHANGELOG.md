# Changes

## 1.0.0-rc.0 (2025-12-23)

First release candidate for the stable 1.0.0 release.

**API changes**

- [`#138`][#138] Internal components now use explicit `isReadOnly` semantics rather than
  `isDisabled`. This should vastly improve the experience for screen reader users.

**Bugfixes**

- [`#263`][#263] Fixed char count being displayed if no text was entered yet.
- [`#274`][#274] Fixed the date and datepicker fields triggering validation too soon on blur.

**Project maintenance**

- Updated the documentation (storybook) landing page.
- Added contributing guidelines.
- Defined codeowners in Github (initial pass).

[#263]: https://github.comm/open-formulieren/formio-renderer/issues/263
[#138]: https://github.comm/open-formulieren/formio-renderer/issues/138
[#274]: https://github.comm/open-formulieren/formio-renderer/issues/274

## 1.0.0-beta.4 (2025-12-22)

Fifth beta version for the stable 1.0.0 release.

**Bugfixes**

- [`#265`][#265] Fixed disabled date/datetime fields not disabling the date picker trigger.
- [`#268`][#268] Fixed missing "add" icon in the `partners` and `children` component's "add button".
- [`#270`][#270] Fixed option descriptions not being displayed in `radio` components.
- [`#267`][#267] Fixed modals opening scrolling the page to the top.

[#268]: https://github.com/open-formulieren/formio-renderer/issues/268
[#270]: https://github.com/open-formulieren/formio-renderer/issues/270
[#267]: https://github.com/open-formulieren/formio-renderer/issues/267

## 1.0.0-beta.3 (2025-12-19)

Fourth beta version for the stable 1.0.0 release.

**Bugfixes**

- [`OF#5823`][OF#5823] Fixed mismatch in expected API interaction for `customerProfile` component.
- [`#242`][#242] Fixed incorrect year being displayed in the datepicker calendar.
- Fixed missing date mock causing Chromatic to detect changes every build.
- [`OF#5829`][OF#5829] Fixed the `customerProfile` input not properly being displayed between
  re-mounts.
- [`OF#5824`][OF#5824] Fixed the preferences modal being show in the `customerProfile` for
  non-logged in users.

[OF#5823]: https://github.com/open-formulieren/open-forms/issues/5823
[#242]: https://github.com/open-formulieren/formio-renderer/issues/242
[OF#5829]: https://github.com/open-formulieren/open-forms/issues/5829
[OF#5824]: https://github.com/open-formulieren/open-forms/issues/5824

## 1.0.0-beta.2 (2025-12-16)

Third beta version for the stable 1.0.0 release.

**Bugfixes**

- Fixed (peer) dependencies not being correctly specified, which messed up the package build.
- Fixed `leaflet` import in `LeafletMap` component to ensure that `L.Draw` is not undefined.
- Fixed `customerProfile` component incorrectly displaying a portal URL when nothing is configured.

## 1.0.0-beta.1 (2025-12-15)

Second beta version for the stable 1.0.0 release.

**Bugfixes**

- [`#231`][#231] Fixed accessibility issues in the `select` component:
  - The "clear" button is now accessible with keyboard navigation.
  - The "clear" button focus outline contrast issue is resolved.
- [`#237`][#237] Fixed clearing the `number` and `currency` display value when the field value is
  cleared.
- [`#245`][#245] Fixed timezone information in `datetime` fields being ignored.
- Fixed crash in `customerProfile` component when the `defaultValue` is `null`.
- [`#186`][#186] Fixed inconsistent `isEmpty` behaviour across different component types.
- [`#244`][#244] Fixed accesible label regression in the `number` component when a prefix or suffix
  are used.
- [`SDK#863`][SDK#863] Fixed the user interaction for `date` and `datetime` components with the
  datepicker. Focusing the input no longer opens the dialog - the calendar icon must now be used as
  trigger.

**Project maintenance**

- The registry types now ensure all component types from `@open-formulieren/types` are implemented.
- Updated project status in the README.
- [`#224`][#224] Internal/private properties now have a consistent naming style.
- Documented the available design tokens for theme designers.
- [`#217`][#217] Configured coverage status to be informational so that it doesn't fail the build.

[#224]: https://github.com/open-formulieren/formio-renderer/issues/224
[#231]: https://github.com/open-formulieren/formio-renderer/issues/231
[#237]: https://github.com/open-formulieren/formio-renderer/issues/237
[#245]: https://github.com/open-formulieren/formio-renderer/issues/245
[#186]: https://github.com/open-formulieren/formio-renderer/issues/186
[#244]: https://github.com/open-formulieren/formio-renderer/issues/244
[SDK#863]: https://github.com/open-formulieren/open-forms-sdk/issues/863
[#217]: https://github.com/open-formulieren/formio-renderer/issues/217

## 1.0.0-beta.0 (2025-12-02)

First beta version for the stable 1.0.0 release.

The renderer is now feature complete, entering bug-fixing mode before we release 1.0 final.

**Features**

- [`#178`][#178] Implemented the `customerProfile` component type.

**Bugfixes**

- [`#229`][#229] Fixed the multi-value `select` component having a different height compared to the
  single-value variant.

[#178]: https://github.com/open-formulieren/formio-renderer/issues/178
[#229]: https://github.com/open-formulieren/formio-renderer/issues/229

## 0.14.1 (2025-11-28)

Fixed package export to prevent leaflet from ending up in the main bundle.

## 0.14.0 (2025-11-28)

Feature release.

The next release will start the 1.0.0 release process and will most likely be a beta.

**Features**

- [`#102`][#102] Implemented the `map` component type.
- [`#77`][#77] Added support custom validation error messages and polished the default messages.
- [`#36`][#36] Added editgrid item validation for unsaved rows.
  - The item-level validation errors are now displayed for the item as a whole, which was previously
    not possible.
- [`#221`][#221] Unchecked checkboxes in the `selectboxes` component are now disabled when the
  maximum amount of selections is reached.

**Bugfixes**

- [`#218`][#218] Fixed validation triggering too soon in `radio`, `date` and `datetime` components.
- Fixed <kbd>Enter</kbd> key not submitting the datetime when the picker is open.
- [`#36`][#36] Fixed remove/cancel button behaviour for edit grid item in edit mode.
- Fixed dotted keys not resulting in a nested object structure for empty/new edit grid items.
- [`SDK#863`][SDK#863] The WYSIWYG content for the `softRequiredErrors` component processing is now
  more robust and supports additional markup elements.

**Project maintenance**

- Added consistent (type) import checking to the ESLint configuration.
- Vitest now uses the V8 coverage provider.
- Addressed some test flakiness.

[#102]: https://github.com/open-formulieren/formio-renderer/issues/102
[#77]: https://github.com/open-formulieren/formio-renderer/issues/77
[#218]: https://github.com/open-formulieren/formio-renderer/issues/218
[#36]: https://github.com/open-formulieren/formio-renderer/issues/36
[#221]: https://github.com/open-formulieren/formio-renderer/issues/221
[SDK#863]: https://github.com/open-formulieren/open-forms-sdk/issues/863

## 0.13.0 (2025-11-20)

Feature release.

**Features**

- [`#206`][#206] Modals are now rendered with a portal in a different DOM node.
- [`#130`][#130] The textfield component now supports displaying the character count.
- [`OF#5460`][OF#5460] Improved the accessibility of the character count display.
- The modal component is now exported and semi-public API.
- We now provide `UtrechtButton` wrappers which handle the `disabled` prop with the correct
  accessibility requirements.
- [`#181`][#181] Implemented the email verification flow for the `email` component.
- [`#122`][#122] Implemented the `children` component type.

**Bugfixes**

- [`#205`][#205] Added a workaround to ensure outlines of interactive elements are visible in
  modals.
- Fixed a typo in the translations.

**Project maintenance**

- Fixed loading the font assets on the Github pages hosted Storybook.
- Cleaned up debug output and stale TODOs.
- Added more useful `README.md` content that reflects the scope of this package.

[#206]: https://github.com/open-formulieren/formio-renderer/issues/206
[#205]: https://github.com/open-formulieren/formio-renderer/issues/205
[#130]: https://github.com/open-formulieren/formio-renderer/issues/130
[OF#5460]: https://github.com/open-formulieren/open-forms/issues/5460
[#181]: https://github.com/open-formulieren/formio-renderer/issues/181
[#122]: https://github.com/open-formulieren/formio-renderer/issues/122

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
