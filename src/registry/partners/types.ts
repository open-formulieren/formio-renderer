import type {PartnerDetails} from '@open-formulieren/types/dist/components/partners';

export type ManuallyAddedPartnerDetails = PartnerDetails & {
  // this is added only for the renderer and helps us to distinguish partners who are
  // added manually by the user from the authenticated, server fetched, partners.
  _OF_INTERNAL_addedManually: true;
};
