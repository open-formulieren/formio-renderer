import type {ChildDetails} from '@open-formulieren/types';

/**
 * A subset of the Formik state/values, scoped to the data belonging to the Children
 * component.
 *
 * The string key index matches the `component.key` type, which *could* be a string with
 * periods, creating a nested object structure.
 */
export type FormValues = {
  [k: string]: ExtendedChildDetails[] | FormValues;
};

export type ExtendedChildDetails = ChildDetails & {
  // this is added only for the renderer and helps us to distinguish partners who are
  // added manually by the user from the authenticated, server fetched, partners.
  _OF_INTERNAL_addedManually?: true;
  // this is added only for the renderer and serves as a unique identifier for the
  // child. This is only used for manually added children.
  _OF_INTERNAL_id?: string;
  // distinguish a child selected by the user (checkbox) - this is used in the backend
  // too
  selected?: boolean;
};
