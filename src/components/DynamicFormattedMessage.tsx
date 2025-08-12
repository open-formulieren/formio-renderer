import type {MessageFormatElement} from '@formatjs/icu-messageformat-parser';
import {formatMessage as coreFormatMessage} from '@formatjs/intl';
import type {ResolvedIntlConfig} from '@formatjs/intl/src/types';
import {DEFAULT_INTL_CONFIG} from '@formatjs/intl/src/utils';
import React, {useId} from 'react';
import {MessageDescriptor, useIntl} from 'react-intl';

interface DynamicFormattedMessageProps {
  description: string | object;
  defaultMessage: string | MessageFormatElement[];
  values?: Record<string, any>;
}

// List of HTML tags that are automatically transformed to HTML elements.
const ALLOWED_HTML_TAGS = ['p', 'b', 'u', 'i'];

/**
 * A custom implementation of the react-intl `FormattedMessage` for dynamically defined
 * messages.
 *
 * The react-intl `FormattedMessage` (and `useIntl().formatMessage`, for that matter),
 * don't allow dynamic messages, as they required the messages to be statically
 * evaluate-able https://github.com/formatjs/babel-plugin-react-intl/issues/119.
 * This custom implementation bypasses the evaluation, allowing dynamic messages.
 *
 * For rendering translations, you should use `FormattedMessage` or
 * `useIntl().formatMessage`. DynamicFormattedMessage should only be used for more
 * dynamic situations, like rendering rich text.
 */
const DynamicFormattedMessage: React.FC<DynamicFormattedMessageProps> = ({
  description,
  defaultMessage,
  values,
}) => {
  const id = useId();
  // Fetch the intl config, and use it for the Wrapper
  const intl = useIntl();

  const mapOfAllowedTags = Object.fromEntries(
    ALLOWED_HTML_TAGS.map(tag => [
      tag,
      (chunks: React.ReactNode[]) => React.createElement(tag, {}, ...chunks),
    ])
  );

  const resolvedConfig: ResolvedIntlConfig<React.ReactNode> = {
    ...DEFAULT_INTL_CONFIG,
    ...intl,
    ...{
      defaultRichTextElements: {
        ...mapOfAllowedTags,
      },
    },
  };

  const chunks = coreFormatMessage(
    resolvedConfig,
    intl.formatters,
    {
      id,
      description,
      defaultMessage,
    } satisfies MessageDescriptor,
    values
  ) as React.ReactNode | React.ReactNode[];

  if (Array.isArray(chunks)) {
    return React.Children.toArray(chunks);
  }
  return chunks;
};
export default DynamicFormattedMessage;
