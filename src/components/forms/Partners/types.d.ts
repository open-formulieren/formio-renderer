import type {PartnerDetails} from '@open-formulieren/types';

export type ManuallyAddedPartnerDetails = PartnerDetails & {
  // this is added only for the SDK and helps us to distinguish partners who are added
  // manually by the user from the authenticated, server fetched, partners
  __addedManually: true;
};
