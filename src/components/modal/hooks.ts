import {useContext} from 'react';

import ModalContext from './context';
import type {ModalContextType} from './context';

// by default, append the dialog to the body
const defaultParentSelector: ModalContextType['parentSelector'] = () => document.body;

export const useModalContext = (): Required<ModalContextType> => {
  const {parentSelector = defaultParentSelector} = useContext(ModalContext);
  return {parentSelector};
};
