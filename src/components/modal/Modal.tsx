import {SubtleButton} from '@utrecht/component-library-react';
import {useEffect, useId, useRef} from 'react';
import {useIntl} from 'react-intl';

import Icon from '@/components/icons';

import './Modal.scss';

// @TODO is this needed? Or does the HTMl dialog handle this natively?
// Copied logic from the current SDK implementation.
// Used to prevent scrolling in the page, when the modal is open.
const usePreventScroll = (open: boolean): void => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);
};

export interface ModalProps {
  isOpen?: boolean;
  title?: React.ReactNode;
  closeModal: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({isOpen = false, title, closeModal, children}) => {
  usePreventScroll(isOpen);
  const id = useId();
  const intl = useIntl();
  const modalRef = useRef<HTMLDialogElement>(null);

  const closeButtonLabel = intl.formatMessage({
    description: 'Modal close button title',
    defaultMessage: 'Close modal',
  });

  // To open the dialog as a modal, we need to trigger its javascript functions.
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) {
      return;
    }

    isOpen ? modal.showModal() : modal.close();
  }, [isOpen]);

  return (
    <dialog
      className="modal"
      ref={modalRef}
      aria-labelledby={id && title ? id : undefined}
      onClose={closeModal}
    >
      {title && (
        <h2 className="modal__title" id={id}>
          {title}
        </h2>
      )}

      <SubtleButton
        className="modal__close"
        type="button"
        onClick={closeModal}
        aria-label={closeButtonLabel}
        autofocus
      >
        <Icon icon="close" aria-hidden />
      </SubtleButton>

      <div className="modal__body">{children}</div>
    </dialog>
  );
};

export default Modal;
