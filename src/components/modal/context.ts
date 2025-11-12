import {createContext} from 'react';

export interface ModalContextType {
  parentSelector?: () => HTMLElement;
}

const ModalContext = createContext<ModalContextType>({});
ModalContext.displayName = 'ModalContext';

export default ModalContext;
