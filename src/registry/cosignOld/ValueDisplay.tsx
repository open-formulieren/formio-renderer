import type {CosignV1ComponentSchema} from '@open-formulieren/types';
import {FormattedMessage} from 'react-intl';
import {useAsync} from 'react-use';

import LoadingIndicator from '@/components/LoadingIndicator';
import {useFormSettings} from '@/hooks';

export interface ValueDisplayProps {
  componentDefinition: CosignV1ComponentSchema;
}

const ValueDisplay: React.FC<ValueDisplayProps> = () => {
  const formSettings = useFormSettings();

  const getCosignStatus = formSettings?.componentParameters?.coSign?.getCosignStatus;

  const state = useAsync(getCosignStatus ?? (async () => {}));
  // log errors to the console if any
  if (state.error) console.error(state.error);
  // while loading, display spinner
  if (state.loading) return <LoadingIndicator size="small" />;

  const {representation} = state.value ?? {coSigned: false, representation: ''};

  // If `coSigned` is true and there is no representation (note that this *shouldn't* happen in
  // practice though), the user will have already gotten a message to contact the municipality. So
  // we just show a message that the submission was not co-signed.
  return (
    representation || (
      <FormattedMessage
        description="Not co-signed (summary) message"
        defaultMessage="Not co-signed"
      />
    )
  );
};

export default ValueDisplay;
