import {Paragraph} from '@utrecht/component-library-react';
import {FormattedMessage} from 'react-intl';

import {useDebounce} from '@/hooks';

import './CharCount.scss';

export interface CharCountProps {
  /**
   * HTML ID for the node showing the description so that it can be included in the
   * `aria-describedby` attribute.
   */
  id: string;
  /**
   * The text/value to count the number of characters of.
   *
   * Pass `undefined` if no value is set at all (yet), which prevents anything from
   * being displayed.
   */
  text: string | undefined;
  /**
   * Optional upper bound to the number of characters. If provided, the displayed text
   * reports the remaining number of characters.
   */
  limit?: number;
}

/**
 * Display the number of character used or remaining.
 *
 * If a limit is passed, the number of remaining characters are displayed, otherwise
 * just the total count.
 *
 * @see {@link https://design-system.service.gov.uk/components/character-count/ UK Gov documentation}
 */
const CharCount: React.FC<CharCountProps> = ({id, text, limit}) => {
  const hasText = text !== undefined;
  const textLength = text?.length || 0;
  const content =
    limit !== undefined ? (
      <FormattedMessage
        description="Character remaining count"
        defaultMessage={`{remainingCharCount, plural,
          one {1 character remaining}
          other {{remainingCharCount} characters remaining}
        }`}
        values={{remainingCharCount: limit - textLength}}
      />
    ) : (
      <FormattedMessage
        description="Character count"
        defaultMessage={`{charCount, plural,
          one {1 character}
          other {{charCount} characters}
        }`}
        values={{charCount: textLength}}
      />
    );

  // typing normally triggers updates every 50-150ms. To prevent spamming the
  // screenreader, use a safe debounce interval.
  // TODO: validate with user tests!
  const debouncedContent = useDebounce(content, 750);

  return (
    <>
      {/* Visual feedback, hidden from screen readers to reduce noise */}
      {hasText && (
        <Paragraph aria-hidden="true" className="openforms-charcount">
          {content}
        </Paragraph>
      )}
      {/* Visually hidden screenreader announcement.
          TODO: debounce updates. Note that the element must always be in the DOM, even
          if nothing is reported, otherwise screenreaders may not pick up updates
          properly. */}
      <span id={id} className="sr-only" role="status">
        {hasText && debouncedContent}
      </span>
    </>
  );
};

export default CharCount;
