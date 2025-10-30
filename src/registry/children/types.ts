import type {ChildDetails} from '@open-formulieren/types';

export type ExtendedChildDetails = ChildDetails & {
  // this is added only for the renderer and helps us to distinguish partners who are
  // added manually by the user from the authenticated, server fetched, partners.
  __addedManually: true;
  // distinguish a child selected by the user (checkbox) - this is used in the backend
  // too
  selected?: boolean;
};
