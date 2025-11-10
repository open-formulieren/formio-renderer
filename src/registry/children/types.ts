import type {ChildDetails} from '@open-formulieren/types';

export type ExtendedChildDetails = ChildDetails & {
  // this is added only for the renderer and helps us to distinguish partners who are
  // added manually by the user from the authenticated, server fetched, partners.
  __addedManually?: true;
  // this is added only for the renderer and serves as a unique identifier for the
  // child. This is only used for manually added children.
  __id?: string;
  // distinguish a child selected by the user (checkbox) - this is used in the backend
  // too
  selected?: boolean;
};
