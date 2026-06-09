import type {FAQItem} from '@open-formulieren/types';
import {HTMLContent, Icon as UtrechtIcon} from '@utrecht/component-library-react';
import DOMPurify from 'dompurify';
import type {KeyboardEvent} from 'react';
import {useState} from 'react';

import Icon from '@/components/icons';

import Modal from '../modal';
import './FAQTooltip.scss';

export interface FAQTooltipProps {
  faqItem: FAQItem;
}

const FAQTooltip: React.FC<FAQTooltipProps> = ({faqItem}) => {
  const [isOpen, setIsOpen] = useState(false);

  const sanitizedContent = DOMPurify.sanitize(faqItem.content, {USE_PROFILES: {html: true}});
  const modalSheet = (
    <Modal
      title={faqItem.title}
      variant={'sheet'}
      closeModal={() => setIsOpen(false)}
      isOpen={isOpen}
    >
      <HTMLContent dangerouslySetInnerHTML={{__html: sanitizedContent}} />
    </Modal>
  );

  const dialogOpenKeys = ['Enter', 'Space'];
  return (
    <div
      role="button"
      tabIndex={0}
      className="openforms-faq-tooltip"
      onClick={() => setIsOpen(true)}
      onKeyDown={(event: KeyboardEvent) => dialogOpenKeys.includes(event.code) && setIsOpen(true)}
    >
      <UtrechtIcon>
        <Icon icon="tooltip" className="openforms-faq-tooltip__icon" />
      </UtrechtIcon>

      <span className="openforms-faq-tooltip__title">{faqItem.title}</span>

      {modalSheet}
    </div>
  );
};

export default FAQTooltip;
